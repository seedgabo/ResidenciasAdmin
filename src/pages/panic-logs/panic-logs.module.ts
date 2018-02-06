import { PanicLogsPage } from './panic-logs';
import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    PanicLogsPage,
  ],
  imports: [
    IonicPageModule.forChild(PanicLogsPage),
    PipesModule
  ],
})
export class PanicLogsPageModule {}
