import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, ModalController, AlertController } from "ionic-angular";
import { Api } from "../../providers/api";
import moment from "moment";
var timeout;
@IonicPage({
  segment: "meeting/:id"
})
@Component({
  selector: "page-meeting",
  templateUrl: "meeting.html"
})
export class MeetingPage {
  meeting: any = {};
  inMeeting = 0;
  attenders = [];
  hasQuorum = false;
  residences = [];

  addingItemChecklist = false;
  addingItemPost = false;
  text = "";
  text_check = "";
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

  ionViewDidLoad() {
    this.api.ready.then(() => {
      this.api
        .load("residences")
        .then(() => {
          this.residences = this.api.objects.residences.filter((res) => {
            return res.type !== "administration";
          });
          this.getMeeting()
            .then(() => {
              this.subscribeMeeting();
              this.quorum();
            })
            .catch(console.warn);
        })
        .catch(console.warn);
    });
  }

  refresh(refresher = null) {
    this.getMeeting()
      .then(() => {
        this.quorum();
        if (refresher) refresher.complete();
      })
      .catch((error) => {
        this.api.Error(error);
        if (refresher) refresher.complete();
      });
  }

  ionViewWillUnload() {
    this.unsubscribeMeeting();
  }

  selectPerson() {
    var modal = this.modal.create("PersonFinderPage", {
      users: true,
      visitors: false,
      workers: false
    });
    modal.present();
    modal.onDidDismiss((data) => {
      if (!data) {
        return;
      }
      this.addAttender(data.person, data.type);
    });
  }

  selectResidence(person) {
    var modal = this.modal.create("ResidenceFinderPage");
    modal.present();
    modal.onDidDismiss((data) => {
      if (!data) {
        return;
      }
      person.residence_id = data.id;
      person.residence = data;
      this.addAttender(person, "guest");
    });
  }

  addGuest() {
    this.alert
      .create({
        title: this.api.trans("crud.add") + " " + this.api.trans("literals.guest"),
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
            handler: (data) => {
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
      .catch((error) => {
        this.api.Error(error);
      });
  }

  removeAttender(attender, index) {
    this.api
      .delete(`meetings/${this.meeting.id}/remove/attender/${attender.id}`)
      .then((resp) => {
        this.attenders.splice(index, 1);
        this.quorum();
      })
      .catch((error) => {
        this.api.Error(error);
      });
  }

  quorum() {
    if (!this.api.objects.residences) return;
    let minQuorum = this.api.objects.residences.length / 2;
    let residences = {};
    this.attenders.forEach((att) => {
      if (!residences[att.residence_id]) {
        residences[att.residence_id] = true;
      }
    });

    this.inMeeting = Object.keys(residences).length;
    if (this.inMeeting > minQuorum) this.hasQuorum = true;
    else this.hasQuorum = false;
  }

  getMeeting() {
    return new Promise((resolve, reject) => {
      this.api
        .get(`meetings/${this.meeting.id}?with[]=attenders.residence`)
        .then((data: any) => {
          this.meeting = data;
          this.attenders = data.attenders;
          resolve(data);
        })
        .catch((error) => {
          this.api.Error(error);
          reject(error);
        });
    });
  }

  subscribeMeeting(live = false) {
    this.api.Echo.private("App.Meeting." + this.meeting.id)
      .listen("MeetingUpdated", (data) => {
        console.log("MeetingUpdatedEvent", data);
        data.meeting.attenders_count = data.attenders_count;
        this.meeting = Object.assign(this.meeting, data.meeting);
        this.quorum();
        // this.getMeeting().then(() => {
        // });
      })
      .listen("AttenderCreated", (data) => {
        console.log("AttenderCreatedEvent", data);
        var attender = data.attender;
        attender.meeting = data.meeting;
        attender.residence = data.residence;
        this.attenderChanged(attender);
      })
      .listen("AttenderUpdated", (data) => {
        console.log("AttenderUpdatedEvent", data);
        var attender = data.attender;
        attender.meeting = data.meeting;
        attender.residence = data.residence;
        this.attenderChanged(attender);
      })
      .listen("AttenderDeleted", (data) => {
        console.log("AttenderDeletedEvent", data);
        this.attenderRemoved(data.attender);
      });

    if (live) {
      this.api.Echo.join("App.Meeting." + this.meeting.id + ".Presence")
        .here((data) => {
          console.log("here:", data);
        })
        .joining((data) => {
          console.log("joining", data);
        })
        .leaving((data) => {
          console.log("leaving", data);
        });
    }
  }

  unsubscribeMeeting() {
    this.api.Echo.leave("App.Meeting." + this.meeting.id);
    this.api.Echo.leave("App.Meeting." + this.meeting.id + ".Presence");
  }

  attenderChanged(attender) {
    var add = true;
    this.attenders.forEach((att) => {
      if (att.type != "guest" && att.type == attender.type && att[attender.type + "_id"] == attender[attender.type + "_id"]) {
        att = attender;
        add = false;
      }
    });
    if (add) {
      this.attenders.push(attender);
    }
    this.quorum();
  }

  attenderRemoved(attender) {
    let find = this.attenders.findIndex((att) => {
      return att.id == attender.id;
    });
    if (find > -1) {
      this.attenders.splice(find, 1);
    }
    this.quorum();
  }

  /**
   * Post
   */
  addPost() {
    this.api
      .post(`meetings/${this.meeting.id}/add/post`, {
        post: {
          text: this.text,
          date: moment.utc()
        }
      })
      .then((resp) => {
        console.log(resp);
      })
      .catch((err) => {
        this.api.Error(err);
      });

    this.text = "";
    this.addingItemPost = false;
  }

  deletePost(index) {
    this.meeting.posts.splice(index, 1);
    this.api
      .put(`meetings/${this.meeting.id}`, { posts: this.meeting.posts })
      .then((resp) => {
        console.log("posts Changed", resp);
      })
      .catch((err) => {
        this.api.Error(err);
      });
  }

  /**
   * CheckList
   */
  addCheckList() {
    this.api
      .post(`meetings/${this.meeting.id}/add/checklist`, {
        post: {
          text: this.text_check,
          date: moment.utc()
        }
      })
      .then((resp) => {
        console.log(resp);
      })
      .catch((err) => {
        this.api.Error(err);
      });

    this.text_check = "";
    this.addingItemChecklist = false;
  }

  toggleCheck(item, index) {
    item.checked = !item.checked;
    this.saveCheckList();
  }
  deleteCheckItem(index) {
    this.meeting.checklist.splice(index, 1);
    this.saveCheckList();
  }

  saveCheckList() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      this.api
        .put(`meetings/${this.meeting.id}`, { checklist: this.meeting.checklist })
        .then((resp) => {
          console.log("checklist Changed", resp);
        })
        .catch((err) => {
          this.api.Error(err);
        });
    }, 1000);
  }
}
