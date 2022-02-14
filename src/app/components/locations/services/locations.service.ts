import { Injectable } from '@angular/core';

// external libs
import { Observable } from 'rxjs';

// services
import { HttpClientService } from 'src/app/services/http-client.service';

// interfaces
import { FilterRequest } from '../interfaces/filter-request.interfaces';
import { FilterResponce } from '../interfaces/filter-responce.interfaces';

// environment
import { environment } from 'src/environments/environment';

@Injectable()
export class LocationsService {

    constructor(
         private http: HttpClientService,

    ) { }

    public getLocations(filter: FilterRequest): Observable<FilterResponce> {
       return this.http.post<FilterResponce>(`${environment.apiLocationUri}public/web/filter`, filter);
    }
}
