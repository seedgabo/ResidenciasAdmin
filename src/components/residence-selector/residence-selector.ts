import { Component, forwardRef, EventEmitter, Output, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";
import { ModalController } from "ionic-angular";
import { Api } from "../../providers/api";

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ResidenceSelectorComponent),
  multi: true
};

@Component({
  selector: "residence-selector",
  templateUrl: "residence-selector.html",
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class ResidenceSelectorComponent implements ControlValueAccessor {
  public residence;
  public selecteds = [];
  public ready = false;
  @Input() multiple: boolean;
  @Output() onChange: EventEmitter<any> = new EventEmitter();

  constructor(public modal: ModalController, public api: Api) {
    this.api.ready.then(() => {
      this.api.load("residences").then(() => {
        this.ready = true;
      });
    });
  }

  selectResidence() {
    this.onTouchedCallback();
    var modal = this.modal.create("ResidenceFinderPage", {
      multiple: this.multiple
    });
    modal.present();
    modal.onDidDismiss((data) => {
      if (this.multiple) {
        this.selecteds = data.selecteds;
        this.onChange.emit(data.selecteds);
        this.onChangeCallback(data.selecteds);
        return;
      }
      if (data && data.id) {
        this.residence = data;
      } else {
        this.residence = null;
      }
      console.log(this.residence);
      this.onChangeCallback(this.residence);
      this.onChange.emit(this.residence);
    });
  }

  //Placeholders for the callbacks which are later providesd
  //by the Control Value Accessor
  private onTouchedCallback: () => {};
  private onChangeCallback: (_: any) => {};

  //get accessor
  get value(): any {
    if (this.multiple) {
      return this.selecteds;
    }
    return this.residence;
  }

  //set accessor including call the onchange callback
  set value(v: any) {
    if (!this.multiple) {
      if (v !== this.residence) {
        this.residence = v;
        this.onChangeCallback(v);
      }
    } else if (v && v.length) {
      this.selecteds = v;
      this.onChangeCallback(v);
    }
  }

  //From ControlValueAccessor interface
  writeValue(value: any) {
    if (value && this.multiple && value.length) {
      this.selecteds = value;
    } else {
      this.residence = value;
    }
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
