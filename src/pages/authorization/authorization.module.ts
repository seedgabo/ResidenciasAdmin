import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AuthorizationPage } from './authorization';

@NgModule({
  declarations: [
    AuthorizationPage,
  ],
  imports: [
    IonicPageModule.forChild(AuthorizationPage),
    PipesModule
  ],
})
export class AuthorizationPageModule { }
