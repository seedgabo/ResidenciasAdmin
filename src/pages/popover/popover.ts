import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html',
})
export class PopoverPage {
  buttons = []
  title
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    if (this.navParams.get('buttons'))
      this.buttons = this.navParams.get('buttons')  
    if (this.navParams.get('title'))
      this.title = this.navParams.get('title')  
  }

  ionViewDidLoad() {
  }

  exec(btn) {
    if (btn.handler) {
      var result = btn.handler()
      if (result !== false) {
        this.close(btn.data, btn.role)
      }
    } else {
      this.close()
    }
  }

  close(data=null,role=null) {
    this.viewCtrl.dismiss(data,role)
  };

}
