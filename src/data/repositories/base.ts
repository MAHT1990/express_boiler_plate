/* THIRD-PARTY MODULES */
import { DataSource, Repository, EntityTarget } from "typeorm";

/* INTERFACES */
import { IDataSourceConfig } from "../../types/configs/dataSource";


/**
 * 모든 Repository의 기본이 되는 추상 클래스
 * - Master/Slave DB 구조를 지원
 * - TypeORM Repository 패턴 구현
 * - 읽기/쓰기 작업 분리
 * 
 * @template Entity - Repository에서 다룰 엔티티 타입
 */
export abstract class BaseRepository<Entity> {
    /**
     * Master DB 연결을 위한 DataSource
     */
    protected readonly masterSource: DataSource;
    
    /**
     * Slave DB 연결을 위한 DataSource
     */
    protected readonly slaveSource: DataSource;

    /**
     * Master DB용 TypeORM Repository
     */
    protected readonly repositoryMaster: Repository<Entity>;
    
    /**
     * Slave DB용 TypeORM Repository
     */
    protected readonly repositorySlave: Repository<Entity>;

    /**
     * BaseRepository 생성자
     * @param {IDataSourceConfig} dataSourceConfig - DB 연결 설정
     * @param {EntityTarget<Entity>} entity - Repository에서 다룰 엔티티
     */
    protected constructor(
        dataSourceConfig: IDataSourceConfig,
        entity: EntityTarget<Entity>
    ) {
        this.masterSource = dataSourceConfig.getMasterSource();
        this.slaveSource = dataSourceConfig.getSlaveSource();

        this.repositoryMaster = this.masterSource.getRepository(entity);
        this.repositorySlave = this.slaveSource.getRepository(entity);
    }

    /**
     * Master DB Repository getter
     * @returns {Repository<Entity>} Master DB용 TypeORM Repository
     */
    public get master(): Repository<Entity> {
        return this.repositoryMaster;
    }

    /**
     * Slave DB Repository getter
     * @returns {Repository<Entity>} Slave DB용 TypeORM Repository
     */
    public get slave(): Repository<Entity> {
        return this.repositorySlave;
    }
}