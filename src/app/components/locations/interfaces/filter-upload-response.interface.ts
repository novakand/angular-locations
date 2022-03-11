import { IFilterResponse } from './filter-response.interface';
import { IFilterUploadRequest } from './filter-upload-request.interface';

export interface IFilterUploadResponse extends IFilterResponse {
    filter: any;
}

