/* INTERFACES */
import { 
    IResponse, 
    IResponseCodeInfo,
    IResponseMaker,
    IResponseParams,
} from "../../types/utils/response/IResponse";


/**
 * 각 Entity 별 응답 객체 생성 함수
 * 
 * @param {IResponseCodeInfo} serviceResponseInfo - 서비스 응답 코드 정보
 * @returns {IResponseMaker} 응답 객체 생성 함수
 */
export const makeResponseMaker = (serviceResponseInfo: IResponseCodeInfo): IResponseMaker => {
    return (responseInfo: IResponseParams): IResponse => {
        const { status, code, message } = serviceResponseInfo[responseInfo.type];

        return {
            status,
            code: String(code),
            message: responseInfo.message || message,
            data: responseInfo.data,
        };
    };
};