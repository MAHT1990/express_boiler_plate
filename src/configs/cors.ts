/* INTERFACES */
import { CorsOptions, ICorsConfig } from "../types/configs/cors";


export class CorsConfig implements ICorsConfig {
    private readonly allowedOrigins: string[];

    private readonly allowedIps: string[];

    private readonly allowedOriginsPrefix: string = "ALLOWED_ORIGIN_";

    private readonly allowedIPsPrefix: string = "ALLOWED_IP_";

    /**
     * @see loadAllowedOrigins - 허용 Origin 목록 로드
     * @see loadAllowedIps - 허용 IP 목록 로드
     */
    public constructor() {
        this.allowedOrigins = this.loadAllowedOrigins();
        this.allowedIps = this.loadAllowedIps();
    }

    /**
     * Entry Point. CORS 설정 반환.
     */
    public getOptions(): CorsOptions {
        return {
            origin: (origin, callback) => {
                console.log("Request from origin:", origin);

                if (
                    !origin ||
                    this.allowedOrigins.indexOf(origin) !== -1 ||
                    this.allowedIps.indexOf(new URL(origin).hostname) !== -1
                ) {
                    callback(null, true);
                }

                else {
                    callback(new Error(`Not allowed by CORS: ${origin}`));
                }
            },

            credentials: true,

            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

            allowedHeaders: [
                "Content-Type",
                "Authorization",
                "x-api-key",
                "x-store-id",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Headers",
                "Origin",
                "Accept",
            ],

            exposedHeaders: [
                "Content-Type",
                "Authorization",
                "x-api-key",
                "Access-Control-Allow-Origin",
            ],

            preflightContinue: false,
            optionsSuccessStatus: 204,
        };
    }

    /**
     * .env.* 파일 내
     * - SAME_ORIGIN: "ORIGIN" 환경변수에 대하여
     * - CROSS_ORIGIN: "ALLOWED_ORIGIN_" 로 시작하는 환경변수에 대하여
     * 해당 origin 에서의 요청 허용.
     * @memberof constructor
     */
    private loadAllowedOrigins(): string[] {
        return Object.keys(process.env)
            .filter(key => key === "ORIGIN" || key.startsWith(this.allowedOriginsPrefix))
            .map(key => process.env[key]);
    }

    /**
     * .env.* 파일 내
     * - "ALLOWED_IP_" 로 시작하는 환경변수에 대하여
     * 해당 IP 에서의 요청 허용.
     * @memberof constructor
     */
    private loadAllowedIps(): string[] {
        return Object.keys(process.env)
            .filter(key => key === this.allowedIPsPrefix)
            .map(key => process.env[key]);
    }
}
