/* CONSTANTS */
const REQUEST_BODY_METADATA_KEY = "bodyMetadata:";
const QUERY_METADATA_KEY = "queryMetadata:";


/**
 * SWAGGER API 문서를 위한 Decorator
 * - BaseSchema 클래스를 상속받은 클래스의 프로퍼티에 사용.
 * 
 * 인스턴스의 metadata내에 bodyMetadata:propertyKey 키로 저장.  
 * 
 * @param params.type - 데이터 타입
 * @param params.description - 설명
 * @param params.example - 예시
 * @param params.required - 필수 여부
 */
export function SwaggerRequestBody(
    params: {
        type: string,
        description: string,
        required?: boolean,
        example: any
    }) {
        params.required = !!params.required;
        return function (target: object, propertyKey: string) {
            Reflect.defineMetadata(`${REQUEST_BODY_METADATA_KEY}${propertyKey}`, params, target);
        };
}


/**
 * Swagger API 문서를 위한 데코레이터 함수
 * - BaseSchema 클래스를 상속받은 클래스의 프로퍼티에 사용.
 * 
 * 인스턴스의 metadata내에 queryMetadata:propertyKey 키로 저장.  
 * 
 * @param params.type - 데이터 타입
 * @param params.description - 설명
 * @param params.example - 예시
 * @param params.required - 필수 여부
 * @param params.collectionFormat - 배열 데이터의 구분자
 *  - csv: /endpoint?param=1,2,3
 *  - ssv: /endpoint?param=1 2 3 : /endpoint?param=1%202%203
 *  - tsv: /endpoint?param=1 2 3 : /endpoint?param=1%092%093
 *  - pipes: /endpoint?param=1|2|3 : /endpoint?param=1%7C2%7C3
 *  - multi: /endpoint?param=1&param=2&param=3
 * @param params.items - 배열 데이터의 타입과 예시
 *   - items.type: 배열 데이터의 타입
 *   - items.example: 배열 데이터의 예시
 */
export function SwaggerQueryString(
    params: {
        type: string,
        description: string,
        example?: any
        required?: boolean,
        collectionFormat?: "csv" | "ssv" | "tsv" | "pipes" | "multi",
        items?: {
            type: string,
            example: any
        }
    }) {
    params.required = !!params.required;
    return function(target: object, propertyKey: string) {
        Reflect.defineMetadata(`${QUERY_METADATA_KEY}${propertyKey}`, params, target);
    };
}


class MetadataManager {
    static getRequestBodyMetadata(target: object): Record<string, any> {
        return Reflect.getMetadataKeys(target)
            .filter(key => key.startsWith(REQUEST_BODY_METADATA_KEY))
            .reduce((acc, key) => {
                const value = Reflect.getMetadata(key, target);
                const newKey = key.replace(REQUEST_BODY_METADATA_KEY, "");
                acc[newKey as string] = value;

                return acc;
            }, {} as Record<string, any>);
    }

    static getRequestBodyExample(target: object): Record<string, any> {
        return Reflect.getMetadataKeys(target)
            .filter(key => key.startsWith(REQUEST_BODY_METADATA_KEY))
            .reduce((acc, key) => {
                const value = Reflect.getMetadata(key, target);
                const newKey = key.replace(REQUEST_BODY_METADATA_KEY, "");
                acc[newKey as string] = value.example;
                
                return acc;
            }, {} as Record<string, any>);
    }

    static getQueryMetadata(target: object): Record<string, any> {
        return Reflect.getMetadataKeys(target)
            .filter(key => key.startsWith(QUERY_METADATA_KEY))
            .reduce((acc, key) => {
                const value = Reflect.getMetadata(key, target);
                const newKey = key.replace(QUERY_METADATA_KEY, "");
                acc[newKey as string] = value;

                return acc;
            }, {} as Record<string, any>);
    }
}

/**
 * BaseSchema 클래스를 상속받아서 사용하는 클래스는
 * - requestBodyData
 * - queryData
 * - requestBodyExample
 * 프로퍼티 사용가능
 */
export abstract class BaseSchema {
    get requestBodyData(): Record<string, any> {
        return MetadataManager.getRequestBodyMetadata(this);
    }

    get queryData(): Record<string, any> {
        return MetadataManager.getQueryMetadata(this);
    }

    get requestBodyExample(): Record<string, any> {
        return MetadataManager.getRequestBodyExample(this);
    }
}