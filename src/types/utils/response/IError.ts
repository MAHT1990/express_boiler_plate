/**
 * 응답을 위한 Error 객체 확장 인터페이스
 * @see Error
 */
export interface IError extends Error {
    status?: number;
    code?: string;
    stack?: string;
    message: string;
    name: string;
}