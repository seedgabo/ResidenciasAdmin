import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReservationFilterPage } from './reservation-filter';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    ReservationFilterPage,
  ],
  imports: [
    IonicPageModule.forChild(ReservationFilterPage),
    PipesModule
  ],
})
export class ReservationFilterPageModule { }
