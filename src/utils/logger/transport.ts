/* THIRD-PARTY MODULES */
import TransportStream from "winston-transport";


/**
 * 커스텀 로그 전송 클래스
 * - Winston 로그 전송 클래스를 상속받아 커스텀 로그 전송 기능을 구현
 */
export default class CustomTransport extends TransportStream {

    constructor(opts?: TransportStream.TransportStreamOptions) {
        super(opts);
    }

    public async log(info: any, callback: () => void): Promise<void> {
        setImmediate(() => {
            this.emit("logged", info);
        });

        /* CUSTOMIZE log Transport */
        callback();
    }
}

