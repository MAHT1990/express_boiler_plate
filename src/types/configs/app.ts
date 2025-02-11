/**
 * Application 설정 인터페이스
 */
export interface IAppConfig {
    bootstrap(): Promise<void>;
}
