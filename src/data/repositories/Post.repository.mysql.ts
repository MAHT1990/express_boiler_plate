/* THIRD-PARTY MODULES */
import { inject, injectable } from "inversify";

/* ENTITIES */
import { PostMySQLEntity } from "../entities/Post.entity.mysql";

/* SYMBOLS */
import { CONFIGS } from "../../containers/symbols/configs";

/* INTERFACES */
import { IDataSourceConfig } from "../../types/configs/dataSource";

/* CLASSES */
import { BaseRepository } from "./base";


@injectable()
export class PostMySQLRepository extends BaseRepository<PostMySQLEntity> {
    constructor(
        @inject(CONFIGS.DataSourceConfig) dataSourceConfig: IDataSourceConfig
    ) {
        super(dataSourceConfig, PostMySQLEntity);
    }

    /* implement custom methods here */
}
