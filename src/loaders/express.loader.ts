/* THIRD-PARTY MODULES */
import {
    Application,
    json,
    NextFunction,
    urlencoded,
    Request,
    Response,
} from "express";
import * as SwaggerUI from "swagger-ui-express";
import cors from "cors";

/* CONTAINERS */
import { configsContainer } from "../containers";

/* SYMBOLS */
import { CONFIGS } from "../containers/symbols/configs";

/* INTERFACES */
import { IAppConfig } from "../types/configs/app";
import { ICorsConfig } from "../types/configs/cors";
import { IError } from "../types/utils/response/IError";

/* MIDDLEWARES */
import SwaggerApiJsDocGenerator from "../docs";
import Router from "../routers";


export default (app: Application): void => {

    const ROUTE_PREFIX = process.env.ROUTE_PREFIX;
    const PAYLOAD_LIMIT = process.env.PAYLOAD_LIMIT;
    const SWAGGER_API_DOCS_PATH = process.env.SWAGGER_API_DOCS_PATH;

    /* HEALTH CHECK ROUTE */
    app.get("/health-check", (req: Request, res: Response): void => {
        res.status(200).json({ message: "OK" });
    });

    /* CORS */
    app.use(cors(configsContainer.get<ICorsConfig>(CONFIGS.CorsConfig).getOptions()));

    /* HTTP Payload Parser(to URL) */
    app.use(urlencoded({ limit: PAYLOAD_LIMIT, extended: true }));
    
    /* HTTP Payload Parser(to JSON) */
    app.use(json({ limit: PAYLOAD_LIMIT }));

    /* API ROUTER */
    app.use(ROUTE_PREFIX, Router());

    /* API DOCS */
    const { specs, setUpOption } = new SwaggerApiJsDocGenerator().getSwaggerSpecsAndOption();
    app.use(SWAGGER_API_DOCS_PATH, SwaggerUI.serve, SwaggerUI.setup(specs, setUpOption));

    /* 404 Handler */
    app.use((req: Request, res: Response, next: NextFunction): void => {
        const error: IError = new Error("Not Found");
        error.status = 404;
        next(error);
    });

    /* 50X Error Handler */
    app.use((err: IError, req: Request, res: Response, next: NextFunction): void => {
        const status = err.status || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
    });
}