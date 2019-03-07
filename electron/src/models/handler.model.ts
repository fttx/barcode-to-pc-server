import * as WebSocket from 'ws';
import * as http from 'http';

export interface Handler {
    onWsMessage(ws: WebSocket, message: any, req: http.IncomingMessage);
    onWsClose(ws: WebSocket);
    onWsError(ws: WebSocket, err: Error);
}