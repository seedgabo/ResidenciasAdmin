import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InvoicePage } from './invoice';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    InvoicePage,
  ],
  imports: [
    IonicPageModule.forChild(InvoicePage),
    PipesModule
  ],
})
export class InvoicePageModule {}
