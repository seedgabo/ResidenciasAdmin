import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { SignaturePage } from "./signature";
import { PipesModule } from "../../pipes/pipes.module";

@NgModule({
  declarations: [SignaturePage],
  imports: [IonicPageModule.forChild(SignaturePage), PipesModule]
})
export class SignaturePageModule {}
