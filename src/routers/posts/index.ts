/* THIRD-PARTY MODULES */
import { Router, Request, Response } from "express";

/* SERVICES */

/* INTERFACES */

/* UTILS */
import { createRouterProxy, createRequestHandler } from "../proxy";

export default (parentRouter: Router) => {
    const childRouter = createRouterProxy(Router(), {
        curDirString: __dirname,
        parentRouter,
    });

    childRouter.get("/", createRequestHandler(async (req: Request, res: Response) => {
        const queries = req.query;
        // return await 
    });
}
