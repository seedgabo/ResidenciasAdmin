import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Storage } from "@ionic/storage";
@Injectable()
export class SettingProvider {
  print_type = 'normal';
  language = 'es';
  constructor(private storage: Storage) {
    this.storage.get('setting')
      .then((data) => {
        if (data) {
          this.print_type = data.print_type
          this.language = data.language
        }
      })
  }

  save() {
    this.storage.set('setting', {
      print_type: this.print_type,
      language: this.language,
    })
  }

  default() {
    this.language = window.navigator.language.substring(0, 2)
    this.print_type = 'normal'
    this.save()
  }

}
