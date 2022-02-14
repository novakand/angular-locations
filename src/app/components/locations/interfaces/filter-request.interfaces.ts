export interface FilterRequest {
    orgUid: string;
    officeName: string;
    cO2KgWeeklyMin: number;
    cO2KgWeeklyMax: number;
    transports: string[];
    MoveTypeEnumstring: [];
    nearbyKm: number;
    nearbyHomes: number;
    forecastPointLat: number;
    forecastPointLon: number;
    showCommutes: any[];
    CommuteCO2WeightEnumstring: any[];
    excludedCommutes: any[];
}
