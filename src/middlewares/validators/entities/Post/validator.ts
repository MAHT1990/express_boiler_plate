/* CLASSES */
import { PostFindDto, PostCreateDto, PostUpdateDto } from "./schema";

/* UTILS */
import { createValidator } from "../../util";
import { postResponse } from "../../../../utils/response";


/**
 * Post 조회시 필요한 query string 검증
 */
export const validateFindPost = createValidator<PostFindDto>({
    dtoClass: PostFindDto,
    target: "query",
    isArray: false,
    responseMaker: postResponse,
});


/**
 * Post 생성시 필요한 body 검증
 */
export const validateCreatePost = createValidator<PostCreateDto>({
    dtoClass: PostCreateDto,
    target: "body",
    isArray: false,
    responseMaker: postResponse,
});



/**
 * Post 수정시 필요한 body 검증
 */
export const validateUpdatePost = createValidator<PostUpdateDto>({
    dtoClass: PostUpdateDto,
    target: "body",
    isArray: false,
    responseMaker: postResponse,
});