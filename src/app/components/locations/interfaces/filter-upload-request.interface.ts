import { IFilterRequest } from './filter-request.interfaces';

export interface IFilterUploadRequest extends IFilterRequest {
    isChekedTransport: boolean;
    isChekedNearbyHomes: boolean;
    isChekedForecast: boolean;
}
