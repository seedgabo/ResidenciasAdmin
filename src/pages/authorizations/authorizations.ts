import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Refresher, ActionSheetController, PopoverController, ModalController, Content, AlertController } from 'ionic-angular';
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
  @ViewChild(Content) content: Content;

  authorizations = { data: [] };
  filters = {
    start: null,
    end: null,
    active: true,
  }
  query = "";
  loading = false
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public actionsheet: ActionSheetController, public popover: PopoverController, public modal: ModalController, public alert: AlertController) {
  }

  ionViewDidEnter() {
    this.content.resize()
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
    this.getAuthorizations()
  }

  getAuthorizations(refresher = null) {
    this.loading = true
    var filter = "?paginate=150&append[]=isActive&append[]=entity&with[]=creator&with[]=user&with[]=visitor&with[]=vehicle&with[]=pet&with[]=worker&order[start_at]=desc&"
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
        text: this.api.trans('literals.view_resource'),
        handler: () => { this.view(auth) },
        icon: 'eye'
      },
      {
        text: this.api.trans('crud.edit'),
        handler: () => { this.authCreator(auth) },
        icon: 'create'
      },
      {
        text: this.api.trans('literals.print'),
        handler: () => { this.print(auth) },
        icon: 'print'
      },
      {
        text: this.api.trans('crud.delete'),
        handler: () => { this.delete(auth) },
        cssClass: 'icon-danger',
        role: 'destructive',
        icon: 'trash'
      }
    ]
    this.actionsheet.create({
      title: this.api.trans('literals.authorization') + "  #" + auth.reference,
      buttons: buttons
    }).present()
  }

  view(auth) {
    this.navCtrl.push("AuthorizationPage", { print: false, authorization: auth });
  }

  authCreator(auth = null) {
    this.navCtrl.push("AuthorizationPage", { editor: true, authorization: auth });
  }

  delete(auth) {
    this.alert.create({
      title: this.api.trans('__.are you sure'),
      buttons: [{
        text: this.api.trans("crud.delete"),
        handler: () => {
          this.loading = true
          this.api.delete('authorizations/' + auth.id)
            .then((resp) => {
              this.getAuthorizations()
              this.loading = false
            })
            .catch((error) => {
              this.api.Error(error)
              this.loading = false
            })
        }
      }, this.api.trans('crud.cancel')]
    }).present()
  }

  print(auth) {
    this.navCtrl.push("AuthorizationPage", { print: true, authorization: auth });
  }
}
