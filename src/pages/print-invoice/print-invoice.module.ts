import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PrintInvoicePage } from './print-invoice';

@NgModule({
  declarations: [
    PrintInvoicePage,
  ],
  imports: [
    IonicPageModule.forChild(PrintInvoicePage),
    PipesModule
  ],
})
export class PrintInvoicePageModule { }
