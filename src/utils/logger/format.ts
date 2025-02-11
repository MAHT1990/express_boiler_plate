/* THIRD-PARTY MODULES */
import { format, Logform } from "winston";
import { TransformableInfo } from 'logform';


/**
 * HTTP 요청 로그를 포맷팅하는 클래스
 */
class RequestFormat {

    /**
     * TransformableInfo 객체를 문자열로 변환하는 메서드
     * @param {TransformableInfo} info - 로그 정보 객체
     * @returns {string} 포맷팅된 로그 문자열
     */
    private stringFormatter(info: TransformableInfo): string {

        const baseString = `[${info.timestamp}] ${info.ip || ""} ${info.status || ""} ${info.method || "" } ${info.path || "" } ${info.level.toUpperCase()}`;
        
        const baseStringSub = info.label
            ? `: (${info.label})${info.message}`
            : `: ${info.message}`;

        const userAgentString = info["user-agent"]
            && `  >> user-agent: ${info["user-agent"]}`;

        const queryString = (!!info.query && Object.keys(info.query).length > 0)
            && `  >> query: ${JSON.stringify(info.query)}`;

        const bodyString = (!!info.body && Object.keys(info.body).length > 0)
            && `  >> body: ${JSON.stringify(info.body)}`;

        const stackString = info.stack
            &&  `${info.stack}`;

        const formats = {
            baseString: baseString + baseStringSub,
            userAgentString,
            queryString,
            bodyString,
            stackString,
        };
        
        return Object.values(formats).filter(Boolean).join("\n");
    }

    /**
     * Winston 로그 포맷을 반환하는 메서드
     * @returns {Logform.Format} Winston 로그 포맷 객체
     */
    public getFormat(): Logform.Format {
        return format.combine(
            format.timestamp(),
            format.printf(this.stringFormatter),
        );
    }
}

/**
 * 로그 포맷 팩토리 객체
 */
export const formatFactory = {

    /**
     * 로그 타입에 따른 포맷을 생성하는 메서드
     * @param {("request"|"query")} type - 로그 타입
     * @returns {Logform.Format} Winston 로그 포맷 객체
     */
    createFormat: (type: "request" | "query" ): Logform.Format => {
        switch (type) {
            case "request":
                return new RequestFormat().getFormat();

            // TODO: query, error, etc. 관련 format 추가
        }
    }
};
