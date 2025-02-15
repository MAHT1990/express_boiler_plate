/* THIRD-PARTY MODULES */
import { Container } from "inversify";

/* CONTAINERS */
import { repositoriesContainer, RepositoriesContainer } from "./repositories.container";

/* SYMBOLS */
import { SERVICES } from "./symbols/services";

/* SERVICES */
import { PostService } from "../services/Post";
import { CommentService } from "../services/Comment";


/**
 * 서비스 컨테이너
 */
export class ServicesContainer extends Container {
    public constructor(
        repositoriesContainer: RepositoriesContainer,
    ) {
        super({ defaultScope: "Singleton" });
        this.parent = repositoriesContainer;
        this.initializeBindings();
    }

    private initializeBindings(): void {
        this.bind<PostService>(SERVICES.PostService).to(PostService);
        this.bind<CommentService>(SERVICES.CommentService).to(CommentService);
    }
}


export const servicesContainer = new ServicesContainer(repositoriesContainer);
