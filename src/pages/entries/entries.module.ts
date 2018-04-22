import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { EntriesPage } from "./entries";
import { PipesModule } from "../../pipes/pipes.module";

@NgModule({
  declarations: [EntriesPage],
  imports: [IonicPageModule.forChild(EntriesPage), PipesModule]
})
export class EntriesPageModule {}
