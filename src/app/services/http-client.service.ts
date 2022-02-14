import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { IRequestOptions } from '../interfaces/request-options.interface';
import { SettingsService } from './settings.service';

import { Observable } from 'rxjs';

@Injectable()
export class HttpClientService {

    constructor(private http: HttpClient,
                protected settingsService: SettingsService,
    ) { }

    public get<T>(url: string, options?: IRequestOptions | null): Observable<T> {
        options = options || {};

        options.withCredentials = true;

        return this.http.get<T>(url, options);
    }


    public post<T>(url: string, body: any, options?: IRequestOptions): Observable<T> {
        options = this._getDefaultOptions(options);
        return this.http.post<T>(url, JSON.stringify(body), options);
    }

    public put<T>(url: string, body: any, options?: IRequestOptions): Observable<T> {
        options = this._getDefaultOptions(options);

        return this.http.put<T>(url, JSON.stringify(body), options);
    }

    public delete(url: string, options?: IRequestOptions): Observable<any> {
        return this.http.delete(url, options);
    }

    private _getDefaultOptions(options?: IRequestOptions): IRequestOptions {
        options = options || {};
        options.headers = options.headers || new HttpHeaders({ 'Content-Type': 'application/json' });
        options.withCredentials = true;
        return options;
    }
}
