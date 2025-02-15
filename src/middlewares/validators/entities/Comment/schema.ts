/* THIRD-PARTY MODULES */
import { IsString, IsOptional } from "class-validator";

/* CLASSES */
import { BaseSchema } from "../../base";

/* DECORATORS */
import { SwaggerQueryString, SwaggerRequestBody } from "../../base";

/* CONSTANTS */
import { VALIDATION_CONSTANTS } from "../../../../constants/validator.constants";


/* 댓글 조회 관련 DTO */
export class CommentFindDto extends BaseSchema {
    @SwaggerQueryString({
        type: "string",
        description: "댓글 내용",
        required: false,
        example: "댓글 내용"
    })
    content: string;
    
    @SwaggerQueryString({
        type: "string",
        description: "댓글 작성자",
        required: false,
        example: "댓글 작성자"
    })
    author: string;
}


/* 댓글 생성 관련 DTO */
export class CommentCreateDto extends BaseSchema {
    @SwaggerRequestBody({
        type: "number",
        description: "게시글 ID",
        required: true,
        example: 1
    })
    postId: number;
    
    @SwaggerRequestBody({
        type: "string",
        description: "댓글 내용",
        required: true,
        example: "댓글 내용"
    })
    @IsString({ message: VALIDATION_CONSTANTS.IsString })
    content: string;
    
    @SwaggerRequestBody({
        type: "string",
        description: "댓글 작성자",
        required: true,
        example: "댓글 작성자"
    })
    @IsString({ message: VALIDATION_CONSTANTS.IsString })
    author: string;
}


/* 댓글 수정 관련 DTO */
export class CommentUpdateDto extends CommentCreateDto {
    @IsOptional()
    content: string;
    
    @IsOptional()
    author: string;
}