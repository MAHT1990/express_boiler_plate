import { DataSource } from "typeorm";

/**
 * 데이터 소스 설정 인터페이스
 */
export interface IDataSourceConfig {
    getMasterSource(): DataSource;
    getSlaveSource(): DataSource;
    initializeMaster(): Promise<void>;
    initializeSlave(): Promise<void>;
}

