/* THIRD-PARTY MODULES */
import "reflect-metadata";

/* CONTAINERS */
import { configsContainer } from "./containers";

/* SYMBOLS */
import { CONFIGS } from "./containers/symbols/configs";

/* CLASSES */
import { AppConfig } from "./configs/app";

/* INTERFACES */
import { IAppConfig } from "./types/configs/app";

/* UTILS */
import * as Logger from "./utils/logger";


async function bootstrap(): Promise<void> {
    try {
        /* Initialize Configs */
        const app = configsContainer.get<IAppConfig>(CONFIGS.AppConfig);

        /* Bootstrap App */
        await app.bootstrap();
    } catch (error) {
        Logger.error({ info: error });
        process.exit(1);
    }
};

bootstrap();