import { Component } from "@angular/core";
import { IonicPage, NavParams, ViewController } from "ionic-angular";
import { DomSanitizer } from "@angular/platform-browser";
@IonicPage()
@Component({
  selector: "page-image-viewer",
  templateUrl: "image-viewer.html"
})
export class ImageViewerPage {
  url;
  title = "";
  constructor(public viewCtrl: ViewController, public navParams: NavParams, sanitize: DomSanitizer) {
    var url = this.navParams.get("url");
    this.title = this.navParams.get("title");
    this.url = sanitize.bypassSecurityTrustUrl(url);
  }

  ionViewDidLoad() {}
  close() {
    this.viewCtrl.dismiss();
  }
}
