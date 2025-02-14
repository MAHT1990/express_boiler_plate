/* THIRD-PARTY MODULES */
import { Request, Response, NextFunction } from "express";
import { validateOrReject } from "class-validator";
import { ClassConstructor, plainToInstance } from "class-transformer";

/* INTERFACES */
import { IResponseMaker } from "../../types/utils/response/IResponse";
import { IInfoParams } from "../../types/utils/logger/ILogParams";

/* UTILS */
import * as Logger from "../../utils/logger";


/**
 * Request Body 데이터 검증 수행 미들웨어
 * 
 * @param params {Object} - 검증에 필요한 파라미터
 * @params params.target {"query" | "body"} - 검증 대상
 * @params params.isArray {boolean} - 배열 여부
 * @params params.dtoClass {Class} - DTO Class
 * @params params.responseMaker {IResponseMaker} - 응답 생성기
 * @params params.property {string} - 검증 대상 프로퍼티(DTO Class의 특정 property를 검증하는 경우우)
 * @params params.additionalValidation {Function} - 추가 검증 함수
 */
export const createValidator = <T extends {}>(params: {
    target?: "query" | "body",
    isArray?: boolean;
    dtoClass: ClassConstructor<T>;
    responseMaker: IResponseMaker;
    property?: string;
    additionalValidation?: (req: Request, res: Response) => any
}) => {
    const middleware = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const target = params.target === "query" ? req.query : req.body;

            /* 추가 검증 */
            if (params.additionalValidation) params.additionalValidation(req, res);

            /* Array 형태의 데이터 검증 */
            if (Array.isArray(target)) {
                const dtoObjects = target.map(item => plainToInstance(
                    params.dtoClass,
                    item[params.property] || item
                ));

                await Promise.all(dtoObjects.map(dto => validateOrReject(dto)));
                req.body = dtoObjects;

                return next();
            }

            /* 단일 Object 형태의 데이터 검증 */
            const dtoObject = plainToInstance(params.dtoClass, target[params.property] || target);
            await validateOrReject(dtoObject);

            /*
             * 본래 DTO의 목적에 맞게 검증된 데이터를 req 객체 내에 저장
             * 버그로 인한 임시 주석처리
             * TODO: validator 정리후 주석 해제
             */

            next();
        } catch (err) {
            validationErrorHandler(err, params.responseMaker, req, res);
        }
    };

    /* MetaData 설정
     * - DTO Class를 middleware 에 저장
     * - middlewareType을 "validator"로 설정
     * - validationTarget을 "body" 또는 "query"로 설정
     * - isArray를 true 또는 false로 설정
     */
    Reflect.defineMetadata("dtoClass", params.dtoClass, middleware);
    Reflect.defineMetadata("middlewareType", "validator", middleware);
    Reflect.defineMetadata("validationTarget", params.target, middleware);
    Reflect.defineMetadata("isArray", params.isArray, middleware);

    return middleware;
};


/**
 * data validation 에러 핸들러
 * Class-Validator 에 의해 발생한 에러(Array)를 처리한다.
 *
 * Class-Validator 에서 발생한 에러는 Array 형태로 반환되며,
 * 각각의 에러는 constraints 라는 속성을 가지고 있다.
 * 이를 통해 각각의 에러에 대한 메시지를 추출하여 반환한다.
 *
 * @param err {Error} - 발생한 에러 객체
 * @param response {IResponseMaker} - Entity 에 대한 응답 메시지를 만들어주는 함수
 * @param req { Request } - Express Request 객체
 * @param res {Response} - Express Response 객체
 */
export const validationErrorHandler = (
    err: Error,
    response: IResponseMaker,
    req: Request,
    res: Response) => {
    const result: IInfoParams = response({ type: "invalid" });
    let classValidatorMsg: string = "";

    // Class-Validation Error에 대한 처리
    if (Array.isArray(err)) {
        const recursive = (err: any) => {
            err.forEach((e) => {
                if (e.constraints) {
                    Object.values(e.constraints).forEach((eMsg: string) => {
                        classValidatorMsg += `${eMsg} `;
                    });
                }

                if (e.children) recursive(e.children);
            });
        };
        recursive(err);
    }
    result.message = classValidatorMsg || err.message || result.message;

    Logger.info({ info: result, request: req });
    return res.status(result.status).json({
        code: result.code,
        message: result.message,
    });
};


/**
 * 각 상수 객체를 명세서에 출력하기위한 문자열을 생성한다.
 * @param constants - { key: { key1: value1, key2: value2 } } 형태의 상수 객체
 * @param options - key1, key2 에 대한 옵션
 *
 * ex1)
 *   {
 *     a: { k1: "apple", k2: "red" },
 *     b: { k1: "banana", k2: "yellow" }
 *   }
 *
 * key: k1, value: k2 로 설정할 경우
 * - 출력 문자열: - apple: red,<br> - banana: yellow,<br>
 *
 * key: undefined, value: k2 로 설정할 경우
 * - 출력 문자열: - a: red,<br> - b: yellow,<br>
 */
export const makeConstantsListString = (constants: Record<string, any>, options: {
    key?: string,
    value?: string,
}): string => {
    return Object.keys(constants).reduce((acc, cur) => {
        const key = options?.key ? constants[cur][options.key]: cur;
        const value = constants[cur][options.value] !== undefined
            ? constants[cur][options.value]
            : constants[cur];

        const str = ` - ${key}: ${value}`;
        acc += `${str},<br>`;
        return acc;
    }, "");
};