/* INTERFACES */
import { IResponseMaker } from "../../types/utils/response/IResponse";

/* RESPONSE */
import { postServiceResponseInfo } from "./post.response";
import { commentServiceResponseInfo } from "./comment.response";

/* UTILS */
import { makeResponseMaker } from "./responseMaker";



export const postResponse: IResponseMaker = makeResponseMaker(postServiceResponseInfo);
export const commentResponse: IResponseMaker = makeResponseMaker(commentServiceResponseInfo);