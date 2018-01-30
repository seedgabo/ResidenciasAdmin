import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LobbyPage } from './lobby';

@NgModule({
  declarations: [
    LobbyPage,
  ],
  imports: [
    IonicPageModule.forChild(LobbyPage),
    PipesModule
  ],
})
export class LobbyPageModule {}
