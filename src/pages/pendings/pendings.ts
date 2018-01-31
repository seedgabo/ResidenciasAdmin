import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-pendings',
  templateUrl: 'pendings.html',
})
export class PendingsPage {
  tickets ={data:[], total:null}
  invoices ={data:[], total:null}
  reservations ={data:[], total:null}
  debts = {data:[], total:null}
  ticket_count
  invoices_count
  reservations_count
  constructor(public navCtrl: NavController, public navParams: NavParams, public api:Api) {

  }

  ionViewDidLoad() {
    this.api.ready.then(()=>{
      if (this.canTickets()) {
        this.loadTickets();
      }
      if (this.canReservations()) {
        this.loadReservations();
      }
      if (this.canInvoices()) {
        this.loadInvoices();
        this.loadDebts();
      }
    })
  }

  loadTickets(){
    this.api.get('tickets?scope[pending]=&with[]=user.residence&with[]=comments.user&paginate=50')
    .then((data:any)=>{
      this.tickets = data
    })
    .catch((err)=>{
      this.api.Error(err)
    })
  }

  countTickets(){
    this.api.get('tickets?scope[pending]=&with[]=user.residence&with[]=comments.user&count=1')
      .then((data: any) => {
        this.tickets_count = data
      })
      .catch((err) => {
        this.api.Error(err)
      })
  }
  
  loadInvoices(){
    this.api.get('invoices?scope[waitingApproval]=&with[]=user.residence&append[]=person&paginate=50')
      .then((data:any)=>{
        this.invoices = data
      })
      .catch((err)=>{
        this.api.Error(err)
      })
  }

  loadReservations(){
    this.api.get('reservations?scope[waiting]=&with[]=user.residence&with[]=zone&paginate=50')
    .then((data:any)=>{
      this.reservations = data
    })
    .catch((err)=>{
      this.api.Error(err)
    })
  }
    
  loadDebts(){
    this.api.get('invoices?scope[InDebt]=&with[]=user.residence&with[]=residence&append[]=person&paginate=50')
        .then((data:any)=>{
          this.debts = data
        })
      .catch((err)=>{
        this.api.Error(err)
      })

  }

  ticketAction(ticket){
    this.navCtrl.push("TicketPage",{ticket: ticket})
  }
  
  invoiceAction(invoice){
    
  }
  
  reservationAction(reservation){
    this.navCtrl.push("ReservationPage",{reservation: reservation})
  }


  
  private canInvoices() {
    if (this.api.roles && this.api.modules && this.api.modules.invoices)
      for (var i = 0; i < this.api.roles.length; i++) {
        if (this.api.roles[i].name == 'Manage invoices' || this.api.roles[i].name == 'Accounter' || this.api.roles[i].name == 'SuperAdmin') {
          return true;
        }
      }
    return false;
  }

  private canTickets() {
    if (this.api.roles && this.api.modules && this.api.modules.tickets)
      for (var i = 0; i < this.api.roles.length; i++) {
        if (this.api.roles[i].name == 'Manage tickets' || this.api.roles[i].name == 'SuperAdmin') {
          return true;
        }
      }
    return false;
  }

  private canReservations() {
    if (this.api.roles && this.api.modules && this.api.modules.tickets)
      for (var i = 0; i < this.api.roles.length; i++) {
        if (this.api.roles[i].name == 'Manage reservations' || this.api.roles[i].name == 'SuperAdmin') {
          return true;
        }
      }
    return false;
  }


}
