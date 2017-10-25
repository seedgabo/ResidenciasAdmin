import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VehiclesPage } from './vehicles';

@NgModule({
  declarations: [
    VehiclesPage,
  ],
  imports: [
    IonicPageModule.forChild(VehiclesPage),
    PipesModule
  ],
})
export class VehiclesPageModule { }
