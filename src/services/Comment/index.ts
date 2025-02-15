/* THIRD-PARTY MODULES */
import { inject, injectable } from "inversify";

/* ENTITIES */
import { CommentMySQLEntity } from "../../data/entities/Comment.entity.mysql";

/* REPOSITORIES */
import { CommentMySQLRepository } from "../../data/repositories/Comment.repository.mysql";

/* SYMBOLS */
import { REPOSITORIES } from "../../containers/symbols/repositories";
import { SERVICES } from "../../containers/symbols/services";

/* SERVICES */
import { BaseService } from "../base";

/* UTILS */
import { commentResponse } from "../../utils/response";


@injectable()
export class CommentService extends BaseService<CommentMySQLEntity> {
    constructor(
        @inject(REPOSITORIES.CommentMySQLRepository) repository: CommentMySQLRepository,
    ) {
        super({
            repositoryMaster: repository.master,
            repositorySlave: repository.slave,
            serviceResponse: commentResponse,
        });
    }
}
