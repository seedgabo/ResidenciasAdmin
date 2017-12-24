import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Storage } from "@ionic/storage";
@Injectable()
export class SettingProvider {
  print_type = 'normal';
  language = 'es';
  show_customer_type = true
  show_signature = true
  constructor(private storage: Storage) {
    this.storage.get('setting').then((data) => {
      if (data) {
        this.language = data.language
        this.print_type = data.print_type || 'normal'
        if (this.show_customer_type !== undefined)
          this.show_customer_type = data.show_customer_type
        if (this.show_signature !== undefined)
          this.show_signature = data.show_signature || true
      }
    })
  }

  save() {
    this.storage.set('setting', {
      print_type: this.print_type,
      language: this.language,
      show_customer_type: this.show_customer_type,
      show_signature: this.show_signature
    })
  }

  default() {
    this.language = window.navigator.language.substring(0, 2)
    this.print_type = 'normal'
    this.show_customer_type = true
    this.show_signature = true
    this.save()
  }

}
