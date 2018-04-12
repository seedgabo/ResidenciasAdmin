import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { MeetingsPage } from "./meetings";
import { PipesModule } from "../../pipes/pipes.module";

@NgModule({
  declarations: [MeetingsPage],
  imports: [IonicPageModule.forChild(MeetingsPage), PipesModule]
})
export class MeetingsPageModule {}
