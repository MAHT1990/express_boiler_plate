/* THIRD-PARTY MODULES */
import { Router } from "express";

/* UTILS */
import { createRouterProxy } from "./proxy";


export default () => {
    const mainRouter = createRouterProxy(Router(), {
        curDirString: __dirname,
    });

    return mainRouter;
};





