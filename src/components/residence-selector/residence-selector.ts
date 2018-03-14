import { Component, forwardRef, EventEmitter, Output, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ModalController } from 'ionic-angular';
import { Api } from '../../providers/api';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ResidenceSelectorComponent),
  multi: true
};

@Component({
  selector: 'residence-selector',
  templateUrl: "residence-selector.html",
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class ResidenceSelectorComponent implements ControlValueAccessor {
  public residence;
  public ready = false
  @Input() type: string;
  @Input() multiple: boolean;
  @Output() onChange: EventEmitter<any> = new EventEmitter();

  constructor(public modal: ModalController, public api: Api) {
    this.api.ready.then(() => {
      this.api.load('residences')
        .then(() => {
          this.ready = true
        })
    })
  }

  selectResidence() {
    this.onTouchedCallback()
    var modal = this.modal.create("ResidenceFinderPage", {});
    modal.present()
    modal.onDidDismiss((data) => {
      if (data && data.id) {
        this.residence = data;
      }
      else {
        this.residence = null;
      }
      console.log(this.residence)
      this.onChangeCallback(this.residence);
      this.onChange.emit(this.residence)
    });
  }


  //Placeholders for the callbacks which are later providesd
  //by the Control Value Accessor
  private onTouchedCallback: () => {};
  private onChangeCallback: (_: any) => {};

  //get accessor
  get value(): any {
    return this.residence;
  };

  //set accessor including call the onchange callback
  set value(v: any) {
    if (v !== this.residence) {
      this.residence = v;
      this.onChangeCallback(v);
    }
  }

  //From ControlValueAccessor interface
  writeValue(value: any) {
    this.residence = value;
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
