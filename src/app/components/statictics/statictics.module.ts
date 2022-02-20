import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

// components
import { StaticticsComponent } from './components/statictics/statictics.component';

@NgModule({
    declarations: [
        StaticticsComponent,
    ],
    imports: [
        MatTabsModule,
    ],
    exports: [
        StaticticsComponent,
    ],
})
export class StaticticsModule {

}
