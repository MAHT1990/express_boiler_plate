/* THIRD-PARTY MODULES */
import { Request } from "express";

/* INTERFACES */
import { IError } from "../response/IError";


/**
 * Log를 생성하기 위한 파라미터 타입
 * @see IErrorParams
 * @see IInfoParams
 */
export interface ILogParams {
    info: IInfoParams | IErrorParams;
    request?: Request;
};


/**
 * 에러 파라미터 타입
 * @memberof ILogParams
 */
export interface IErrorParams extends IError {
    status?: number;
    code?: string;
    stack?: string;
    message: string;
    name: string;
};


/**
 * 정보 파라미터 타입
 * @memberof ILogParams
 */
export interface IInfoParams {
    status?: number;
    code?: string;
    message?: string;
    data?: any;
};