/* THIRD-PARTY MODULES */
import { Router, Request, Response } from "express";

/* CONTAINERS */
import { servicesContainer } from "../../containers/services.container";

/* SYMBOLS */
import { SERVICES } from "../../containers/symbols/services";

/* VALIDATORS */
import { validateFindPost, validateCreatePost } from "../../middlewares/validators/entities/Post/validator";

/* SERVICES */
import { PostService } from "../../services/Post";

/* ENTITIES */
import { PostMySQLEntity } from "../../data/entities/Post.entity.mysql";

/* INTERFACES */
import { FindDto } from "../../types/dto/base.dto";

/* UTILS */
import { createRouterProxy, createRequestHandler } from "../proxy";


export default (parentRouter: Router) => {
    const childRouter = createRouterProxy(Router(), {
        curDirString: __dirname,
        parentRouter,
    });

    childRouter.get("/", validateFindPost, createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<PostService>(SERVICES.PostService);
        return await service.findBy({ queries: req.query })
    }));

    childRouter.post("/", validateCreatePost, createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<PostService>(SERVICES.PostService);
        return await service.create({
            data: req.body,
        })
    }));
}
