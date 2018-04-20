import { Component } from "@angular/core";
import { IonicPage, ViewController, NavParams } from "ionic-angular";
import SignaturePad from "signature_pad";
var canvas;
var signaturePad;

@IonicPage()
@Component({
  selector: "page-signature",
  templateUrl: "signature.html"
})
export class SignaturePage {
  isEmpty = true;
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {}
  resizeCanvas() {
    var canvas: any = document.querySelector("#canvas-signature");
    var ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    signaturePad.clear(); // otherwise isEmpty() might return incorrect value
  }

  ionViewDidLoad() {
    setTimeout(() => {
      canvas = document.querySelector("#canvas-signature");
      signaturePad = new SignaturePad(canvas, {
        onEnd: () => {
          this.isEmpty = signaturePad.isEmpty();
        }
      });
      window.addEventListener("resize", this.resizeCanvas);
      this.resizeCanvas();
      if (this.navParams.get("signature")) {
        signaturePad.fromData(this.navParams.get("signature"));
      }
    }, 375);
  }
  ionViewWillLeave() {
    signaturePad.off();
    window.removeEventListener("resize", this.resizeCanvas);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  clear() {
    signaturePad.clear();
    this.isEmpty = true;
  }

  save() {
    this.viewCtrl.dismiss(signaturePad.toDataURL("image/svg+xml"));
  }
}
