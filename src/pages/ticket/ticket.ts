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
  file
  file_name
  categories = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public actionsheet: ActionSheetController, public api: Api) {
    this.ticket = navParams.get("ticket")
    this.new_comment.ticket_id = this.ticket.id;
  }

  ionViewDidLoad() {
    this.getTicket();
  }

  getTicket() {
    this.loading = true;
    this.api.get(`tickets/${this.ticket.id}?with[]=user&with[]=user.residence&with[]=comments&with[]=comments.user&with[]=comments.user.residence&with[]=comments.file&with[]=file`)
      .then((data) => {
        this.loading = false;
        this.ticket = data;
        this.api.get(`comments?where[ticket_id]=${this.ticket.id}&with[]=user.residence&with[]=file`)
          .then((comments) => {
            this.ticket.comments = comments
          })
          .catch((err) => {
            this.api.Error(err);
          })
      })
      .catch((err) => {
        this.api.Error(err);
        this.loading = false;
      })
  }

  downloadFile(file = null) {
    if (!file) {
      file = this.ticket.file
    }
    var element = document.createElement('a');
    element.setAttribute('href', this.api.url + "files/" + file.id);
    element.setAttribute('download', file.name);
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
        if (this.file) {
          this.uploadFile(data.id)
        }
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

  askFile() {
    var filer: any = document.querySelector("#input-file-comment")
    filer.click();
  }

  readFile(event) {
    try {
      var reader: any = new FileReader();
      reader.readAsDataURL(event.target.files[0])
      if (event.target.files[0].size / 1024 / 1024 > 5) {
        return this.errorFile(event.target.files[0].size)
      }
      this.file = event.target.files[0];
      this.file_name = event.target.files[0].name
    } catch (error) {
      this.file = null
      console.error(error)
    }
  }

  errorFile(size) {
    this.api.toast.create({
      message: this.api.trans('__.los archivos deben sen inferior a 5MB, (' + size / 1024 / 1024 + " MB)"),
      duration: 4000
    }).present()
  }

  uploadFile(id) {
    var formData = new FormData();
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this.api.url + "api/files/upload/comment/" + id, true);
    formData.append('file', this.file, this.file_name);

    var toast = this.api.toast.create({
      message: this.api.trans("__.uploading file"),
      position: 'top',
    })
    toast.present()
    xhr.onload = () => {
      if (xhr.status === 200) {
        toast.dismiss().then(() => {
          this.api.toast.create({
            message: this.api.trans("literals.file") + " " + this.api.trans("crud.updated"),
            duration: 1500,
            showCloseButton: true,
          }).present();
        });
        this.file = null
        this.file_name = null
        this.getTicket()
      } else {
        toast.dismiss()
        this.api.Error({ status: xhr.status })
      }
    };
    xhr.setRequestHeader("Auth-Token", this.api.user.token)
    xhr.send(formData)
  }

}
