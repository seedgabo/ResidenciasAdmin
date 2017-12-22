import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { Api } from '../../providers/api';
import * as moment from 'moment';
@IonicPage()
@Component({
  selector: 'page-tickets',
  templateUrl: 'tickets.html',
})
export class TicketsPage {
  _tickets: any = { data: [] };
  query = ""
  translations = {
    'today': 'Hoy',
    'yesterday': 'Ayer',
    'week': 'Esta Semana',
    'last_week': 'La Semana Pasada',
    'month': 'Este Mes',
    'last_month': 'El Mes Pasado',
    'older': 'Antiguos'
  }
  groups = {}
  loading = true
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public actionsheet: ActionSheetController) {
  }

  ionViewDidLoad() {
    this.getWaitingTickets()
  }

  getWaitingTickets(refresher = null) {
    this.loading = true
    this.api.ready.then(() => {
      this.api.get(`tickets?scope[waiting]=&paginate=100&with[]=user&with[]=user.residence&order[created_at]=asc${this.query != '' ? `&whereLike[subject]=${this.query}orWhereLike[text]=${this.query}` : ''}`)
        .then((data) => {
          console.log(data)
          this._tickets = data;
          this.filter()
          if (refresher) refresher.complete()
          this.loading = false
        })
        .catch((err) => {
          this.api.Error(err)
          this.loading = false
          if (refresher) refresher.complete()
        })

    })
  }

  filter() {
    var tickets
    if (this.query == "") {
      tickets = this._tickets.data;
    }
    else {
      var filter = this.query.toLowerCase()
      tickets = this._tickets.data.filter(t => {
        return t.subject.toLowerCase().indexOf(filter) > -1
          || t.text.toLowerCase().indexOf(filter) > -1
          || (t.user && t.user.name.toLowerCase().indexOf(filter) > -1)
          || (t.user && t.user.residence && t.user.residence.name.toLowerCase().indexOf(filter) > -1)
      });
    }

    this.groups = this.groupByDates(tickets, 'created_at')
  }

  groupByDates(array, key) {
    if (key == null) {
      key = 'date';
    }
    var now = moment();
    var ordered = {
      today: [],
      yesterday: [],
      week: [],
      last_week: [],
      month: [],
      last_month: [],
      older: []
    };
    for (var i = 0, len = array.length; i < len; i++) {
      var item = array[i];
      var date = moment(item[key]);
      if (now.isSame(date, 'day')) {
        ordered.today[ordered.today.length] = item;
      } else if (now.clone().subtract(1, 'day').isSame(date, 'day')) {
        ordered.yesterday[ordered.yesterday.length] = item;
      } else if (now.clone().isSame(date, 'week')) {
        ordered.week[ordered.week.length] = item;
      } else if (now.clone().subtract(1, 'week').isSame(date, 'week')) {
        ordered.last_week[ordered.last_week.length] = item;
      } else if (now.clone().isSame(date, 'month')) {
        ordered.month[ordered.month.length] = item;
      } else if (now.clone().subtract(1, 'month').isSame(date, 'month')) {
        ordered.last_month[ordered.last_month.length] = item;
      } else {
        ordered.older[ordered.older.length] = item;
      }
    }
    return ordered;
  }

  actions(ticket) {
    var sheet = this.actionsheet.create({
      title: this.api.trans('literals.actions') + " " + this.api.trans('literals.ticket')
    })

    sheet.addButton({
      text: this.api.trans('literals.view_resource') + " " + this.api.trans('literals.ticket'),
      icon: 'eye',
      handler: () => { this.openTicket(ticket) }
    })

    if (ticket.status !== 'open' && ticket.status == "closed")
      sheet.addButton({
        text: this.api.trans('literals.mark_as') + " " + this.api.trans('literals.open'),
        icon: 'eye-off',
        cssClass: "icon-primary",
        handler: () => { this.changeStatus(ticket, 'open') }
      })
    if (ticket.status !== 'closed')
      sheet.addButton({
        text: this.api.trans('literals.mark_as') + " " + this.api.trans('literals.closed'),
        icon: 'done-all',
        cssClass: "icon-secondary",
        handler: () => { this.changeStatus(ticket, 'closed') }
      })

    if (ticket.status !== 'in proccess')
      sheet.addButton({
        text: this.api.trans('literals.mark_as') + " " + this.api.trans('literals.in proccess'),
        icon: 'cog',
        cssClass: "icon-warning",
        handler: () => { this.changeStatus(ticket, 'in proccess') }
      })

    if (ticket.status !== 'rejected' && ticket.status == "closed")
      sheet.addButton({
        text: this.api.trans('literals.mark_as') + " " + this.api.trans('literals.rejected'),
        icon: 'close-circle',
        cssClass: "icon-danger",
        role: 'destructive',
        handler: () => { this.changeStatus(ticket, 'rejected') }
      })


    sheet.addButton({
      text: this.api.trans('crud.cancel'),
      icon: 'close',
      role: 'cancel',
      handler: () => { }
    })

    sheet.present()
  }

  changeStatus(ticket, status) {
    this.loading = true
    this.api.put('tickets/' + ticket.id, { status: status })
      .then((resp) => {
        this.loading = false
        ticket.status = status;
      })
      .catch((err) => {
        this.api.Error(err)
        this.loading = false
      })
  }

  openTicket(ticket) {
    console.log(ticket)
    this.navCtrl.push('TicktPage', { ticket: ticket }, { animation: 'ios' });
  }

}
