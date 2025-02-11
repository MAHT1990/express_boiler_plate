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