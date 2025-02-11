/**
 * CORS 옵션 인터페이스
 * 
 * @memberof ICorsConfig
 */
export interface CorsOptions {
    origin: string | string[] | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
    credentials?: boolean;
    methods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
}

/**
 * CORS 설정 인터페이스
 * 
 * @see ICorsConfig
 */
export interface ICorsConfig {
    getOptions(): CorsOptions;
}