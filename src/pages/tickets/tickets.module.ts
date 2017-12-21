import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TicketsPage } from './tickets';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    TicketsPage,
  ],
  imports: [
    IonicPageModule.forChild(TicketsPage),
    PipesModule
  ],
})
export class TicketsPageModule { }
