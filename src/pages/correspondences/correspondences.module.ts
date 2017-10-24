import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CorrespondencesPage } from './correspondences';
import { PipesModule } from './../../pipes/pipes.module';

@NgModule({
  declarations: [
    CorrespondencesPage,
  ],
  imports: [
    IonicPageModule.forChild(CorrespondencesPage),
    PipesModule
  ],
})
export class CorrespondencesPageModule { }
