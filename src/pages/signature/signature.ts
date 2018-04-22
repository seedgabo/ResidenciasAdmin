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
  uuid = "canvas-signature" + Math.floor(100000 * Math.random());
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {}

  resizeCanvas() {
    var canvas: any = document.querySelector(`#${this.uuid}`);
    var ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    signaturePad.clear(); // otherwise isEmpty() might return incorrect value
  }

  ionViewDidLoad() {
    setTimeout(() => {
      canvas = document.querySelector(`#${this.uuid}`);
      signaturePad = new SignaturePad(canvas, {
        onEnd: () => {
          this.isEmpty = signaturePad.isEmpty();
        }
      });
      window.addEventListener("resize", this.resizeCanvas);
      this.resizeCanvas();
    }, 375);
  }

  ionViewWillLeave() {
    window.removeEventListener("resize", this.resizeCanvas);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  clear() {
    this.ionViewDidLoad();
    signaturePad.clear();
    this.isEmpty = true;
  }

  save() {
    this.viewCtrl.dismiss(signaturePad.toDataURL("image/jpg"));
  }
}
