/**
 * 환경 변수 설정 인터페이스
 */
export interface IEnvConfig {
    getEnvPath(): string;
    initialize(): void;
}