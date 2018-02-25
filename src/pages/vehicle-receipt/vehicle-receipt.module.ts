import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VehicleReceiptPage } from './vehicle-receipt';
import { MomentModule } from 'angular2-moment';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    VehicleReceiptPage,
  ],
  imports: [
    IonicPageModule.forChild(VehicleReceiptPage),
    MomentModule,
    PipesModule
  ],
})
export class VehicleReceiptPageModule { }
