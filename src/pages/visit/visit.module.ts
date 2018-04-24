import { PipesModule } from "./../../pipes/pipes.module";
import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { VisitPage } from "./visit";

@NgModule({
  declarations: [VisitPage],
  imports: [IonicPageModule.forChild(VisitPage), PipesModule]
})
export class VisitPageModule {}
