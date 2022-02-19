
export class FilterRequest {
    public orgUid?: string;
    public officeUid: string;
    public officeName?: string;
    public cO2KgWeeklyMin?: number;
    public cO2KgWeeklyMax?: number;
    public transports?: any[];
    public nearbyKm: number;
    public nearbyHomesCountMin: number;
    public nearbyHomesCountMax: number;
    public forecastPointLat?: number;
    public forecastPointLon?: number;
    public showCommutes?: any[];
    public excludedCommutes?: string;
}
