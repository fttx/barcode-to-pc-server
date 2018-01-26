import * as WebSocket from 'ws';

export interface Handler {
    onWsMessage(ws: WebSocket, message: any);
    onWsClose(ws: WebSocket);
    onWsError(ws: WebSocket, err: Error);
}