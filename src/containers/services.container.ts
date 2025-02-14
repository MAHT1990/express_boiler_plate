/* THIRD-PARTY MODULES */
import { Container } from "inversify";

/* CONTAINERS */
import { repositoriesContainer, RepositoriesContainer } from "./repositories.container";

/* SYMBOLS */
import { SERVICES } from "./symbols/services";

/* SERVICES */
import { PostService } from "../services/Post";


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
    }
}


export const servicesContainer = new ServicesContainer(repositoriesContainer);
