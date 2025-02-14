/* THIRD-PARTY MODULES */
import { inject, injectable } from "inversify";

/* ENTITIES */
import { PostMySQLEntity } from "../../data/entities/Post.entity.mysql";

/* REPOSITORIES */
import { PostMySQLRepository } from "../../data/repositories/Post.repository.mysql";

/* SYMBOLS */
import { REPOSITORIES } from "../../containers/symbols/repositories";

/* SERVICES */
import { BaseService } from "../base";

/* UTILS */
import { postResponse } from "../../utils/response";


@injectable()
export class PostService extends BaseService<PostMySQLEntity> {
    constructor(
        @inject(REPOSITORIES.PostMySQLRepository) repository: PostMySQLRepository,
    ) {
        super({
            repositoryMaster: repository.master,
            repositorySlave: repository.slave,
            serviceResponse: postResponse,
        })
    }
}






