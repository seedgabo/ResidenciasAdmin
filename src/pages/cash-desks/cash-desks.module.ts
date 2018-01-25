import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CashDesksPage } from './cash-desks';

@NgModule({
  declarations: [
    CashDesksPage,
  ],
  imports: [
    IonicPageModule.forChild(CashDesksPage),
    PipesModule
  ],
})
export class CashDesksPageModule {}
