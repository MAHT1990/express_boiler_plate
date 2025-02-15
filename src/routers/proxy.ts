/* THIRD-PARTY MODULES */
import { NextFunction, Request, RequestHandler, Response, Router } from "express";

/* INTERFACES */
import {
    ISwaggerApiOption,
    ISwaggerApiOptionDetail,
    ISwaggerApiRequestBody,
    ISwaggerApiArrayRequestBody,
} from "../types/docs";
import { IResponse } from "../types/utils/response/IResponse";

/* UTILS */
import addSubRouter from "./addSubRouter";
import * as Logger from "../utils/logger";
import { SwaggerOptionHandler } from "../docs/options";

/* CONSTANTS */
const ROUTER_ROOT = "routers";
const HTTP_METHODS = ["get", "post", "put", "delete", "patch"];


/**
 * createRouterProxy
 * - router를 Proxy로 감싸는 함수
 * - 호출된 경로를 기반으로 totalPath 설정
 * - Swagger 설정
 * 
 * @param router
 * @param option {{
 *   curDirString: string,
 *   parentRouter?: Router,
 *   parentResourceId?: string,
 *   addionalMiddlewares?: RequestHandler[]
 * }}
 * 
 * - curDirString: 현재 router의 경로
 * - parentRouter: 부모 router
 * - parentResourceId: 부모 router의 resourceId 명(req.headers에 추가)(ex. "postId")
 * - addionalMiddlewares: 추가 미들웨어
 */
export const createRouterProxy = (
    router: Router,
    option: {
        curDirString: string,
        parentRouter?: Router,
        addSubRouter?: boolean,
        parentResourceId?: string,
        addionalMiddlewares?: RequestHandler[]
    },
): Router => {
    const {
        curDirString,
        parentRouter,
        parentResourceId,
        addionalMiddlewares
    } = option;

    /* Resource명 추출 
     * - 구분자가 \\(window), /(linux) 인 경우를 구분한다.
     */
    const separator = process.platform === "win32" ? "\\" : "/";
    const dirs = curDirString.split(separator);
    const resourceName = dirs.pop();

    /* resourcePath
     * - parentResourceId가 없는 경우 (ex. /posts): resourcePath = <resourceName>
     * - parentResourceId가 있는 경우 (ex. /:postId/comments): resourcePath = <parentResourceId>/<resourceName>
     */
    const resourcePath = parentResourceId
        ? `/:${parentResourceId}/${resourceName}`
        : `/${resourceName}`;

    /* totalPath
     * - 최상위 Router 인 경우: totalPath = ""
     * - 자식 Router 인 경우: totalPath(ex. /posts/:postId/comments) = <parentRouter의 totalPath>/<resourcePath>
     */
    let totalPath = "";
    if (parentRouter) {
        /* parentRouter 의 metadata: totalPath 조회 */
        const parentTotalPath = Reflect.getMetadata("totalPath", parentRouter);

        if (parentTotalPath) totalPath = `${parentTotalPath}${resourcePath}`;
        else {
            const endpointStart = dirs.findIndex(str => str === ROUTER_ROOT);
            dirs.push(resourcePath);

            if (endpointStart !== -1) {
                const modifiedString = dirs.slice(endpointStart + 1).join("/");
                totalPath = modifiedString;
            }
        }
    }

    /* Router 설정
     * 1. path 추가 (resourcePath)
     * 2. 추가 middlewares 설정
     * 3. parentResourceId middleware 설정 - req.headers에 params 값 복사
     * 4. ChildRouter 설정
     * 5. parentRouter 또는 최상위 Router에 router 추가
     */
    const argArr = [];
    argArr.push(resourcePath);

    if (addionalMiddlewares) argArr.push(...addionalMiddlewares);

    if (parentResourceId) {
        argArr.push((req: Request, res: Response, next: NextFunction) => {
            req.headers[parentResourceId] = req.params[parentResourceId];
            next();
        });
    }

    argArr.push(router);
    
    if (parentRouter) parentRouter.use(...argArr);
    else router.use(...argArr);

    /* Router Proxy 설정 */
    const routerProxy = new Proxy(router, {
        get(router, prop, receiver) {
            if (
                typeof prop === "string" &&
                HTTP_METHODS.includes(prop)
            ) {
                return new Proxy(router[prop], {
                    apply (method, thisArg, argArray: [string, ...RequestHandler[]]) {
                        const [ path, ...middlewares ] = argArray;

                        /* middleware 중 requestHandler 추출 */
                        const requestHandler = middlewares.find(middleware =>
                            Reflect.getMetadata("middlewareType", middleware) === "requestHandler"
                        );

                        /* middleware 중 validator 추출 */
                        const validators = middlewares.filter(middleware =>
                            Reflect.getMetadata("middlewareType", middleware) === "validator"
                        );

                        let endPoint = totalPath;
                        
                        /* Swagger endPoint 설정 
                         * - path(router의 첫번째 인자)가 "/" 이면 baseEndPoint 로 설정
                         * - path 내 "/:id" 형식을 모두 /{id} 로 변환 (Swagger 표준 문법 적용)
                         * 
                         * ex. /posts/:postId/comments/:commentId  =>  /posts/{postId}/comments/{commentId}
                         */
                        if (!path.endsWith("/")) endPoint = `${totalPath}${path}`;
                        const urlComponents = endPoint.split("/");
                        urlComponents.forEach((component, idx, arr) => {
                            if (component.startsWith(":")) arr[idx] = `{${component.slice(1)}}`;
                        });
                        endPoint = urlComponents.join("/");
                        
                        /* deprecated 설정 */
                        const deprecated: boolean = !!requestHandler
                            ? (Reflect.getMetadata("deprecated", requestHandler) || false)
                            : false;

                        /* summary 설정 */
                        const summary: string = !!requestHandler
                            ? (Reflect.getMetadata("middlewareSummary", requestHandler) || "")
                            : "SUMMARY NOT SET";

                        /* description 설정 */
                        const description: string = !!requestHandler
                            ? (Reflect.getMetadata("middlewareDescription", requestHandler) || "")
                            : "DESCRIPTION NOT SET";

                        /* SWAGGER 설정 */
                        const swaggerOption: ISwaggerApiOption = {};
                        const swaggerOptionDetail: ISwaggerApiOptionDetail = {
                            tags: [totalPath],
                            deprecated,
                            summary,
                            description,
                            operationId: `[${prop.toUpperCase()}]${totalPath}`,
                            responses: {},
                            security: [],
                            parameters: [],
                        };

                        /* Swagger Path parameter 설정
                         * endPoint 내 /{resourceId} 형식이 존재하는 경우,
                         * 이를 swagger path parameter 로 설정
                         */
                        urlComponents.forEach(component => {
                            if (component.startsWith("{")) {
                                swaggerOptionDetail.parameters.push({
                                    name: component.slice(1, -1),
                                    in: "path",
                                    description: `${component.slice(1, -1)} 파라미터`,
                                    required: true,
                                    schema: {
                                        type: "string",
                                        example: "1"
                                    },
                                });
                            }
                        });
                        
                        /* Swagger query parameter 설정 
                         * 해당 validator 의 query schema 를
                         * swaggerOptionDetail.parameters 에 추가
                         * 
                         * - 해당 validator 의 query schema 가 없는 경우, 무시
                         * - 해당 validator 의 query schema 가 배열인 경우, collectionFormat 을 설정
                         * - 해당 validator 의 query schema 가 배열이 아닌 경우, 일반적인 query parameter 로 설정
                         */
                        validators.forEach(validator => {
                            const dtoClass = Reflect.getMetadata("dtoClass", validator);

                            const dto = new dtoClass();
                            const querySchema = dto.queryData;

                            if (querySchema) {
                                Object.keys(querySchema).forEach(key => {
                                    let queryParameter;

                                    if (querySchema[key].type === "array") {
                                        queryParameter = {
                                            name: key,
                                            in: "query",
                                            description: querySchema[key].description,
                                            required: querySchema[key].required,
                                            schema: {
                                                type: querySchema[key].type,
                                                collectionFormat: querySchema[key].collectionFormat,
                                                items: {
                                                    type: querySchema[key].items?.type,
                                                    example: querySchema[key].items?.example,
                                                }
                                            }
                                        }
                                    }

                                    else {
                                        queryParameter = {
                                            name: key,
                                            in: "query",
                                            description: querySchema[key].description,
                                            required: querySchema[key].required,
                                            schema: {
                                                type: querySchema[key].type,
                                                example: querySchema[key].example,
                                            }
                                        };
                                    }
                                    swaggerOptionDetail.parameters.push(queryParameter);
                                });
                            }
                        });

                        /* Swagger requestBody 설정(POST, PUT, PATCH) 
                         * middleware의 type이 validator 인 경우,
                         * 해당 validator 의 requestBody schema 를
                         * swaggerOptionDetail.requestBody 에 추가
                         */
                        if (prop === "post" || prop === "put" || prop === "patch") {
                            validators.forEach(validator => {
                                const isArray = !!(Reflect.getMetadata("isArray", validator) || false);
                                const requestBody: ISwaggerApiArrayRequestBody | ISwaggerApiRequestBody = isArray
                                    ? {
                                        description: "Request Body",
                                        required: true,
                                        content: {
                                            "application/json": {
                                                schema: {
                                                    type: "array",
                                                    items: {
                                                        properties: {}
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    : {
                                        description: "Request Body",
                                        required: true,
                                        content: {
                                            "application/json": {
                                                schema: {
                                                    properties: {}
                                                }
                                            }
                                        }
                                    };
                                
                                const dtoClass = Reflect.getMetadata("dtoClass", validator);
                                const dto = new dtoClass();
                                const requestBodySchema = dto.requestData;

                                if (requestBodySchema) {
                                    Object.keys(requestBodySchema).forEach(key => {
                                        const requiredStr = (
                                            ["post", "put", "patch"].includes(prop) && 
                                            requestBodySchema[key].required
                                        ) ? "(required*)" : "(optional)";

                                        if (isArray) {
                                            (<ISwaggerApiArrayRequestBody>requestBody).content["application/json"]
                                            .schema.items.properties[key] = {
                                                type: requestBodySchema[key].type,
                                                example: requestBodySchema[key].example,
                                                description: `${requiredStr}${requestBodySchema[key].description}`,
                                            };
                                        }

                                        else {
                                            (<ISwaggerApiRequestBody>requestBody).content["application/json"]
                                            .schema.properties[key] = {
                                                type: requestBodySchema[key].type,
                                                example: requestBodySchema[key].example,
                                                description: `${requiredStr}${requestBodySchema[key].description}`,
                                            };
                                        }
                                    });
                                }
                                swaggerOptionDetail.requestBody = requestBody;
                            });
                        }

                        swaggerOption[prop] = swaggerOptionDetail;

                        SwaggerOptionHandler.getInstance().addPath(endPoint, swaggerOption);

                        return method.apply(thisArg, argArray);
                    }
                });
            }
            return Reflect.get(router, prop, receiver);
        }
    });
    
    /* Metadata 설정: totalPath */
    Reflect.defineMetadata("totalPath", totalPath, routerProxy);

    /* 자식 Router 설정 */
    if (option.addSubRouter !== false) addSubRouter(routerProxy, curDirString);

    return routerProxy;
};


export const createRequestHandler = (
    action: (req: Request, res: Response) => Promise<IResponse>,
    option?: {
        raw?: boolean;
        redirect?: boolean | ((param: any) => boolean);
        deprecated?: boolean;
        summary?: string;
        description?: any;
    }
): RequestHandler => {
    const proxy = new Proxy(action, {
        async apply(method, thisArg, argArray: [Request, Response]) {
            const [ req, res ] = argArray;

            try {
                const result: IResponse = await method.apply(thisArg, argArray);
                Logger.info({ info: result, request: req });
    
                const isRaw = option?.raw ?? false;
    
                const isRedirect = typeof option?.redirect === "function"
                    ? option.redirect(req)
                    : option?.redirect
    
                /* (Browser) 리다이렉션 처리 */
                if (
                    isRedirect &&
                    result.data?.redirectUrl &&
                    !(req.headers.isAndroid || req.headers.isIOS)
                ) {
                    return res.redirect(result.data.redirectUrl);
                }
    
                /* 원시 데이터 반환 */
                if (isRaw) {
                    return res.status(200).send(result);
                }
                
                /* Default Response: ServiceResponse */
                return res.status(result.status).json({
                    code: result.code,
                    message: result.message,
                    data: result.data
                });
            } catch (err) {
                Logger.error({ info: err, request: req });

                res.status(500).json({
                    code: err.name,
                    message: err.message,
                    data: null
                });
            }
        }
    });


    /* MetaData 설정 */
    Reflect.defineMetadata("middlewareType", "requestHandler", proxy);
    Reflect.defineMetadata("middlewareSummary", option?.summary, proxy);
    Reflect.defineMetadata("middlewareDescription", option?.description, proxy);
    Reflect.defineMetadata("deprecated", option?.deprecated, proxy);

    return proxy as unknown as RequestHandler;
};