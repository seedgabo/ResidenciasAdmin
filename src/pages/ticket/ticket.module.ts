import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TicketPage } from './ticket';
import { PipesModule } from '../../pipes/pipes.module';
@NgModule({
  declarations: [
    TicketPage,
  ],
  imports: [
    IonicPageModule.forChild(TicketPage),
    PipesModule
  ],
})
export class TicketPageModule { }
