import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResidencePage } from './residence';
import { PipesModule } from "../../pipes/pipes.module";
@NgModule({
  declarations: [
    ResidencePage,
  ],
  imports: [
    IonicPageModule.forChild(ResidencePage),
    PipesModule
  ],
})
export class ResidencePageModule { }
