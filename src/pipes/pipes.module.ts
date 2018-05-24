import { TransPipe } from "./trans/trans";
import { NgModule } from "@angular/core";
import { MomentModule } from "angular2-moment";
import { IonicModule } from "ionic-angular";
import { KeysPipe } from './keys/keys';
import { ReversePipe } from './reverse/reverse';
@NgModule({
  declarations: [
    TransPipe,
    KeysPipe,
    ReversePipe
  ],
  imports: [
    MomentModule, IonicModule
  ],
  exports: [
    TransPipe,
    MomentModule,
    KeysPipe,
    ReversePipe
  ]
})
export class PipesModule { }
