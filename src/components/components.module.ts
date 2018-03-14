import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ResidenceSelectorComponent } from './residence-selector/residence-selector';
import { VehicleSelectorComponent } from './vehicle-selector/vehicle-selector';
import { PersonSelectorComponent } from './person-selector/person-selector';

import { IonicModule } from 'ionic-angular';
import { PipesModule } from '../pipes/pipes.module';
@NgModule({
  declarations: [ResidenceSelectorComponent, VehicleSelectorComponent, PersonSelectorComponent],
  imports: [
    CommonModule, FormsModule,
    IonicModule,
    PipesModule
  ],
  exports: [ResidenceSelectorComponent, VehicleSelectorComponent, PersonSelectorComponent]
})
export class ComponentsModule { }