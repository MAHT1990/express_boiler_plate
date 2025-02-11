/* THIRD-PARTY MODULES */
import { injectable, inject } from "inversify";
import express, { Application } from "express";

/* CONTAINERS */
import { CONFIGS } from "../containers/symbols/configs";

/* UTILS */
import loaders from "../loaders";
import * as Logger from "../utils/logger";

/* INTERFACES */
import { IAppConfig } from "../types/configs/app";
import { IEnvConfig } from "../types/configs/env";
import { IDataSourceConfig } from "../types/configs/dataSource";


@injectable()
export class AppConfig implements IAppConfig {
    private readonly app: Application;

    private port: number;

    constructor(
        @inject(CONFIGS.EnvConfig) private readonly envConfig: IEnvConfig,
        @inject(CONFIGS.DataSourceConfig) private readonly dataSourceConfig: IDataSourceConfig,
    ) {
        this.app = express();
        this.port = parseInt(this.envConfig.PORT || "3000");
    }

    public async bootstrap(): Promise<void> {
        try {
            /* Initialize Env Config */
            this.envConfig.initialize();
            Logger.info({ info: { message: "Env Config Initialized" }});
            
            /* Initialize MasterDataSource */
            await this.dataSourceConfig.initializeMaster();
            Logger.info({ info: { message: "Master DataSource Initialized" }});

            /* Initialize SlaveDataSource */
            await this.dataSourceConfig.initializeSlave();
            Logger.info({ info: { message: "Slave DataSource Initialized" }});

            /* Initialize Express */
            loaders.expressLoader(this.app);
            Logger.info({ info: { message: "Express Initialized" }});

            /* Start Server */
            this.app.listen(this.port, () => {
                Logger.info({ info: { message: `Server is running on port ${this.port}` }});
            })
            .on("error", (error) => {
                Logger.error({ info: error });
                process.exit(1);
            });
            
        } catch (error) {
            Logger.error({ info: error });
            process.exit(1);
        }
    }
}