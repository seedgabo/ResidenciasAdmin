import { TransPipe } from "./trans/trans";
import { NgModule } from "@angular/core";
import { MomentModule } from "angular2-moment";
import { IonicModule } from "ionic-angular";
import { KeysPipe } from './keys/keys';
@NgModule({
  declarations: [
    TransPipe,
    KeysPipe
  ],
  imports: [
    MomentModule, IonicModule
  ],
  exports: [
    TransPipe,
    MomentModule,
    KeysPipe
  ]
})
export class PipesModule { }
