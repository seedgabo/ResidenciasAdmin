import { ViewController } from 'ionic-angular/navigation/view-controller';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-popover-seller',
  templateUrl: 'popover-seller.html',
})
export class PopoverSellerPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewctrl: ViewController) {
  }

  ionViewDidLoad() {
  }

  action(action) {
    this.viewctrl.dismiss({ action: action }, 'accept')
  }
  close() {
    this.viewctrl.dismiss({}, 'dismiss')
  }

}
