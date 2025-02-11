/**
 * 응답 생성을 위한 파라미터 타입
 * @memberof IResponseMaker
 */
export interface IResponseParams {
    type: string;
    message?: string;
    data?: any;
};


/**
 * 응답 객체 타입
 * @memberof IResponseMaker
 */
export interface IResponse {
    status: number;
    code: string;
    message: string;
    data: any;
};


/**
 * 응답 객체 생성 함수 타입
 * @see IResponseParams
 * @see IResponse
 */
export interface IResponseMaker {
    (responseInfo: IResponseParams): IResponse;
}


/**
 * 응답 코드(사용자정의 코드) 정보 타입
 * @memberof IResponseMaker
 */
export interface IResponseCodeInfo {
    [key: string]: {
        status: number;
        code: string;
        message: string;
    };
};