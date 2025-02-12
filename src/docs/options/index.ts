/* INTERFACES */
import { SwaggerOptions } from "swagger-ui-express";
import { ISwaggerApiDoc, ISwaggerApiOption } from "../../types/docs";


/**
 * Swagger API 문서 및 UI 설정을 관리하는 핸들러 클래스
 * 
 * @description
 * - Swagger API 문서 생성 및 관리
 * - Swagger UI 설정 관리
 * - 싱글톤 패턴을 통한 인스턴스 관리
 * 
 * @example
 * const swaggerHandler = SwaggerOptionHandler.getInstance();
 * swaggerHandler.addPath('/api/v1/users', userApiOptions);
 * const { apiOption, setUpOption } = swaggerHandler.getOption();
 */
export class SwaggerOptionHandler {

    static uniqueSwaggerInstance: SwaggerOptionHandler;

    private apiOption: SwaggerOptions;


    private setUpOption: SwaggerOptions;

    private readonly path: ISwaggerApiDoc;

    /**
     * @see initAPIOption - API 설정 초기화
     * @see initSetUpOption - Swagger UI 설정 초기화
     */
    constructor() {
        if (!SwaggerOptionHandler.uniqueSwaggerInstance) {

            /* this.apiOption Initialize */
            this.initAPIOption();

            /* this.setUpOption Initialize */
            this.initSetUpOption();

            SwaggerOptionHandler.uniqueSwaggerInstance = this;
        }
    }

    public static getInstance(): SwaggerOptionHandler {
        if (!SwaggerOptionHandler.uniqueSwaggerInstance) {
            SwaggerOptionHandler.uniqueSwaggerInstance = new SwaggerOptionHandler();
        }
        return SwaggerOptionHandler.uniqueSwaggerInstance;
    }
    
    /**
     * Entry Point 1. Swagger 문서에 API 추가
     * @param path - API 경로
     * @param value {ISwaggerApiOption} - API 옵션
     */
    public addPath(
        path: string,
        value: ISwaggerApiOption
    ): void {
        this.apiOption.definition.paths[path] = this.apiOption.definition.paths[path]
            ? Object.assign(this.apiOption.definition.paths[path], value)
            : value;
    }

    /**
     * Entry Point 2. 초기화된 API 설정 및 UI 설정 반환
     * @returns {Object} - API 설정 및 UI 설정 객체
     */
    public getOption(): { apiOption: SwaggerOptions, setUpOption: SwaggerOptions } {
        return {
            apiOption: this.apiOption,
            setUpOption: this.setUpOption,
        };
    }
    
    /**
     * API 설정 초기화
     * @memberof constructor
     */
    private initAPIOption(): void {
        this.apiOption = {
            definition: {
                openapi: "3.1.0",
                info: require("./info").default,
                servers: require("./servers").default,
                produces: ["application/json"],
                definitions: require("./definitions").default,
                components: {
                    securitySchemes: require("./securities").default,
                    schemas: require("./schemas").default,
                },
                tags: require("./tags").default,
                paths: {},
            },
            apis: [],
        };
    }

    /**
     * Swagger UI 설정 초기화
     * @memberof constructor
     */
    private initSetUpOption(): void {
        this.setUpOption = {
            explorer: true,
        };
    }
}
