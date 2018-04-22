import { Component, forwardRef, EventEmitter, Output, Input, SimpleChanges, OnChanges } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";
import { ModalController } from "ionic-angular";
import { Api } from "../../providers/api";

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PersonSelectorComponent),
  multi: true
};

@Component({
  selector: "person-selector",
  templateUrl: "person-selector.html",
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class PersonSelectorComponent implements ControlValueAccessor, OnChanges {
  public person;
  public selecteds = [];
  public ready = false;
  @Output() type: string;
  @Input() multiple: boolean;
  @Input() users: any;
  @Input() visitors: any;
  @Input() workers: any;
  @Output() onChange: EventEmitter<any> = new EventEmitter();

  constructor(public modal: ModalController, public api: Api) {}

  selectPerson() {
    this.onTouchedCallback();
    var modal = this.modal.create("PersonFinderPage", {
      visitors: this.visitors == "" || this.visitors ? true : false,
      users: this.users == "" || this.users ? true : false,
      workers: this.workers == "" || this.workers ? true : false,
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

      if (data && data.person && data.type) {
        this.person = data.person;
        this.type = data.type;
      } else {
        this.person = null;
        this.type = null;
      }
      this.onChangeCallback(this.person);
      this.onChange.emit(data);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    var promises: Array<any> = [];
    this.api.ready.then(() => {
      if (changes.users && (changes.users.currentValue == "" || changes.users.currentValue)) {
        promises.push(this.api.load("users"));
      }
      if (changes.visitors && (changes.visitors.currentValue == "" || changes.visitors.currentValue)) {
        promises.push(this.api.load("visitors"));
      }
      if (changes.workers && (changes.workers.currentValue == "" || changes.workers.currentValue)) {
        promises.push(this.api.load("workers"));
      }
      this.ready = false;
      Promise.all(promises).then((res) => {
        this.ready = true;
      });
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
    return this.person;
  }

  //set accessor including call the onchange callback
  set value(v: any) {
    if (!this.multiple) {
      if (v !== this.person) {
        this.person = v;
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
      this.person = value;
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
