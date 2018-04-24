import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { EntryPage } from "./entry";
import { PipesModule } from "../../pipes/pipes.module";

@NgModule({
  declarations: [EntryPage],
  imports: [IonicPageModule.forChild(EntryPage), PipesModule]
})
export class EntryPageModule {}
