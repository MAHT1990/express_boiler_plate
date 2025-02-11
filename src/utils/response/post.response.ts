import { IResponseCodeInfo } from "../../types/utils/response/IResponse";


const ENTITY_CODE = "USR";
const ENTITY_NAME_KOR = "사용자";


export const postServiceResponseInfo: IResponseCodeInfo = {
    "fetched": {
        status: 200,
        code: `${ENTITY_CODE}-000`,
        message: `${ENTITY_NAME_KOR} 조회 성공`,
    },
    "created": {
        status: 201,
        code: `${ENTITY_CODE}-001`,
        message: `${ENTITY_NAME_KOR} 생성 성공`,
    },
    "updated": {
        status: 200,
        code: `${ENTITY_CODE}-002`,
        message: `${ENTITY_NAME_KOR} 수정 성공`,
    },
    "deleted": {
        status: 200,
        code: `${ENTITY_CODE}-003`,
        message: `${ENTITY_NAME_KOR} 삭제 성공`,
    },
    "notFound": {
        status: 404,
        code: `${ENTITY_CODE}-004`,
        message: `${ENTITY_NAME_KOR} 존재하지 않음`,
    },
    "invalid": {
        status: 400,
        code: `${ENTITY_CODE}-005`,
        message: `${ENTITY_NAME_KOR} 유효하지 않음`,
    },
    "failed": {
        status: 500,
        code: `${ENTITY_CODE}-006`,
        message: `${ENTITY_NAME_KOR} 조회 실패`,
    },
};

