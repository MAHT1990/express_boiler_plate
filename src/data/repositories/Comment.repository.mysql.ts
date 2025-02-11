/* THIRD-PARTY MODULES */
import { inject, injectable } from "inversify";

/* ENTITIES */
import { CommentMySQLEntity } from "../entities/Comment.entity.mysql";

/* SYMBOLS */
import { CONFIGS } from "../../containers/symbols/configs";

/* INTERFACES */
import { IDataSourceConfig } from "../../types/configs/dataSource";

/* CLASSES */
import { BaseRepository } from "./base";


@injectable()
export class CommentMySQLRepository extends BaseRepository<CommentMySQLEntity> {
    constructor(
        @inject(CONFIGS.DataSourceConfig) dataSourceConfig: IDataSourceConfig
    ) {
        super(dataSourceConfig, CommentMySQLEntity);
    }

    /* implement custom methods here */
} 