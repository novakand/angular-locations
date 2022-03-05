import { MarkerType } from '../enums/marker-type';
export interface IMarkerOptions extends google.maps.MarkerOptions {
    forecastPerDay?: number;
    forecastPerWeek?: number;
    id?: number;
    type?: MarkerType;
    data?: any;
}
