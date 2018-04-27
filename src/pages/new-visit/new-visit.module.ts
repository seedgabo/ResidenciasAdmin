import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { NewVisitPage } from "./new-visit";
import { PipesModule } from "../../pipes/pipes.module";

@NgModule({
  declarations: [NewVisitPage],
  imports: [IonicPageModule.forChild(NewVisitPage), PipesModule]
})
export class NewVisitPageModule {}
