import { PopoverController } from 'ionic-angular';
import { Injectable } from '@angular/core';
@Injectable()
export class PopoverMenu {

  constructor(public popover:PopoverController) {
  }

  create(data, opts = {}) {
    var popover = this.popover.create(
      "PopoverPage", data, opts)
    return popover
  }

}
