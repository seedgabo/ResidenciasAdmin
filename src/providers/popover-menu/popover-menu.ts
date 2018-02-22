import { PopoverController } from 'ionic-angular';
import { Injectable } from '@angular/core';
@Injectable()
export class PopoverMenu {

  constructor(public popover:PopoverController) {
  }

  create(buttons = [], ev = null) {
    var popover = this.popover.create(
      "PopoverPage", {buttons:buttons}
    )
    popover.present({ ev: ev })
    return popover
  }

}
