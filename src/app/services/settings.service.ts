import { Injectable } from '@angular/core';
import { IEnvironment } from 'src/environments/environment.interface';

@Injectable()
export class SettingsService {

  public environment: IEnvironment;

  //noinspection JSUnusedGlobalSymbols
  // tslint:disable-next-line: typedef
  public setEnvironment(env: IEnvironment) {
    this.environment = env;
  }

}
