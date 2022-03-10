import { CommuteQuartiles } from '../enums/commute-quartiles.enum';
import { MoveType } from '../enums/move-type.enums';

export interface ICommutes {
    commuteUid: string;
    commuteCO2Quartile: CommuteQuartiles[];
    allOfficesTotalCO2KgPerWeek: number;
    cO2KgPerDay: number;
    cO2KgPerWeek: number;
    moveType: MoveType[];
    order: number;
    dailyKm: number;
    officeDays: number;
    commute: any;
}
