import { Component, ViewChild } from "@angular/core";
import { IonicPage, NavController, NavParams, Refresher } from "ionic-angular";
import * as moment from "moment";
import { Api } from "../../providers/api";
moment.locale("es");
const YESTERDAY = moment()
  .subtract(1, "days")
  .startOf("day");
const TODAY = moment();
const TOMORROW = moment()
  .subtract(1, "days")
  .startOf("day");
const NEXT_WEEK = moment()
  .subtract(1, "weeks")
  .startOf("day");
const FUTURE = moment()
  .subtract(2, "weeks")
  .startOf("week");
const PAST = moment()
  .subtract(2, "days")
  .endOf("week");
@IonicPage()
@Component({
  selector: "page-meetings",
  templateUrl: "meetings.html"
})
export class MeetingsPage {
  @ViewChild(Refresher) refresher: Refresher;
  meetings = [];
  groups = {
    yesterday: [],
    today: [],
    tomorrow: [],
    week: [],
    nextWeek: [],
    incoming: [],
    past: []
  };
  query = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: Api
  ) {}

  ionViewDidLoad() {
    this.refresher._top = "50px";
    this.refresher.state = "refreshing";
    this.refresher._beginRefresh();
  }

  
  filter() {
    var s = this.query.toLowerCase();
    this.groups = {
      yesterday: [],
      today: [],
      tomorrow: [],
      week: [],
      nextWeek: [],
      incoming: [],
      past: []
    };
    this.meetings.forEach(meet => {
      if (s.length > 0) {
        if (
          !(meet.subject.indexOf(s) > -1 || meet.description.indexOf(s) > -1)
        ) {
          return false;
        }
      }
      if (moment(meet.start).isSame(YESTERDAY, "day")) {
        this.groups.yesterday.push(meet);
      } else if (moment(meet.start).isSame(TODAY, "day")) {
        this.groups.today.push(meet);
      } else if (moment(meet.start).isSame(TOMORROW, "day")) {
        this.groups.tomorrow.push(meet);
      } else if (moment(meet.start).isSame(TODAY, "week")) {
        this.groups.week.push(meet);
      } else if (moment(meet.start).isSame(NEXT_WEEK, "week")) {
        this.groups.nextWeek.push(meet);
      } else if (moment(meet.start) > FUTURE) {
        this.groups.incoming.push(meet);
      } else if (moment(meet.start) < PAST) {
        this.groups.past.push(meet);
      }
    });
  }

  selectMeeting(meeting) {
    this.navCtrl.push("MeetingPage", { meeting: meeting, id: meeting.id });
  }

  createMeeting() {
    this.navCtrl.push("MeetingEditorPage", {});
  }

  editMeeting(meeting) {
    this.navCtrl.push("MeetingEditorPage", { meeting: meeting });
  }

  getMeetings(refresher = null) {
    this.api.ready.then(()=>{
      this.api
        .get(
          `meetings?whereDategte[start]=${moment
            .utc()
            .subtract(1,'day')
            .startOf("day")
            .format("YY-MM-DD")}&limit=50`
        )
        .then((data: any) => {
          this.meetings = data;
          this.filter();
          if (refresher) refresher.complete();
        })
        .catch(err => {
          this.api.Error(err);
          if (refresher) refresher.complete();
        });
    })
  }
}
