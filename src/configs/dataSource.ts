// THIRD_PARTY
import { injectable } from "inversify";
import { DataSource, DataSourceOptions } from "typeorm";

// INTERFACES
import { IDataSourceConfig } from "../types/configs/dataSource";

// ENTITIES
import { User } from "../data/User";


@injectable()
export class DataSourceConfig implements IDataSourceConfig {

    private masterSource: DataSource;

    private slaveSource: DataSource;

    private MASTER_DATASOURCE_OPTIONS: DataSourceOptions;

    private SLAVE_DATASOURCE_OPTIONS: DataSourceOptions;

    public async initializeMaster(): Promise<void> {
        this.setMasterSourceOptions();
        this.masterSource = new DataSource(this.MASTER_DATASOURCE_OPTIONS);
        await this.masterSource.initialize();
    }

    public async initializeSlave(): Promise<void> {
        this.setSlaveSourceOptions();
        this.slaveSource = new DataSource(this.SLAVE_DATASOURCE_OPTIONS);
        await this.slaveSource.initialize();
    }

    public getMasterSource() { return this.masterSource; }

    public getSlaveSource() { return this.slaveSource; }

    private setMasterSourceOptions(): void {
        this.MASTER_DATASOURCE_OPTIONS = {
            type: "mysql",
            host: process.env.MYSQL_HOST_MASTER,
            port: parseInt(process.env.MYSQL_PORT),
            username: process.env.MYSQL_USER_INSERT,
            password: process.env.MYSQL_PW_INSERT,
            database: process.env.MYSQL_DB_PROD,
            synchronize: false,
            logging: true,
            charset: "utf8mb4",
            extra: {
                "supportBigNumbers": true,
                "bigNumberStrings": false
            },
            subscribers: [],
            entities: [User],
            cache: {
                type: "redis",
                options: {
                    socket: {
                        host: process.env.REDIS_HOST,
                        port: parseInt(process.env.REDIS_PORT),
                    }
                },
            }
        };
    }

    private setSlaveSourceOptions(): void {
        this.SLAVE_DATASOURCE_OPTIONS = Object.assign(
            {}, this.MASTER_DATASOURCE_OPTIONS, {
                host: process.env.MYSQL_HOST_SLAVE,
                username: process.env.MYSQL_USER_SELECT,
                password: process.env.MYSQL_PW_SELECT,
            }
        );
    }
}
