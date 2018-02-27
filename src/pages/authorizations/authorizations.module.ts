import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AuthorizationsPage } from './authorizations';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    AuthorizationsPage,
  ],
  imports: [
    IonicPageModule.forChild(AuthorizationsPage),
    PipesModule
  ],
})
export class AuthorizationsPageModule { }
