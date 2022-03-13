import { CommuteQuartiles } from '../enums/commute-quartiles.enum';
import { MoveType } from '../enums/move-type.enums';
import { ICommuteOfficeDay } from './commute-office-day.interface';
import { IPoint } from './point.interface';

export interface IFilterRequest {
    orgUid?: string;
    officeName?: string;
    cO2KgWeeklyMin?: number;
    cO2KgWeeklyMax?: number;
    transports?: MoveType[];
    nearbyKm?: number;
    nearbyHomesCountMin?: number;
    nearbyHomesCountMax?: number;
    forecastPoints?: IPoint;
    commuteQuartiles?: CommuteQuartiles[];
    changedCommuteOfficeDays?: ICommuteOfficeDay;
}
