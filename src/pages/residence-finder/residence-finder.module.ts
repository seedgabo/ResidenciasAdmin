import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResidenceFinderPage } from './residence-finder';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    ResidenceFinderPage,
  ],
  imports: [
    IonicPageModule.forChild(ResidenceFinderPage),
    PipesModule
  ],
})
export class ResidenceFinderPageModule { }
