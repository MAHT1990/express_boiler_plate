/* THIRD-PARTY MODULES */
import { LogEntry } from "winston";

/* INTERFACES */
import { ILogParams } from "../../types/utils/logger/ILogParams";


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

    /* Error Intance 인 경우 */
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





