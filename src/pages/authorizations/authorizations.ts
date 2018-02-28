import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Refresher, ActionSheetController, PopoverController, ModalController } from 'ionic-angular';
import { Api } from '../../providers/api';
import moment from 'moment';
moment.locale('es-us')
@IonicPage()
@Component({
  selector: 'page-authorizations',
  templateUrl: 'authorizations.html',
})
export class AuthorizationsPage {
  @ViewChild(Refresher) refresher: Refresher;

  authorizations = { data: [] };
  filters = {
    start: null,
    end: null,
    active: true,
  }
  query = "";
  loading = false
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public actionsheet: ActionSheetController, public popover: PopoverController, public modal: ModalController) {
  }

  ionViewDidEnter() {
    this.refresher._top = "50px"
    this.refresher.state = "refreshing"
    this.refresher._beginRefresh()
    // this.getWaitingTickets()
  }

  search(val) {
    if (val != "") {
      this.filters = {
        start: null,
        end: null,
        active: false,
      }

    }
    else {
      this.filters = {
        start: null,
        end: null,
        active: true,
      }

    }
    this.refresher._top = "50px"
    this.refresher.state = "refreshing"
    this.refresher._beginRefresh()
  }

  getAuthorizations(refresher = null) {
    this.loading = true
    var filter = "?paginate=150&append[]=isActive&append[]=entity&with[]=creator&with[]=user&with[]=visitor&with[]=vehicle&with[]=pet&with[]=worker&"
    if (this.filters.start)
      filter += `whereDategte[start_at]=${moment(this.filters.start).format('YYYY-MM-DD HH:mm:ss')}&`
    if (this.filters.end)
      filter += `whereDatelwe[end_at]=${moment(this.filters.end).format('YYYY-MM-DD HH:mm:ss')}&`
    if (this.filters.active)
      filter += "scope[active]=1&"
    if (this.query != '')
      filter += "&whereLike[reference]=" + this.query
    this.api.get(`authorizations${filter}`)
      .then((data: any) => {
        this.loading = false
        this.authorizations = data
        if (refresher) refresher.complete()
      })
      .catch((err) => {
        this.loading = false
        this.api.Error(err)
        if (refresher) refresher.complete()
      })
  }

  filter(ev) {
    var popover = this.popover.create("PopoverFilterAuthorizationPage", { filters: this.filters })
    popover.present({ ev: ev })
    popover.onWillDismiss((filters) => {
      if (filters) {
        this.filters = filters
        this.refresher._top = "50px"
        this.refresher.state = "refreshing"
        this.refresher._beginRefresh()
      }
    })
  }


  actions(auth) {
    var buttons = [
      {
        text: this.api.trans('literals.view_resource') + " " + this.api.trans('literals.authorization'),
        handler: () => { this.view(auth) }
      },
      {
        text: this.api.trans('crud.edit') + " " + this.api.trans('literals.authorization'),
        handler: () => { this.authCreator(auth) }
      },
      {
        text: this.api.trans('literals.print') + " " + this.api.trans('literals.authorization'),
        handler: () => { this.print(auth) }
      },
    ]
    this.actionsheet.create({
      title: this.api.trans('literals.authorization') + " " + auth.reference,
      buttons: buttons
    }).present()
  }

  view(auth) {
    this.navCtrl.push("AuthorizationPage", { print: false, authorization: auth });
  }

  authCreator(auth = null) {
    this.navCtrl.push("AuthorizationPage", { editor: true, authorization: auth });
  }

  print(auth) {
    this.navCtrl.push("AuthorizationPage", { print: true, authorization: auth });
  }
}
