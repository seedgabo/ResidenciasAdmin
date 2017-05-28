import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VisitCreatorPage } from './visit-creator';

@NgModule({
  declarations: [
    VisitCreatorPage,
  ],
  imports: [
    IonicPageModule.forChild(VisitCreatorPage),
  ],
  exports: [
    VisitCreatorPage
  ]
})
export class VisitCreatorPageModule {}
