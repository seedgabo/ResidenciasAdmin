import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { MeetingEditorPage } from "./meeting-editor";
import { PipesModule } from "../../pipes/pipes.module";

@NgModule({
  declarations: [MeetingEditorPage],
  imports: [IonicPageModule.forChild(MeetingEditorPage), PipesModule]
})
export class MeetingEditorPageModule {}
