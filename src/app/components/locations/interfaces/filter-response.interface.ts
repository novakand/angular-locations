import { IAllOffices } from './all-offices.interface';
import { ICommutes } from './commutes.interface';
import { IForecastPointsRes } from './forecast-point.interfaces';
import { INearby } from './nearby.interface';

export interface IFilterResponse {
    officeUid: string;
    allOffices: IAllOffices[];
    commutes: ICommutes[];
    nearbies: INearby[];
    forecastPoints: IForecastPointsRes[];
    totalCO2KgPerWeek: any;
    officeTotalCO2KgPerDay: number;
    officeTotalCO2KgForecastPerDay: number;
    officeTotalCO2KgPerWeek: number;
    officeTotalCO2KgForecastPerWeek: number;
}

