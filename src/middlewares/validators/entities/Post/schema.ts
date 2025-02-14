/* THIRD-PARTY MODULES */
import { IsString, IsOptional } from "class-validator";

/* CLASSES */
import { BaseSchema } from "../../base";

/* DECORATORS */
import { SwaggerQueryString, SwaggerRequestBody } from "../../base";

/* CONSTANTS */
import { VALIDATION_CONSTANTS } from "../../../../constants/validator.constants";


/* 게시글 조회 관련 DTO */
export class PostFindDto extends BaseSchema {
    @SwaggerQueryString({
        type: "string",
        description: "게시글 제목",
        required: false,
        example: "게시글 제목"
    })
    title: string;

    @SwaggerQueryString({
        type: "string",
        description: "게시글 내용",
        required: false,
        example: "게시글 내용"
    })
    content: string;

    @SwaggerQueryString({
        type: "string",
        description: "게시글 작성자",
        required: false,
        example: "게시글 작성자"
    })
    author: string;
}


/* 게시글 생성 관련 DTO */
export class PostCreateDto extends BaseSchema {
    @SwaggerRequestBody({
        type: "string",
        description: "게시글 제목",
        required: true,
        example: "게시글 제목"
    })
    @IsString({ message: VALIDATION_CONSTANTS.IsString })
    title: string;

    @SwaggerRequestBody({
        type: "string",
        description: "게시글 내용",
        required: true,
        example: "게시글 내용"
    })
    @IsString({ message: VALIDATION_CONSTANTS.IsString })
    content: string;

    @SwaggerRequestBody({
        type: "string",
        description: "게시글 작성자",
        required: true,
        example: "게시글 작성자"
    })
    @IsString({ message: VALIDATION_CONSTANTS.IsString })
    author: string;
}


/* 게시글 수정 관련 DTO */
export class PostUpdateDto extends PostCreateDto {
    @IsOptional()
    @IsString({ message: VALIDATION_CONSTANTS.IsString })
    title: string;

    @IsOptional()
    @IsString({ message: VALIDATION_CONSTANTS.IsString })
    content: string;

    @IsOptional()
    @IsString({ message: VALIDATION_CONSTANTS.IsString })
    author: string;
}
