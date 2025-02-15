/* CLASSES */
import { CommentFindDto, CommentCreateDto, CommentUpdateDto } from "./schema";

/* UTILS */
import { createValidator } from "../../util";
import { commentResponse } from "../../../../utils/response";


/**
 * 댓글 조회시 필요한 query string 검증
 */
export const validateFindComment = createValidator<CommentFindDto>({
    dtoClass: CommentFindDto,
    target: "query",
    isArray: false,
    responseMaker: commentResponse,
});


/**
 * 댓글 생성시 필요한 body 검증
 */
export const validateCreateComment = createValidator<CommentCreateDto>({
    dtoClass: CommentCreateDto,
    target: "body",
    isArray: false,
    responseMaker: commentResponse,
});


/**
 * 댓글 수정시 필요한 body 검증
 */
export const validateUpdateComment = createValidator<CommentUpdateDto>({
    dtoClass: CommentUpdateDto,
    target: "body",
    isArray: false,
    responseMaker: commentResponse,
});



