import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResidencesPage } from './residences';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    ResidencesPage,
  ],
  imports: [
    IonicPageModule.forChild(ResidencesPage),
    PipesModule
  ],
})
export class ResidencesPageModule { }
