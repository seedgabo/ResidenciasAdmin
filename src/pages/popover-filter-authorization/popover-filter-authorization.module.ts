import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PopoverFilterAuthorizationPage } from './popover-filter-authorization';

@NgModule({
  declarations: [
    PopoverFilterAuthorizationPage,
  ],
  imports: [
    IonicPageModule.forChild(PopoverFilterAuthorizationPage),
    PipesModule
  ],
})
export class PopoverFilterAuthorizationPageModule { }
