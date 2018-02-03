import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VisitPopoverFiltersPage } from './visit-popover-filters';

@NgModule({
  declarations: [
    VisitPopoverFiltersPage,
  ],
  imports: [
    IonicPageModule.forChild(VisitPopoverFiltersPage),
    PipesModule
  ],
})
export class VisitPopoverFiltersPageModule { }
