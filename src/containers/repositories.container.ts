/* THIRD-PARTY MODULES */
import { Container } from "inversify";

/* CONTAINERS */
import { ConfigsContainer } from "./configs.container";

/* SYMBOLS */
import { REPOSITORIES } from "./symbols/repositories";

/* CLASSES */
import { PostMySQLRepository } from "../data/repositories/Post.repository.mysql";
import { CommentMySQLRepository } from "../data/repositories/Comment.repository.mysql";


export class RepositoriesContainer extends Container {
    public constructor(
        configsContainer: ConfigsContainer
    ) {
        super({ defaultScope: "Singleton" });
        this.parent = configsContainer;
        this.initializeBindings();
    }

    private initializeBindings(): void {
        this.bind<PostMySQLRepository>(REPOSITORIES.PostMySQLRepository).to(PostMySQLRepository);
        this.bind<CommentMySQLRepository>(REPOSITORIES.CommentMySQLRepository).to(CommentMySQLRepository);
    }
}
