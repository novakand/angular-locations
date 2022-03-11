import { Injectable } from '@angular/core';

// external libs
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// services
import { HttpClientService } from '../../../services/http-client.service';

// interfaces
import { FilterRequest } from '../models/qure.model';

// environment
import { environment } from '../../../../environments/environment';
import { IFilterResponse } from '../interfaces/filter-response.interface';
import { IFilterUploadResponse } from '../interfaces/filter-upload-response.interface';

@Injectable()
export class LocationsService {

    public addForecastPoint$ = new BehaviorSubject<any>(null);
    public mapDrag$ = new BehaviorSubject<any>(null);
    public actionAddPoint$ = new BehaviorSubject<any>(null);
    public actionCommutes$ = new BehaviorSubject<any>(null);
    public actionPreloader$ = new BehaviorSubject<any>(false);
    public query$ = new BehaviorSubject<IFilterResponse>(null);
    public queryUpload$ = new BehaviorSubject<IFilterUploadResponse>(null);
    public changedCommute$ = new BehaviorSubject<any>(null);
    public isChekedForecast$ = new BehaviorSubject<any>(null);
    public isRemoveMarker$ = new BehaviorSubject<any>(null);

    constructor(
        private http: HttpClientService,

    ) { }

    public filterUpdateAsync(filter: any): Observable<any> {
        return this.http.post<IFilterResponse>(`${environment.apiLocationUri}public/web/filter`, filter)
            .pipe(
                tap((data) => this.query$.next({ ...data, filter: filter })),
            );
    }
}
