import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MapComponent } from './components/map/components/map/map.component';
import { StaticticsComponent } from './components/statictics/components/statictics/statictics.component';



@NgModule({
    declarations: [],
    imports: [
        RouterModule.forRoot([
            { path: 'map', component: MapComponent },
            { path: 'statictics', component: StaticticsComponent },
            { path: '**', redirectTo: 'map' }
        ])
    ],
    exports: [
        RouterModule,
    ],
    providers: [],

})
export class AppRoutingsModule { }
