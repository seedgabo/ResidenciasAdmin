import { Login } from './login';
import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    Login,
  ],
  imports: [
    IonicPageModule.forChild(Login),
    PipesModule
  ],
})
export class LoginModule {}
