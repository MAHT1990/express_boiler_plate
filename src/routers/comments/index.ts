/* THIRD-PARTY MODULES */
import { Router, Request, Response } from "express";

/* CONTAINERS */
import { servicesContainer } from "../../containers/services.container";

/* SYMBOLS */
import { SERVICES } from "../../containers/symbols/services";

/* VALIDATORS */
import { validateFindComment, validateCreateComment, validateUpdateComment } from "../../middlewares/validators/entities/Comment/validator";

/* SERVICES */
import { CommentService } from "../../services/Comment";

/* ENTITIES */
import { CommentMySQLEntity } from "../../data/entities/Comment.entity.mysql";

/* INTERFACES */
import { FindDto } from "../../types/dto/base.dto";

/* UTILS */
import { createRouterProxy, createRequestHandler } from "../proxy";


export default (parentRouter: Router) => {
    const childRouter = createRouterProxy(Router(), {
        curDirString: __dirname,
        parentRouter,
    });

    childRouter.get("/", validateFindComment, createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<CommentService>(SERVICES.CommentService);
        return await service.findBy({ queries: req.query })
    }));

    childRouter.post("/", validateCreateComment, createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<CommentService>(SERVICES.CommentService);
        return await service.create({
            data: req.body,
        })
    }));

    childRouter.get("/:id", validateFindComment, createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<CommentService>(SERVICES.CommentService);
        return await service.findById({
            id: req.params.id,
        })
    }));

    childRouter.put("/:id", validateUpdateComment, createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<CommentService>(SERVICES.CommentService);
        return await service.updateById(
            Number(req.params.id),
            req.body,
        )
    }));

    childRouter.delete("/:id", createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<CommentService>(SERVICES.CommentService);
        return await service.deleteById(
            Number(req.params.id),
        )
    }));
}

