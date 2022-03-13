import { Injectable } from '@angular/core';

// external libs
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// services
import { HttpClientService } from '../../../services/http-client.service';

// interfaces
import { IFilterResponse } from '../interfaces/filter-response.interface';
import { IFilterUploadResponse } from '../interfaces/filter-upload-response.interface';
import { IFilterRequest } from '../interfaces/filter-request.interfaces';
import { IFilterUploadRequest } from '../interfaces/filter-upload-request.interface';

// environment
import { environment } from '../../../../environments/environment';
import { IPoint } from '../interfaces/point.interface';
import { CommutesType } from '../../map/enums/commutest-type.enum';
import { ICommutes } from '../interfaces/commutes.interface';

@Injectable()
export class LocationsService {

    public addForecastPoint$ = new BehaviorSubject<any>(null);
    public mapDrag$ = new BehaviorSubject<any>(null);
    public actionAddPoint$ = new BehaviorSubject<any>(null);
    public actionCommutes$ = new BehaviorSubject<CommutesType>(null);
    public actionPreloader$ = new BehaviorSubject<boolean>(false);
    public query$ = new BehaviorSubject<IFilterResponse>(null);
    public queryUpload$ = new BehaviorSubject<IFilterUploadResponse>(null);
    public takeFilter$ = new BehaviorSubject<IFilterUploadRequest>(null);
    public changedCommute$ = new BehaviorSubject<any>(null);
    public isChekedForecast$ = new BehaviorSubject<boolean>(null);
    public isRemoveMarker$ = new BehaviorSubject<boolean>(null);

    constructor(
        private http: HttpClientService,

    ) { }

    public filterUpdateAsync(filter: IFilterRequest): Observable<any> {
        return this.http.post<IFilterResponse>(`${environment.apiLocationUri}public/web/filter`, filter)
            .pipe(
                tap((data) => this.query$.next({ ...data, filter: this.takeFilter$.getValue() })),
            );
    }
}
