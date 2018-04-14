import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { AddCorrespondencePage } from "./add-correspondence";
import { PipesModule } from "./../../pipes/pipes.module";
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  declarations: [AddCorrespondencePage],
  imports: [
    IonicPageModule.forChild(AddCorrespondencePage),
    ComponentsModule,
    PipesModule
  ]
})
export class AddCorrespondencePageModule {}
