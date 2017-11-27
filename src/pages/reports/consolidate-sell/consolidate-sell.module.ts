import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConsolidateSellPage } from './consolidate-sell';
import { PipesModule } from './../../../pipes/pipes.module';
import { KeysPipe } from '../../../pipes/keys/keys';
@NgModule({
  declarations: [
    ConsolidateSellPage,
  ],
  imports: [
    IonicPageModule.forChild(ConsolidateSellPage),
    PipesModule,
  ],
})
export class ConsolidateSellPageModule { }
