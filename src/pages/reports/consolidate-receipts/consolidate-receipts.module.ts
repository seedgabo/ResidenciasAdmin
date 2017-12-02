import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConsolidateReceiptsPage } from './consolidate-receipts';
import { PipesModule } from './../../../pipes/pipes.module';
@NgModule({
  declarations: [
    ConsolidateReceiptsPage,
  ],
  imports: [
    IonicPageModule.forChild(ConsolidateReceiptsPage),
    PipesModule,
  ],
})
export class ConsolidateSellPageModule { }
