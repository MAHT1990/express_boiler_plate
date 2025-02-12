/* THIRD-PARTY MODULES */
import { DeepPartial, FindOperator } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

/**
 * Entity 별 create DTO Type
 */
export type CreateDto<Entity> = DeepPartial<Entity> & Record<string, any>;

/**
 * Entity 별 update DTO Type
 */
export type UpdateDto<Entity> = QueryDeepPartialEntity<Entity> & DeepPartial<Entity> & DeepPartial<CreateDto<Entity>>;

/**
 * Entity 별 find DTO Type
 * @see QueryStringDto
 */
export type FindDto<Entity> = {
    [K in keyof Entity]?: Entity[K]
        | string
        | string[]
        | number
        | number[]
        | FindOperator<any>
        | FindDto<Entity>
        | FindDto<Entity>[]
} & QueryStringDto;

/**
 * QueryString DTO Type
 */
export type QueryStringDto = {
    /* 조회 데이터 총 개수 */
    counts?: number;

    /* 페이지 번호 */
    page?: number;

    /* 페이지 당 데이터 개수 */
    limit?: number;

    /* 검색 타입 */
    keywordType?: string;

    /* 검색 키워드 */
    keyword?: string;

    /* 기간 타입 */
    periodType?: string;

    /* 기간 시작일 */
    startDate?: string;

    /* 기간 종료일 */
    endDate?: string;

    /* 정렬 기준 */
    sort?: string;
};



