/* BUILT-IN MODULES */
import EventEmitter from "node:events";

/* THIRD-PARTY MODULES */
import {
    In,
    DataSource,
    EntityManager,
    EntityMetadata,
    FindManyOptions,
    FindOneOptions,
    FindOptionsRelations,
    FindOptionsSelect,
    FindOptionsWhere,
    Repository,
    UpdateResult,
    SelectQueryBuilder,
} from "typeorm";

/* INTERFACES */
import { IResponse, IResponseMaker } from "../types/utils/response/IResponse";
import { CreateDto, FindDto, UpdateDto } from "../types/dto/base.dto";


export default abstract class BaseService<TargetEntity> extends EventEmitter {

    protected readonly masterSource: DataSource;

    protected readonly repositoryMaster: Repository<TargetEntity> & { [func: string]: (...args: any[]) => any };

    protected readonly repositorySlave: Repository<TargetEntity> & { [func: string]: (...args: any[]) => any };

    protected readonly serviceResponse: IResponseMaker;

    constructor(params: {
        repositoryMaster,
        repositorySlave,
        serviceResponse,
        masterSource?: DataSource,
    }) {
        super();

        this.repositoryMaster = params.repositoryMaster;
        this.repositorySlave = params.repositorySlave;
        this.serviceResponse = params.serviceResponse;
        this.masterSource = params.masterSource
    }

    public async findBy(option?: {
        queries?: FindDto<TargetEntity>;
        select?: string[] | FindOptionsSelect<TargetEntity>;
        relations?: string[] | FindOptionsRelations<TargetEntity>;
        withDeleted?: boolean;
        count?: boolean;
        single?: boolean;
        callback?: (data: TargetEntity[] | TargetEntity) => any;
    }): Promise<IResponse> {

        let result: TargetEntity | TargetEntity[] | {
            count: number;
            items: TargetEntity[];
            nextPage: number;
        };

        /* SetOptions */
        const findOption: FindManyOptions = { withDeleted: option?.withDeleted };
        this.setFindOptionBySelect(findOption, option?.select);
        this.setFindOptionByQueries(findOption, option?.queries);
        this.setFindOptionByRelations(findOption, option?.relations);

        /* count(개수)가 필요한 경우
         * 1. Pagination 관련 필드 무시 && 검색 조건 해당 데이터 개수 반환
         * 
         * 2-1. Pagination 관련 필드(page, limit) 존재 하는 경우.
         *  - 관련 피륻 반영, nextPage 값 결과에 삽입.
         *  - { items: data, count: dataCount, nextPage: nextPage }
         * 
         * 2-2. Pagination 관련 필드(page, limit) 존재 하지 않는 경우.
         *  - count 만 반환
         *  - { items: data, count: dataCount }
         */
        if (option?.count) {
            const { skip, take, ...filteredOptions } = findOption;

            const rawData = await this.repositorySlave.find(findOption);
            const dataCount = await this.repositorySlave.count(filteredOptions as FindManyOptions);

            let data = rawData;
            let nextPage = undefined;

            if (option?.callback) data = await option.callback(rawData);

            if (option?.queries?.page && option?.queries?.limit) {
                nextPage = this.setNextPage(option.queries, dataCount);
            }

            result = { items: data, count: dataCount, nextPage };
        }

        /* count가 필요하지 않은 경우 */
        else {
            const rawData: TargetEntity[] = await this.repositorySlave.find(findOption);

            result = option?.callback ? await option.callback(rawData) : rawData;
        }

        /* 단일 객체 조회시 */
        if (option?.single) {
            if (Array.isArray(result)) {
                if (result.length === 0) return this.serviceResponse({ type: "notFound" });
            }
            result = result[0];
        }

        return this.serviceResponse({ type: "fetched", data: result });
    }

    /**
     * query 를 통하여 FindOption 수정.
     * - page: number - 페이지 번호
     * - limit: number - 페이지 당 아이템 수
     * - sort: string - 정렬 기준 (ex. "createdAt, -updatedAt")
     * - whereOptions: object - 검색 조건
     */
    protected setFindOptionByQueries(
        findOption: FindManyOptions | FindOneOptions,
        queries: FindDto<TargetEntity>
    ): void {
        if (queries && Object.keys(queries).length > 0) {
            const { page, limit, sort, ...whereOptions } = queries;

            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            
            /* 기존 where 조건 유지 && 새로운 where 조건 추가 */
            findOption["where"] = {
                ...findOption["where"],
                ...(whereOptions as FindOptionsWhere<TargetEntity>),
            };

            /* Pagination */
            if (!isNaN(skip) && !isNaN(take)) {
                findOption["skip"] = skip;
                findOption["take"] = take;
            }

            /* Sort ex. "createdAt, -updatedAt" */
            if (sort) {
                const sortFields = sort.split(",").map(field => field.trim());

                const order = sortFields.reduce((acc, field) => {
                    if (field.startsWith("-")) acc[field.substring(1)] = "DESC";
                    else acc[field] = "ASC";
                    return acc;
                }, {});

                findOption["order"] = order;
            }
        }
    }

    /**
     * select 를 통하여 FindOption 수정.
     */
    protected setFindOptionBySelect(
        findOption: FindManyOptions | FindOneOptions,
        select: string[] | FindOptionsSelect<TargetEntity>
    ): void {
        if (Array.isArray(select) && select.length > 0) {
            findOption["select"] = select;
            return;
        }

        if (select instanceof Object && Object.keys(select).length > 0) {
            findOption["select"] = select;
        }
    }

    /**
     * relations 를 통하여 FindOption 수정.
     */
    protected setFindOptionByRelations(
        findOption: FindManyOptions | FindOneOptions,
        relations: string[] | FindOptionsRelations<TargetEntity>
    ): void {
        if (Array.isArray(relations) && relations.length > 0) {
            findOption["relations"] = relations;
            return;
        }

        if (relations instanceof Object && Object.keys(relations).length > 0) {
            findOption["relations"] = relations;
        }
    }

    /**
     * 다음 페이지가 존재하는지 확인 후 존재하는 경우 다음 페이지 번호 반환.
     * 다음 페이지가 존재하지 않으면, 1 반환.
     * 
     * @param queries - page?, limit?
     * @param dataCount - 총 데이터 개수
     */
    protected setNextPage<T extends { page?: string | number; limit?: string | number }>(
        queries: T,
        dataCount: number
    ): number {
        const page: number = Number(queries.page);
        const limit: number = Number(queries.limit);
        const offset: number = (page - 1) * limit;
        const hasNextPage: boolean = dataCount > offset + limit;

        return hasNextPage ? page + 1 : 1;
    }
}