import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MapComponent } from '../map/components/map/map.component';
import { StaticticsComponent } from '../statictics/components/statictics/statictics.component';


@NgModule({
    declarations: [],
    imports: [
        RouterModule.forRoot([
            { path: '', redirectTo: 'map', pathMatch: 'full' },
            { path: 'map', component: MapComponent },
            { path: 'statictics', component: StaticticsComponent },
            { path: 'locations', component: MapComponent },
        ])
    ],
    exports: [
        RouterModule,
    ],
    providers: [],

})
export class AppLocationModule { }
