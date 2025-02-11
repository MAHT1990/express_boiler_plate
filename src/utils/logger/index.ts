/* THIRD-PARTY MODULES */
import {
    createLogger,
    transports,
    Logger as WinstonLogger,
} from "winston";

/* CUSTOM MODULES */
import CustomTransport from "./transport";
import { formatFactory } from "./format";
import { makeRequestLogEntry } from "./entries";
import { ILogParams } from "../../types/utils/logger/ILogParams";

/* CONSTANTS */
const DATE_FORMAT = "YYYY-MM-DD";


/**
 * Winston 로거의 설정과 인스턴스 생성 담당 클래스.
 * - info/error 레벨과 request/query 타입을 지정하여 로거 생성
 * - 커스텀 transport 설정 가능
 * - 로그 포맷 자동 설정
 * - 예외 처리 및 에러 핸들링 지원
 */
class Logger {
    private readonly level: "info" | "error";

    private readonly type: "request" | "query";

    private logTransports: Array<any>;

    constructor(
        level: "info" | "error",
        type: "request" | "query",
    ) {
        this.level = level;
        this.type = type;
    }

    private setTransports(): void {
        if (this.type === "request") {
            /* 요청 로그 전송 클래스 생성 */
        }
    }

    public createLogger(): WinstonLogger {
        this.setTransports();

        return createLogger({
            /* 로그 레벨 설정 (info 또는 error) */
            level: this.level,
            
            /* 로그 포맷 설정 (request 또는 query 타입에 따른 포맷) */
            format: formatFactory.createFormat(this.type),
            
            /* 로그 전송 대상 설정 */
            transports: this.logTransports,
            
            /* 기본 메타데이터 설정 */
            defaultMeta: { service: "user-service" },
            
            /* 에러 발생 시 프로세스 종료 여부 설정 */
            exitOnError: false,
            
            /* 예외 처리 설정 */
            handleExceptions: true,
        })
    }
}

/* 로거 인스턴스(single-instance) 생성 */
const infoLogger: WinstonLogger = new Logger("info", "request").createLogger();
const errorLogger: WinstonLogger = new Logger("error", "request").createLogger();


/* 정보 로그 생성 */
export const info: (params: ILogParams) => void = (params: ILogParams) => {
    infoLogger.info(makeRequestLogEntry(params));
}

/* 에러 로그 생성 */
export const error: (params: ILogParams) => void = (params: ILogParams) => {
    errorLogger.error(makeRequestLogEntry(params));
}








