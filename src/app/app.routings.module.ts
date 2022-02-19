import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

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


