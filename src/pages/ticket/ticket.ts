import { ActionSheetController } from 'ionic-angular/components/action-sheet/action-sheet-controller';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from '../../providers/api';
@IonicPage()
@Component({
  selector: 'page-ticket',
  templateUrl: 'ticket.html',
})
export class TicketPage {
  ticket;
  new_comment = {
    text: "",
    user_id: this.api.user.id,
    ticket_id: null
  }
  loading = false;
  adding = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public actionsheet: ActionSheetController, public api: Api) {
    this.ticket = navParams.get("ticket")
    this.new_comment.ticket_id = this.ticket.id;
  }

  ionViewDidLoad() {
    this.getTicket();
  }

  getTicket() {
    this.loading = true;
    this.api.get(`tickets/${this.ticket.id}?with[]=user&with[]=user.residence&with[]=comments&with[]=comments.user&with[]=comments.user.residence&with[]=file`)
      .then((data) => {
        this.loading = false;
        this.ticket = data;
      })
      .catch((err) => {
        this.api.Error(err);
        this.loading = false;
      })
  }

  downloadFile() {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.ticket.file.url));
    element.setAttribute('download', this.ticket.file.name);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }


  canAddComment() {
    return this.new_comment.text.length > 3;
  }

  addComment() {
    this.loading = true;
    this.api.post("comments", this.new_comment)
      .then((data: any) => {
        data.user = this.api.user;
        this.ticket.comments.push(data);
        this.loading = false;
        this.new_comment.text = "";
        this.adding = false;
      })
      .catch((err) => {
        this.api.Error(err);
        this.loading = false;
      })
  }

  changeState(status = 'closed') {
    this.api.put('tickets/' + this.ticket.id, { status: status })
      .then((data) => {
        this.ticket.status = status
      })
      .catch((err) => {
        this.api.Error(err);
      })
  }

  actions() {
    var sheet = this.actionsheet.create({
      title: this.api.trans('literals.action'),
    });
    sheet.addButton({
      icon: 'checkmark-circle',
      text: this.api.trans('literals.mark_as') + " " + this.api.trans('literals.done'),
      handler: () => {
        this.changeState('closed');
      }
    })
    sheet.addButton({
      icon: 'close',
      text: this.api.trans('crud.cancel'),
      handler: () => {
      }
    })
    sheet.present();
  }

}
