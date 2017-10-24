import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddCorrespondencePage } from './add-correspondence';
import { PipesModule } from './../../pipes/pipes.module';

@NgModule({
  declarations: [
    AddCorrespondencePage,
  ],
  imports: [
    IonicPageModule.forChild(AddCorrespondencePage),
    PipesModule
  ],
})
export class AddCorrespondencePageModule { }
