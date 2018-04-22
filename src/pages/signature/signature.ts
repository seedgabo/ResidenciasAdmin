import { Component } from "@angular/core";
import { IonicPage, ViewController, NavParams } from "ionic-angular";
import SignaturePad from "signature_pad";

@IonicPage()
@Component({
  selector: "page-signature",
  templateUrl: "signature.html"
})
export class SignaturePage {
  isEmpty = true;
  uuid = "canvas-signature" + Math.floor(100000 * Math.random());
  canvas;
  signaturePad;
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {}

  resizeCanvas() {
    var canvas: any = document.querySelector(`#${this.uuid}`);
    var ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    this.signaturePad.clear(); // otherwise isEmpty() might return incorrect value
  }

  ionViewDidLoad() {
    setTimeout(() => {
      this.canvas = document.querySelector(`#${this.uuid}`);
      this.signaturePad = new SignaturePad(this.canvas, {
        onEnd: () => {
          this.isEmpty = this.signaturePad.isEmpty();
        }
      });
      window.addEventListener("resize", this.resizeCanvas.bind(this));
      this.resizeCanvas();
    }, 375);
  }

  ionViewWillLeave() {
    window.removeEventListener("resize", this.resizeCanvas.bind(this));
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  clear() {
    this.ionViewDidLoad();
    this.signaturePad.clear();
    this.isEmpty = true;
  }

  save() {
    this.viewCtrl.dismiss(this.signaturePad.toDataURL("image/jpg"));
  }
}
