/* BUILT-IN MODULES */
import * as fs from "fs";
import * as path from "path";

/* THIRD-PARTY MODULES */
import { Router } from "express";


const readSubDir = (
    dir: string,
    filelist: string[] = []
): string[] => {
    const subDirs: string[] = fs.readdirSync(dir);

    subDirs.forEach(file => {
        const filePath: string = path.join(dir, file);

        if (!fs.statSync(filePath).isDirectory()) return;

        /* ts-node 환경 */
        if (fs.existsSync(path.join(filePath, "index.ts"))) {
            filelist.push(path.join(filePath, "index.ts"));
        }

        /* js 환경 */
        if (fs.existsSync(path.join(filePath, "index.js"))) {
            filelist.push(path.join(filePath, "index.js"));
        }
    });

    return filelist;
};


export default (
    parentRouter: Router,
    curDir: string = __dirname
) => {
    readSubDir(curDir).forEach(file => {
        const module = require(file);
        module.default(parentRouter);
    });
};