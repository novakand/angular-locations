import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MapComponent } from './components/map/components/map/map.component';
import { StaticticsComponent } from './components/statictics/components/statictics/statictics.component';
import { LocationsComponent } from './components/locations/components/locations/locations.component';

@NgModule({
    declarations: [],
    imports: [
        RouterModule.forRoot([
            {path: '**', redirectTo: 'map' },
        ])
    ],
    exports: [
        RouterModule,
    ],
    providers: [],

})
export class AppRoutingsModule { }


