import { Options } from '@angular-slider/ngx-slider';
export interface ISliderOptions extends Options {
    value: number;
    highValue?: number;
    steps?: number;
}
