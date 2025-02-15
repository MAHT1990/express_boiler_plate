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

    /* 댓글 조회 */
    childRouter.get("/", validateFindComment, createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<CommentService>(SERVICES.CommentService);
        return await service.findBy({ queries: req.query })
    }, {
        summary: "댓글 조회",
        description: "댓글을 조회합니다.",
    }));

    /* 댓글 생성 */
    childRouter.post("/", validateCreateComment, createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<CommentService>(SERVICES.CommentService);
        return await service.create({
            data: req.body,
        })
    }, {
        summary: "댓글 생성",
        description: "댓글을 생성합니다.",
    }));

    /* 댓글 상세 조회 */
    childRouter.get("/:commentId", validateFindComment, createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<CommentService>(SERVICES.CommentService);
        return await service.findById({
            id: req.params.commentId,
        })
    }, {
        summary: "댓글 상세 조회",
        description: "댓글을 상세하게 조회합니다.",
    }));

    /* 댓글 수정 */
    childRouter.put("/:commentId", validateUpdateComment, createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<CommentService>(SERVICES.CommentService);
        return await service.updateById(
            Number(req.params.commentId),
            req.body,
        )
    }, {
        summary: "댓글 수정",
        description: "댓글을 수정합니다.",
    }));

    /* 댓글 삭제 */
    childRouter.delete("/:commentId", createRequestHandler(async (req: Request, res: Response) => {
        const service = servicesContainer.get<CommentService>(SERVICES.CommentService);
        return await service.deleteById(
            Number(req.params.commentId),
        )
    }, {
        summary: "댓글 삭제",
        description: "댓글을 삭제합니다.",
        deprecated: true,
    }));
}