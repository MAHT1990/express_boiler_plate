/* BUILT-IN MODULES */
import * as nodePath from "path";

/* THIRD-PARTY MODULES */
import * as dotenv from "dotenv";
import { injectable } from "inversify";

/* INTERFACES */
import { IEnvConfig } from "../types/configs/env";


@injectable()
export class EnvConfig implements IEnvConfig {
    private readonly envPath: string;

    public constructor() {
        this.envPath = nodePath.resolve(
            nodePath.join(__dirname, "../../.env")
        );
    }
    
    public getEnvPath(): string {
        return this.envPath;
    }

    public initialize(): void {
        dotenv.config({ path: this.envPath });
    }
}