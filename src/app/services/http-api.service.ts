import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs'
import { RemoteSettingsModel } from '../models/http-api.model'
import { ConfigService } from '../services/config.service'

@Injectable()
export class HttpApi {
    private data: RemoteSettingsModel;

    constructor(
        private http: Http
    ) { }

    getRemoteSettings(): Observable<RemoteSettingsModel> {
        return this.http.get(ConfigService.URL_API)
            .map(res => <RemoteSettingsModel>res.json())
            .catch(this.handleError);
    }


    private handleError(error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

}