import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SellerReportsPage } from './seller-reports';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    SellerReportsPage,
  ],
  imports: [
    IonicPageModule.forChild(SellerReportsPage),
    PipesModule
  ],
})
export class SellerReportsPageModule { }
