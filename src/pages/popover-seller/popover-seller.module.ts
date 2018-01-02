import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PopoverSellerPage } from './popover-seller';

@NgModule({
  declarations: [
    PopoverSellerPage,
  ],
  imports: [
    IonicPageModule.forChild(PopoverSellerPage),
    PipesModule
  ],
})
export class PopoverSellerPageModule { }
