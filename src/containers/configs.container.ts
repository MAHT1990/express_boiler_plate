/* THIRD-PARTY MODULES */
import { Container } from "inversify";

/* SYMBOLS */
import { CONFIGS } from "./symbols/configs";

/* INTERFACES */
import { IAppConfig } from "../types/configs/app";
import { ICorsConfig } from "../types/configs/cors";
import { IDataSourceConfig } from "../types/configs/dataSource";
import { IEnvConfig } from "../types/configs/env";

/* CLASSES */
import { AppConfig } from "../configs/app";
import { CorsConfig } from "../configs/cors";
import { DataSourceConfig } from "../configs/dataSource";
import { EnvConfig } from "../configs/env";


export class ConfigsContainer extends Container {
    public constructor() {
        super({ defaultScope: "Singleton" });
        this.initializeBindings();
    }

    private initializeBindings(): void {
        this.bind<IAppConfig>(CONFIGS.AppConfig).to(AppConfig);
        this.bind<ICorsConfig>(CONFIGS.CorsConfig).to(CorsConfig);
        this.bind<IDataSourceConfig>(CONFIGS.DataSourceConfig).to(DataSourceConfig);
        this.bind<IEnvConfig>(CONFIGS.EnvConfig).to(EnvConfig);
    }
}

/**
 * export configsContainer singleton instance
 */
export const configsContainer = new ConfigsContainer();














