import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs'
import { HttpApiModel } from '../models/http-api.model'

@Injectable()
export class HttpApi {
    public static API_URL = "https://barcodetopc.com/http-api.json"
    private data: HttpApiModel;

    constructor(
        private http: Http
    ) { }

    get(): Observable<HttpApiModel> {
        return this.http.get(HttpApi.API_URL)
            .map(res => <HttpApiModel>res.json())
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