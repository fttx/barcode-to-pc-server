import * as WebSocket from 'ws';
import * as http from 'http';

export interface Handler {
    /**
     * @param ws
     * @param message
     * @param req
     *
     * @returns **Must** return the incoming `message` parameter
     */
    onWsMessage(ws: WebSocket, message: any, req: http.IncomingMessage): Promise<any>;
    onWsClose(ws: WebSocket);
    onWsError(ws: WebSocket, err: Error);
}
