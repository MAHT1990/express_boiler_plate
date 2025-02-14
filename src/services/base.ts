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


export abstract class BaseService<TargetEntity> extends EventEmitter {

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
     * id(Primary Key)와 relation 을 받아서 데이터를 조회
     *
     * @params id
     *  - number - 단일 객체의 id (ex. 28)
     *  - object - multi PK 를 사용할 경우 object 를 사용한다. (ex. { id: 28, name: "test" })
     *  - string - id 가 여러개일 경우, 콤마(,)로 구분하여 문자열로 전달한다. (ex. "111,22,33,4")
     *
     * @param params.select - 조회할 컬럼을 설정할 때 사용
     * - ex. ["id", "name"]
     * - ex. { id: true, name: true }
     *
     * @param params.relations - 관계를 설정할 때 사용
     * - ex. ["user", "user.profile"]
     * - ex. { user: true, profile: { phone: true }}
     *
     * @param params.callback 콜백 함수 (data: TargetEntity | TargetEntity[]) => Promise<TargetEntity | TargetEntity[]>
     */
    public async findById(
        id: number | string | FindDto<TargetEntity> | FindDto<TargetEntity>[],
        params?: {
            select?: string[] | FindOptionsSelect<TargetEntity>;
            relations?: string[] | FindOptionsRelations<TargetEntity>;
            callback?: (data: TargetEntity | TargetEntity[]) => any;
            withDeleted?: boolean;
        },
    ): Promise<IResponse> {
        let findOption: FindManyOptions;
        let isMultiple = false;

        /* id가 배열일 경우 */
        if (Array.isArray(id)) {
            findOption = { where: id };
            isMultiple = id.length > 1;
        }

        /* id가 객체일 경우 */
        if (!Array.isArray(id) && typeof id === "object") {
            findOption = { where: id };
        }

        /* id가 ( , )로 구분된 문자열일 경우: "1,2,3,4" */
        if (typeof id === "string") {
            const ids = String(id)
                .split(",")
                .map(id => id.trim());

            if (ids.some(id => isNaN(Number(id)))) {
                return this.serviceResponse({ type: "invalid" });
            }

            if (ids.length > 1) {
                findOption = { where: { _id: In(ids.map(Number)) } };
                isMultiple = true;
            } else {
                findOption = { where: { _id: Number(id) } };
            }
        }

        /* id가 숫자일 경우 */
        if (typeof id === "number") {
            findOption = { where: { _id: id } };
        }

        findOption.withDeleted = params?.withDeleted;

        this.setFindOptionByRelations(findOption, params?.relations);
        this.setFindOptionBySelect(findOption, params?.select);

        const rawData: TargetEntity[] = await this.repositorySlave.find(findOption);

        if (rawData.length === 0) return this.serviceResponse({ type: "notFound" });

        let result: TargetEntity | TargetEntity[] = isMultiple ? rawData : rawData[0];

        if (params?.callback) result = await params.callback(result);

        return this.serviceResponse({
            type: "fetched",
            data: result,
        });
    }

    /**
     * 단일 객체 혹은 단일 객체의 배열을 받아서 저장하는 메소드.
     */
    public async create(
        createDto: CreateDto<TargetEntity> | CreateDto<TargetEntity>[],
        callback?: (data: TargetEntity | TargetEntity[]) => any,
    ): Promise<IResponse> {
        let result: TargetEntity | TargetEntity[];

        if (Array.isArray(createDto)) {
            const promises = createDto.map(async dto => {
                return await this.repositoryMaster.save(dto);
            });

            result = (await Promise.all(promises)) as TargetEntity[];

            if (callback) {
                result = await callback(result);
            }

            // TODO: 부분 성공시, 어떻게 처리할지 고민해보기

            return this.serviceResponse({ type: "created", data: result });
        }

        result = (await this.repositoryMaster.save(createDto)) as TargetEntity;

        if (callback) {
            result = await callback(result);
        }

        return this.serviceResponse({ type: "created", data: result });
    }

    /**
     * id(Primary Key) 와 수정할 객체를 받아서 수정하는 메소드.
     *
     * @param id - 수정할 객체의 id, multi PK 를 사용할 경우 object 를 사용한다.
     * @param updateDto - 수정할 객체의 데이터
     * @param options - preload 옵션을 사용할 경우, preload: true 로 설정한다.
     */
    public async updateById(
        id: number | object,
        updateDto: UpdateDto<TargetEntity>,
        options?: {
            preload?: boolean;
            callback?: (data: TargetEntity) => any;
        },
    ): Promise<IResponse> {
        /* Update 된 객체를 반환해야하는 경우. */
        if (options?.preload) {
            if (typeof id === "number") (updateDto as any)._id = id;
            if (typeof id === "object") updateDto = { ...id, ...updateDto };

            const target = await this.repositoryMaster.preload(updateDto);

            if (!target) {
                return this.serviceResponse({ type: "notFound" });
            }

            const rawData: TargetEntity = await this.repositoryMaster.save(target);

            let result = rawData;

            if (options?.callback) {
                result = await options.callback(rawData);
            }

            return this.serviceResponse({ type: "updated", data: result });
        }

        const result: UpdateResult = await this.repositoryMaster.update(id, updateDto);

        if (result.affected === 0) {
            return this.serviceResponse({ type: "notFound" });
        }

        return this.serviceResponse({ type: "updated" });
    }

    /**
     * id(Primary Key)를 받아서 삭제하는 메소드.
     * - id 값이 여러개일 경우, 콤마(,)로 구분하여 문자열로 전달한다.
     * - id 가 숫자일 경우, 숫자로 전달한다.
     * - id 가 객체일 경우, 객체(multi PK)로 전달한다.
     * - id 가 객체의 배열일 경우, 배열로 전달한다.
     *
     * @param id - 삭제할 객체의 id, multi PK 를 사용할 경우 object 를 사용한다.
     * @param options - recursive 옵션을 사용할 경우, recursive: true 로 설정한다.
     *
     * @see recursiveSoftDelete - 참조하는 테이블까지 softDelete 하는 메소드
     */
    public async deleteById(
        id: number | string | UpdateDto<TargetEntity> | UpdateDto<TargetEntity>[],
        options?: { recursive?: boolean }
    ): Promise<IResponse> {
        let target: number | object | string[];

        // ex) id = '1,2,3'
        if (typeof id === "string") target = id.split(",")
            .map(id => id.trim())
            .map(Number);

        if (typeof id === "number" || typeof id === "object") target = id;

        if (options?.recursive && (typeof id === "number" || Array.isArray(id))) {
            return await this.recursiveSoftDelete(target as (number | number[]));
        }

        const result: UpdateResult = await this.repositoryMaster.softDelete(target);

        if (result.affected === 0) {
            return this.serviceResponse({ type: "notFound" });
        }

        return this.serviceResponse({ type: "deleted" });
    }

    /**
     * 존재하는 데이터인지 확인 하는 메서드
     *
     * 배열인 경우 하나의 값이라도 존재하지 않는 경우 false 반환
     * */
    public async exists(id: number | object | string): Promise<boolean> {
        let target: object;

        if (typeof id === "number") target = { _id: id };

        if (Array.isArray(id)) {
            target = { _id: In(id) };

            const count = await this.repositorySlave.count({ where: target });

            return count === id.length;
        }

        if (typeof id === "object") target = id;

        return this.repositorySlave.exists(target);
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

    /**
     * softDelete 를 recursive 하게 수행하는 메소드
     *
     * @memberof deleteById
     */
    protected async recursiveSoftDelete(
        targetIds: number | number[],
    ): Promise<IResponse> {

        /* 내부 재귀 함수 */
        const innerRecursiveSofeDelete = async (
            masterSource: DataSource,
            tableName: string,
            targetIds: number[],
            transactionManager: EntityManager
        ) => {

            /* 테이블명을 통해 해당 테이블의 메타데이터 조회 */
            const metadata: EntityMetadata = masterSource.getMetadata(tableName);
            const entity = metadata.target;

            /* 참조하고있는 테이블 탐색 */
            const relatedMetadatas = masterSource.entityMetadatas.filter(meta => {
                return meta.foreignKeys.some(fk => fk.referencedEntityMetadata.tableName === tableName);
            });

            /* 해당테이블을 참조하고있는 테이블 순회(재귀) */
            for (const relatedMetadata of relatedMetadatas) {
                const relatedTableName = relatedMetadata.tableName;
                const relatedTargetIds = (await masterSource.getRepository(relatedTableName)
                    .find({ where: { [`${metadata.tableName}Id`]: In(targetIds) },
                        withDeleted: true,
                    })).map(target => target._id);

                if (relatedTargetIds.length > 0) {
                    await innerRecursiveSofeDelete(masterSource, relatedTableName, relatedTargetIds, transactionManager);
                }
            }

            /* 가장 말단부터 삭제 */
            await transactionManager.softDelete(entity, targetIds);
        };

        return await this.masterSource.transaction(async (transactionManager: EntityManager) => {

            const tableName = this.masterSource.getMetadata(this.repositoryMaster.target).tableName;
            const modifiedTargetIds = Array.isArray(targetIds) ? targetIds : [targetIds];
            await innerRecursiveSofeDelete(
                this.masterSource,
                tableName,
                modifiedTargetIds,
                transactionManager
            );

            return this.serviceResponse({ type: "deleted" });

        }).catch(err => {
            return this.serviceResponse({ type: "invalid", message: err.message });
        });
    }
}