import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DashPage } from './dash';
import { IonicPage } from 'ionic-angular/navigation/ionic-page';
import { ComponentsModule } from '../../components/components.module';
@IonicPage()
@NgModule({
  declarations: [
    DashPage,
  ],
  imports: [
    IonicPageModule.forChild(DashPage),
    PipesModule,
    ComponentsModule
  ],
})
export class DashPageModule { }
