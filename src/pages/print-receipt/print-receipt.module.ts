import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PrintReceiptPage } from './print-receipt';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    PrintReceiptPage,
  ],
  imports: [
    IonicPageModule.forChild(PrintReceiptPage),
    PipesModule
  ],
})
export class PrintReceiptPageModule { }
