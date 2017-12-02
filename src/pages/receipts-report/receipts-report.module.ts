import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceiptsReportPage } from './receipts-report';
import { PipesModule } from './../../pipes/pipes.module';
@NgModule({
  declarations: [
    ReceiptsReportPage,
  ],
  imports: [
    IonicPageModule.forChild(ReceiptsReportPage),
    PipesModule
  ],
})
export class ReceiptsReportPageModule { }
