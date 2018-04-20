import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { EntryEditorPage } from "./entry-editor";
import { PipesModule } from "../../pipes/pipes.module";
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  declarations: [EntryEditorPage],
  imports: [IonicPageModule.forChild(EntryEditorPage), PipesModule, ComponentsModule]
})
export class EntryEditorPageModule {}
