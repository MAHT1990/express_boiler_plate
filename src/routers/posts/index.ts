/* THIRD-PARTY MODULES */
import { Router, Request, Response } from "express";

/* CONTAINERS */
import { servicesContainer } from "../../containers/services.container";

/* SYMBOLS */
import { SERVICES } from "../../containers/symbols/services";

/* VALIDATORS */
import { validateFindPost, validateCreatePost, validateUpdatePost } from "../../middlewares/validators/entities/Post/validator";

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

    /* 게시글 조회 */
    childRouter.get("/", validateFindPost, createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<PostService>(SERVICES.PostService);
        return await service.findBy({ queries: req.query })
    }, {
        summary: "게시글 조회",
        description: "게시글을 조회합니다.",
    }));

    /* 게시글 생성 */
    childRouter.post("/", validateCreatePost, createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<PostService>(SERVICES.PostService);
        return await service.create({
            data: req.body,
        })
    }, {
        summary: "게시글 생성",
        description: "게시글을 생성합니다.",
    }));

    /* 게시글 상세 조회 */
    childRouter.get("/:postId", validateFindPost, createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<PostService>(SERVICES.PostService);
        return await service.findById({
            id: req.params.postId,
        })
    }, {
        summary: "게시글 상세 조회",
        description: "게시글을 상세하게 조회합니다.",
    }));

    /* 게시글 수정 */
    childRouter.put("/:postId", validateUpdatePost, createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<PostService>(SERVICES.PostService);
        return await service.updateById(
            Number(req.params.postId),
            req.body,
        )
    }, {
        summary: "게시글 수정",
        description: "게시글을 수정합니다.",
    }));

    /* 게시글 삭제 */
    childRouter.delete("/:postId", createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<PostService>(SERVICES.PostService);
        return await service.deleteById(
            Number(req.params.postId),
        )
    }, {
        summary: "게시글 삭제",
        description: "게시글을 삭제합니다.",
        deprecated: true,
    }));
}
