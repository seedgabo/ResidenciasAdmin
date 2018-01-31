import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PendingsPage } from './pendings';

@NgModule({
  declarations: [
    PendingsPage,
  ],
  imports: [
    IonicPageModule.forChild(PendingsPage),
    PipesModule
  ],
})
export class PendingsPageModule {}
