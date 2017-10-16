import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VehicleEditorPage } from './vehicle-editor';
import { PipesModule } from './../../pipes/pipes.module';

@NgModule({
  declarations: [
    VehicleEditorPage,
  ],
  imports: [
    IonicPageModule.forChild(VehicleEditorPage),
    PipesModule
  ],
})

export class VehicleEditorPageModule { }
