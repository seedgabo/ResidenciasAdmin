import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController
} from "ionic-angular";
import { Api } from "../../providers/api";
@IonicPage({
  segment: "meeting/{id}"
})
@Component({
  selector: "page-meeting",
  templateUrl: "meeting.html"
})
export class MeetingPage {
  meeting: any = {};
  attenders = [];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modal: ModalController,
    public api: Api
  ) {
    if (this.navParams.get("id")) {
      this.meeting = { id: this.navParams.get("id") };
    } else {
      this.meeting = this.navParams.get("meeting");
    }
  }

  addAttender() {
    var modal = this.modal.create("AttenderEditorPage", {
      meeting: this.meeting
    });
    modal.present();
    modal.onWillDismiss(data => {
      console.log(data);
    });
  }

  ionViewDidLoad() {
    this.api.load("residences");
    this.getMeeting();
    this.subscribeMeeting();
  }

  ionViewWillUnload() {
    this.unsubscribeMeeting();
  }

  quorum() {
    if (this.api.objects.residences)
      return this.attenders.length > this.api.objects.residences.length / 2;
  }

  getMeeting() {
    this.api
      .get(
        "meetings/" +
          this.meeting.id +
          "?with[]=attenders&with[]=attenders.residence"
      )
      .then((data: any) => {
        this.meeting = data;
        this.attenders = data.attenders;
      })
      .catch(error => {
        this.api.Error(error);
      });
  }

  subscribeMeeting() {
    this.api.Echo.join("App.Meeting." + this.meeting.id)
      .listen("MeetingUpdated", data => {})
      .here(data => {
        console.log("here:", data);
      })
      .joining(data => {
        console.log("joining", data);
      })
      .leaving(data => {
        console.log("leaving", data);
      });
  }

  unsubscribeMeeting() {
    this.api.Echo.leave("App.Meeting." + this.meeting.id);
  }
}
