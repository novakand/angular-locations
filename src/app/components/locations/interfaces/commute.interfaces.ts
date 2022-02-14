import { CommuteCO2WeightEnumstring } from '../enums/commute-weight.enums';
import { MoveTypeEnumstring } from '../enums/move-type.enums';

export interface WebCommute {
    commuteUid: string;
    commute: any[];
    commuteCO2Quartile: CommuteCO2WeightEnumstring;
    cO2KgPerDay: number;
    cO2KgPerWeek: number;
    moveType: MoveTypeEnumstring;
}
