import { Component, forwardRef, EventEmitter, Output, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ModalController } from 'ionic-angular';
import { Api } from '../../providers/api';
import { VehicleFinderPage } from '../../pages/vehicle-finder/vehicle-finder';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => VehicleSelectorComponent),
  multi: true
};

@Component({
  selector: 'vehicle-selector',
  templateUrl: "vehicle-selector.html",
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class VehicleSelectorComponent implements ControlValueAccessor {
  public vehicle;
  public ready = false
  @Input() type: string;
  @Input() multiple: boolean;
  @Output() onChange: EventEmitter<any> = new EventEmitter();

  constructor(public modal: ModalController, public api: Api) {
    this.api.ready.then(() => {
      this.api.load('vehicles')
        .then(() => {
          this.ready = true
        })
    })
  }

  selectVehicle() {
    this.onTouchedCallback()
    var modal = this.modal.create(VehicleFinderPage, {});
    modal.present()
    modal.onDidDismiss((data) => {
      if (data && data.id) {
        this.vehicle = data;
      }
      else {
        this.vehicle = null;
      }
      console.log(this.vehicle)
      this.onChangeCallback(this.vehicle);
      this.onChange.emit(this.vehicle)
    });
  }


  //Placeholders for the callbacks which are later providesd
  //by the Control Value Accessor
  private onTouchedCallback: () => {};
  private onChangeCallback: (_: any) => {};

  //get accessor
  get value(): any {
    return this.vehicle;
  };

  //set accessor including call the onchange callback
  set value(v: any) {
    if (v !== this.vehicle) {
      this.vehicle = v;
      this.onChangeCallback(v);
    }
  }

  //From ControlValueAccessor interface
  writeValue(value: any) {
    this.vehicle = value;
  }
  //From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }
  //From ControlValueAccessor interface
  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

}
