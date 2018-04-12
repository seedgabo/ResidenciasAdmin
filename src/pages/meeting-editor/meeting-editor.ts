import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { Api } from "../../providers/api";
import * as moment from "moment";
@IonicPage()
@Component({
  selector: "page-meeting-editor",
  templateUrl: "meeting-editor.html"
})
export class MeetingEditorPage {
  meeting: any = {
    subject: "",
    start: moment().format("YYYY-MM-DDTHH:mm"),
    end: moment()
      .add(2, "hours")
      .format("YYYY-MM-DDTHH:mm"),
    description: ""
  };
  loading = false;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: Api
  ) {
    if (this.navParams.get("meeting")) {
      this.meeting = this.navParams.get("meeting");
      this.meeting.start = moment(this.meeting.start).format(
        "YYYY-MM-DDTHH:mm"
      );
      if (this.meeting.end)
        this.meeting.end = moment(this.meeting.end).format("YYYY-MM-DDTHH:mm");
    }
  }

  delete() {
    this.loading = true;
    this.api
      .delete("meetings/" + this.meeting.id)
      .then(data => {
        this.loading = false;
        this.navCtrl.pop();
      })
      .catch(e => {
        this.api.Error(e);
        this.loading = false;
      });
  }

  save() {
    var promise: Promise<any>;
    this.loading = true;
    var data = {
      subject: this.meeting.subject,
      start: this.meeting.start,
      end: this.meeting.end,
      description: this.meeting.description
    };

    if (this.meeting.id) {
      promise = this.api.put("meetings/" + this.meeting.id, data);
    } else {
      promise = this.api.post("meetings", data);
    }
    promise
      .then(data => {
        this.loading = false;
        this.navCtrl.pop();
        this.navCtrl.push("MeetingPage", { meeting: data });
      })
      .catch(err => {
        this.loading = false;
      });
  }

  canSave() {
    return this.meeting.subject.length > 1 && this.meeting.start;
  }
}
