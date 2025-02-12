export interface ISwaggerApiDoc {
    [path: string]: ISwaggerApiOption;
};

export interface ISwaggerApiOption {
    [method: string]: ISwaggerApiOptionDetail;
};

export interface ISwaggerApiOptionDetail {
    tags: string[];
    deprecated?: boolean;
    summary: string;
    description: string;
    operationId: string;
    parameters?: Array<any>;
    requestBody?: ISwaggerApiRequestBody | ISwaggerApiArrayRequestBody;
    responses?: ISwaggerApiResponse;
    security?: ISwaggerApiSecurity[];
};

export interface ISwaggerApiRequestBody {
    description: string;
    required: boolean;
    content: {
        "application/json": {
            schema: {
                properties: {
                    [key: string]: {
                        type: string;
                        description?: string;
                        items?: object;
                        example?: number | string | object | Array<any>;
                    }
                }
            }
        }
    }
}

export interface ISwaggerApiArrayRequestBody {
    description: string;
    required: boolean;
    content: {
        "application/json": {
            schema: {
                type: "array";
                items: {
                    properties: {
                        [key: string]: {
                            type: string;
                            description?: string;
                            items?: object;
                            example?: number | string | object | Array<any>;
                        }
                    }
                }
            }
        }
    }
}

export interface ISwaggerApiResponse {
    [key: string]: {
        description: string;
        content: object;
    }
}

export interface ISwaggerApiSecurity {
    [security: string]: Array<any>;
}
