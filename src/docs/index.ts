/* THIRD-PARTY MODULES */
import swaggerJsDoc from "swagger-jsdoc";

/* HANDLER */
import { SwaggerOptionHandler } from "./options";


/**
 * Swagger API 문서 생성 및 관리 클래스
 * 
 * @description
 * - Swagger API 문서 생성 및 관리
 * - Swagger UI 설정 관리
 * - 싱글톤 패턴을 통한 인스턴스 관리
 * 
 * @example
 * const swaggerApiJsDocGenerator = new SwaggerApiJsDocGenerator();
 * const { specs, setUpOption } = swaggerApiJsDocGenerator.getSwaggerSpecsAndOption();
 */
export default class SwaggerApiJsDocGenerator {

    private readonly swaggerOptionHandler: SwaggerOptionHandler;

    constructor() {
        this.swaggerOptionHandler = SwaggerOptionHandler.getInstance();
    }

    public getSwaggerSpecsAndOption(): {
        specs: object,
        setUpOption: object
    } {
        const { apiOption, setUpOption } = this.swaggerOptionHandler.getOption();
        const specs = swaggerJsDoc(apiOption);
        return {
            specs,
            setUpOption,
        };
    }
}
