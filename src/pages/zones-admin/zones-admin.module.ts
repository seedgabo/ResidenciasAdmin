import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ZonesAdminPage } from './zones-admin';

@NgModule({
  declarations: [
    ZonesAdminPage,
  ],
  imports: [
    IonicPageModule.forChild(ZonesAdminPage),
    PipesModule
  ],
})
export class ZonesAdminPageModule {}
