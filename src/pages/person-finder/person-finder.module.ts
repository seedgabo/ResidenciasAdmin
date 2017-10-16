import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonFinderPage } from './person-finder';

@NgModule({
  declarations: [
    PersonFinderPage,
  ],
  imports: [
    IonicPageModule.forChild(PersonFinderPage),
    PipesModule
  ],
})
export class PersonFinderPageModule { }
