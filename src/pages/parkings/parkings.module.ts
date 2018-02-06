import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ParkingsPage } from './parkings';

@NgModule({
  declarations: [
    ParkingsPage,
  ],
  imports: [
    IonicPageModule.forChild(ParkingsPage),
    PipesModule
  ],
})
export class ParkingsPageModule {}
