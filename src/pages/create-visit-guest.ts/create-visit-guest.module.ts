import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateVisitGuestPage } from './create-visit-guest';
import { PipesModule } from '../../pipes/pipes.module';
@NgModule({
  declarations: [CreateVisitGuestPage],
  imports: [
    IonicPageModule.forChild(CreateVisitGuestPage),
    PipesModule
  ],
})
export class CreateVisitGuestPageModule { }
