import { Component, forwardRef, EventEmitter, Output, Input, SimpleChanges, OnChanges } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";
import { ModalController } from "ionic-angular";
import { Api } from "../../providers/api";

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SignatureComponent),
  multi: true
};
@Component({
  selector: "signature",
  templateUrl: "signature.html",
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class SignatureComponent implements ControlValueAccessor, OnChanges {
  public signature;
  public ready = false;
  @Input() large: boolean = false;
  @Input() color: string = "primary";
  @Output() onChange: EventEmitter<any> = new EventEmitter();
  constructor(public modal: ModalController, public api: Api) {}

  OpenSignature() {
    this.onTouchedCallback();
    var modal = this.modal.create("SignaturePage", { signature: this.signature });
    modal.present();
    modal.onWillDismiss((data) => {
      if (data) {
        this.signature = data;
      }
      this.onChangeCallback(data);
      this.onChange.emit(data);
    });
  }

  ngOnChanges(changes: SimpleChanges) {}

  //Placeholders for the callbacks which are later providesd
  //by the Control Value Accessor
  private onTouchedCallback: () => {};
  private onChangeCallback: (_: any) => {};

  //get accessor
  get value(): any {
    return this.signature;
  }

  //set accessor including call the onchange callback
  set value(v: any) {
    if (v !== this.signature) {
      this.signature = v;
      this.onChangeCallback(v);
    }
  }

  //From ControlValueAccessor interface
  writeValue(value: any) {
    if (value) {
      this.signature = value;
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
