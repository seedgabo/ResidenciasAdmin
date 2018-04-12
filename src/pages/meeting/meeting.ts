import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController,
  AlertController
} from "ionic-angular";
import { Api } from "../../providers/api";
@IonicPage({
  segment: "meeting/:id"
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
    public alert: AlertController,
    public api: Api
  ) {
    if (this.navParams.get("id")) {
      this.meeting = { id: this.navParams.get("id") };
    } else {
      this.meeting = this.navParams.get("meeting");
    }
  }

  selectPerson() {
    var modal = this.modal.create("PersonFinderPage", {
      users: true,
      visitors: false,
      workers: false
    });
    modal.present();
    modal.onDidDismiss(data => {
      if (!data) {
        return;
      }
      this.addAttender(data.person, data.type);
    });
  }

  selectResidence(person) {
    var modal = this.modal.create("ResidenceFinderPage");
    modal.present();
    modal.onDidDismiss(data => {
      if (!data) {
        return;
      }
      person.residence_id = data.residence.id;
      person.residence = data.residence;
      this.addAttender(person, "guest");
    });
  }

  addGuest() {
    this.alert
      .create({
        title:
          this.api.trans("crud.add") + " " + this.api.trans("literals.guest"),
        inputs: [
          {
            name: "name",
            placeholder: this.api.trans("literals.name"),
            value: ""
          },
          {
            name: "document",
            placeholder: this.api.trans("literals.document"),
            value: ""
          }
        ],
        buttons: [
          this.api.trans("crud.cancel"),
          {
            text: this.api.trans("__.ok"),
            handler: data => {
              if (data.name.length > 0) {
                this.selectResidence(data);
              }
            }
          }
        ]
      })
      .present();
  }

  addAttender(person, type) {
    this.api
      .post(`meetings/${this.meeting.id}/add/attender`, {
        person: person,
        type: type
      })
      .then((data: any) => {
        console.log("attender added", data);
        this.attenderChanged(data.attender);
      })
      .catch(error => {
        this.api.Error(error);
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
    this.api.ready.then(() => {
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
    });
  }

  subscribeMeeting() {
    this.api.ready.then(() => {
      this.api.Echo.join("App.Meeting." + this.meeting.id)
        .listen("MeetingUpdated", data => {
          console.log("MeetingUpdate", data);
        })
        .here(data => {
          console.log("here:", data);
        })
        .joining(data => {
          console.log("joining", data);
        })
        .leaving(data => {
          console.log("leaving", data);
        });
    });
  }

  unsubscribeMeeting() {
    this.api.Echo.leave("App.Meeting." + this.meeting.id);
  }

  attenderChanged(attender) {
    var add = true;
    this.attenders.forEach(att => {
      if (
        att.type != "guest" &&
        att.type == attender.type &&
        att[attender.type + "_id"] == attender[attender.type + "_id"]
      ) {
        add = false;
      }
    });
    if (add) {
      this.attenders.push(attender);
    }
  }
}
