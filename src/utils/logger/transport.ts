/* THIRD-PARTY MODULES */
import * as Transport from "winston-transport";


/**
 * 커스텀 로그 전송 클래스
 * - Winston 로그 전송 클래스를 상속받아 커스텀 로그 전송 기능을 구현
 */
export default class CustomTransport extends Transport {

    constructor(opts) {
        super(opts);
    }

    public async log(info, callback) {
        setImmediate(() => {
            this.emit("logged", info);
        });

        /* CUSTOMIZE log Transport */
        callback();
    }
}

