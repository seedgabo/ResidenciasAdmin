import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { MeetingPage } from "./meeting";
import { PipesModule } from "../../pipes/pipes.module";

@NgModule({
  declarations: [MeetingPage],
  imports: [IonicPageModule.forChild(MeetingPage), PipesModule]
})
export class MeetingPageModule {}
