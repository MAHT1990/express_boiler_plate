/* THIRD-PARTY MODULES */
import { LogEntry } from "winston";

/* INTERFACES */
import { ILogParams } from "../../types/utils/logger/ILogParams";


/**
 * 요청 로그 엔트리를 생성하는 함수
 * - Request 객체가 있는 경우 요청 관련 정보(method, path, query 등)를 포함
 * - Error 객체인 경우 에러 레벨의 로그를 생성하고 스택 트레이스 포함
 * - IResponseCodeInfo 객체인 경우 info 레벨의 로그를 생성
 *
 * @param {ILogParams} params - 로그 생성에 필요한 파라미터
 * @param {Request} [params.request] - Express Request 객체
 * @param {Error|IResponseCodeInfo} params.info - 에러 객체 또는 응답 코드 정보 객체
 * @returns {LogEntry} Winston 로그 엔트리 객체
 */
export const makeRequestLogEntry: (params: ILogParams) => LogEntry = 
(params: ILogParams) => {
    const requestInfo: object = params.request ? {
        method: params.request.method,
        path: params.request.path,
        query: params.request.query,
        body: params.request.body,
        "user-agent": params.request.headers["user-agent"],
        ip: params.request.ip,
    } : {};

    let additionalInfo: object;

    /* Error Instance 인 경우 */
    if (params.info instanceof Error) {
        additionalInfo = {
            level: "error",
            status: 500,
            label: params.info.name,
            message: params.info.message,
            stack: params.info.stack,
        };
    } 
    
    /* IResponseCodeInfo 객체인 경우 */
    else {
        additionalInfo = {
            level: "info",
            status: params.info.status,
            label: params.info.code,
            message: params.info.message || "",
            stack: "",
        };
    }

    return Object.assign(requestInfo, additionalInfo) as LogEntry;
}





