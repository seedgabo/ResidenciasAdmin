import { PanicPage } from './../pages/panic/panic';
import { Injectable, NgZone } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';

import Echo from 'laravel-echo';
declare var window: any;
import Pusher from 'pusher-js';
import { AlertController, ToastController, ModalController, Events } from "ionic-angular";
import langs from "../assets/langs";
window.Pusher = Pusher;
import { Vibration } from '@ionic-native/vibration';

@Injectable()
export class Api {
  sound: any;
  modules: any;
  settings: any;
  residence: any;
  roles: any;
  Echo: any;
  url;
  // url = "http://localhost/residencias/public/";
  username = "";
  password = "";
  user;
  langs: any = langs;

  residences_collection = {};
  residences = [];
  parkings = [];
  vehicles = [];
  visitors = [];
  visits = [];
  visits_approved = [];
  resolve;
  ready: Promise<any> = new Promise((resolve) => {
    this.resolve = resolve;
  });
  constructor(public http: Http, public storage: Storage, public zone: NgZone, public alert: AlertController, public toast: ToastController, public vibration: Vibration, public modal: ModalController, public events: Events) {
    storage.ready().then(() => {
      storage.get('url').then(url_data => {
        if (url_data)
          this.url = url_data;
        else if (window.url)
          this.url = window.url;
      });
      storage.get('modules').then(modules => { this.modules = modules });
      storage.get('settings').then(settings => { this.settings = settings });
      storage.get('roles').then(roles => { this.roles = roles });
      storage.get('residence').then(residence => { this.residence = residence });
      storage.get('langs').then(langs => { this.langs = langs; console.log(langs) });
      storage.get('user').then(user => {
        this.user = user
        this.resolve(user);
      });
      window.$api = this;

    });
  }

  doLogin() {
    return new Promise((resolve, reject) => {
      this.http.get(this.url + "api/login", { headers: this.setHeaders() })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
          this.user = data.user;
          this.residence = data.residence
          this.modules = data.modules
          this.roles = data.roles
          this.settings = data.settings
          this.storage.set('user', data.user);
          this.storage.set('residence', data.residence);
          this.storage.set('modules', this.modules);
          this.storage.set('roles', this.roles);
          this.storage.set('settings', this.settings);
          this.getLang();
        }, error => {
          return reject(error);
        });
    });
  }

  getLang() {
    this.get('lang')
      .then((langs) => {
        console.log(langs);
        this.storage.set('langs', langs);
        this.langs = langs;
      })
      .catch((err) => {
        console.error('error trying to download translations', err);
      })
  }

  get(uri) {
    return new Promise((resolve, reject) => {
      this.http.get(this.url + "api/" + uri, { headers: this.setHeaders() })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          return reject(error);
        });
    });
  }

  post(uri, data) {
    return new Promise((resolve, reject) => {
      this.http.post(this.url + "api/" + uri, data, { headers: this.setHeaders() })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          return reject(error);
        });
    });
  }

  put(uri, data) {
    return new Promise((resolve, reject) => {
      this.http.put(this.url + "api/" + uri, data, { headers: this.setHeaders() })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          return reject(error);
        });
    });
  }

  delete(uri) {
    return new Promise((resolve, reject) => {
      this.http.delete(this.url + "api/" + uri, { headers: this.setHeaders() })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          return reject(error);
        });
    });
  }

  getData() {
    return new Promise((resolve, reject) => {
      this.http.get(this.url + "api/getData", { headers: this.setHeaders() })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);

          this.user = data.user;
          this.residence = data.residence;
          this.user.residences = data.residences;
          this.modules = data.modules;
          this.roles = data.roles;
          this.settings = data.settings;
          console.log(data.settings);
          this.storage.set('user', data.user);
          this.storage.set('residence', data.residence);
          this.storage.set('modules', this.modules);
          this.storage.set('roles', this.roles);
          this.storage.set('settings', this.settings);

          this.get('residences?with[]=users').then((data: any) => {
            this.residences = data;
            data.forEach(res => {
              this.residences_collection[res.id] = res;
            });
          });
        }, error => {
          return reject(error);
        });
    });
  }

  saveData(userData) {
    this.user = userData.user;
    this.settings = userData.settings;
    this.modules = userData.modules;
    this.storage.set('user', this.user);
    this.storage.set('modules', this.modules);
    this.storage.set('settings', this.settings);
    this.getLang();
  }

  loginOAuth(userData) {
    return new Promise((resolve, reject) => {
      this.http.post(this.url + "api/login/oauth", userData, {})
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          return reject(error);
        });
    });
  }

  startEcho() {
    this.ready.then(() => {
      console.log(this.user.hostEcho)
      this.Echo = new Echo({
        key: '807bbfb3ca20f7bb886e',
        authEndpoint: this.url + 'broadcasting/auth',
        broadcaster: 'socket.io', // pusher o socket.io
        host: this.user.hostEcho,
        auth:
          {
            headers:
              {
                'Auth-Token': this.user.token,
              }
          }

      });
      this.Echo.private('Application')
        .listen('ParkingCreated', (data) => {
          console.log("created parking:", data);
          this.zone.run(() => {
            data.parking.user = data.user;
            data.parking.residence = data.residence;
            this.parkings[this.parkings.length] = data.parking;
          })
        })
        .listen('ParkingUpdated', (data) => {
          console.log("updated parking:", data);
          var parking = this.parkings.findIndex((parking) => {
            return parking.id === data.parking.id;
          });
          this.zone.run(() => {
            data.parking.user = data.user;
            data.parking.residence = data.residence;
            if (parking >= 0) {
              this.parkings[parking] = data.parking;

            }
            else {
              this.parkings[this.parkings.length] = data.parking;
            }
          });
        })
        .listen('ParkingDeleted', (data) => {
          console.log("deleted parking:", data);
          var parking = this.parkings.findIndex((parking) => {
            return parking.id === data.parking.id;
          });
          this.zone.run(() => {
            if (parking >= 0) {
              this.parkings.splice(parking, 1);
            }
          })
        })

        .listen('VisitorCreated', (data) => {
          console.log("created visitor:", data);
          this.zone.run(() => {
            var visitor = this.visitors[this.visitors.length] = data.visitor;
            if (data.image)
              visitor.image = data.image;
          })
        })
        .listen('VisitorUpdated', (data) => {
          console.log("updated visitor:", data);
          var visitor_index = this.visitors.findIndex((visitor) => {
            return visitor.id === data.visitor.id;
          });
          this.zone.run(() => {
            var visitor;
            if (visitor_index > -1)
              visitor = this.visitors[visitor_index] = data.visitor;
            else {
              visitor = this.visitors[this.visitors.length] = data.visitor;
            }
            if (data.image) {
              visitor.image = data.image;
            }
          });
        })
        .listen('VisitorDeleted', (data) => {
          console.log("deleted visitor:", data);
          var visitor = this.visitors.findIndex((visitor) => {
            return visitor.id === data.visitor.id;
          });
          this.zone.run(() => {
            if (visitor >= 0) {
              this.visitors.splice(visitor, 1);
            }
          })
        })

        .listen('VisitCreated', (data) => {
          console.log("visit created:", data);
          this.zone.run(() => {
            this.visits.unshift(data.visit);
            var visit = this.visits[0];
            if (data.visitor) {
              visit.visitor = data.visitor;
              visit.guest = data.guest;
              visit.visitors = data.visitors;

            }

            if (visit.status == 'approved') {
              this.visitPreApproved(visit);
            }
          })
        })
        .listen('VisitUpdated', (data) => {
          console.log("visit updated:", data);
          var visit_index = this.visits.findIndex((visit) => {
            return visit.id === data.visit.id;
          });
          this.zone.run(() => {
            var visit;
            if (visit_index > -1)
              visit = this.visits[visit_index] = data.visit;
            else {
              this.visits.unshift(data.visit);
              visit = this.visits[0];
            }
            if (data.visitor) {
              visit.visitor = data.visitor;
              visit.visitors = data.visitors;
              visit.guest = data.guest;

            }
          });
        })
        .listen('VisitDeleted', (data) => {
          console.log("visit deleted:", data);
          var visit = this.visits.findIndex((visit) => {
            return visit.id === data.visit.id;
          });
          this.zone.run(() => {
            if (visit >= 0) {
              this.visits.splice(visit, 1);
            }
          })
        })

        .listen('CorrespondenceCreated', (data) => {
          console.log("correspondence created:", data);
          this.events.publish("CorrespondenceCreated", data);
          this.zone.run(() => {
          })
        })

        .listen('VisitConfirmed', (data) => {
          this.VisitConfirmed(data);
        })

        .listen('Panic', (data) => {
          console.log("panic", data)
          this.handlePanic(data);
        })

        .listen('PanicUpdate', (data) => {
          console.log("panic", data)
          this.handlePanic(data, false);
        })

      this.Echo.private('App.User.' + this.user.id)
        .notification((notification) => {
          console.log(notification);
        });

      this.Echo.join('App.Mobile')
        .here((data) => {
          console.log("here:", data);
        })
        .joining((data) => {
          console.log("joining", data);
        })
        .leaving((data) => {
          console.log("leaving", data);
        })

      // console.log(this.Echo);
    })
  }

  stopEcho() {
    this.Echo.leave('Application');
    this.Echo.leave('App.User.' + this.user.id);
    this.Echo = undefined;
  }


  trans(value, args = null) {
    if (!this.langs) return value;
    var base, trans;
    var splits = value.split('.');
    if (splits.length == 2) {
      base = this.langs[splits[0]];
      if (base) {
        trans = base[splits[1]];
        if (trans) {
          value = trans;
        }
      }
    } else {
      base = this.langs["__"];
      if (base) {
        trans = base[value];
        if (trans) {
          value = trans;
        }
      }
    }
    if (args) {
      for (var k in args) {
        value = value.replace(':' + k, args[k]);
      }
    }
    return value.replace('__.', '').replace('literals.', '');
  }

  visitPreApproved(visit) {
    this.playSoundBeep();
    var alert = this.alert.create({
      title: this.trans('literals.visit') + " Pre " + this.trans('literals.approved_f'),
      subTitle: this.trans('literals.visitor') + ': ' + (visit.visitor ? visit.visitor.name : visit.guest ? visit.guest.name : ''),
      message: visit.note,
      buttons: ["OK"],
    })
    alert.present();
    this.get('visits/' + visit.id + "?with[]=visitor&with[]=visitors&with[]=vehicle&with[]=parking&with[]=user&with[]=residence")
      .then((data: any) => {
        this.visits_approved[this.visits_approved.length] = data;
        this.storage.set('visits_approved', this.visits_approved);
        if (data.visitors.length > 1) {
          var text = this.trans('literals.visitors') + ': '
          data.visitors.forEach(person => {
            text += `${person.name}, `
          });
          alert.setSubTitle(text);
        }

      })
      .catch(console.error)
  }

  VisitConfirmed(data) {
    var visit = data.visit;
    visit.visitor = data.visitor;
    visit.guest = data.guest;
    visit.visitors = data.visitors;
    this.alert.create({
      cssClass: "visit-" + visit.status,
      title: this.trans('literals.visit') + " " + this.trans('literals.' + visit.status),
      subTitle: this.trans('literals.visitor') + ': ' + (visit.visitor ? visit.visitor.name : visit.guest ? visit.guest.name : ''),
      message: visit.note,
      buttons: ["OK"],
    }).present();
  }

  handlePanic(data, open = true) {
    data.sound = this.playSoundSOS();
    if (open == true) {
      var modal = this.modal.create(PanicPage, data);
      modal.present();
    }
    this.events.publish("panic", data);
  }

  Error(error) {
    var message = "";
    console.log(error);
    if (error.status == 500) {
      message = this.trans("__.Internal Server Error")
    }
    if (error.status == 404) {
      message = this.trans("__.Not Found")
    }
    if (error.status == 401) {
      message = this.trans("__.Unauthorized")
    }
    this.alert.create({
      title: this.trans("__.Network Error"),
      subTitle: error.error,
      message: message + ":" + error.statusText,
      buttons: ["OK"],

    }).present();
  }

  private setHeaders() {
    let headers = new Headers();
    if (this.user && this.user.token)
      headers.append("Auth-Token", this.user.token);
    else
      headers.append("Authorization", "Basic " + btoa(this.username + ":" + this.password));
    return headers;
  }


  playSoundNotfication() {
    this.sound = new Audio('assets/sounds/notifcations.mp3');
    this.sound.play();
    try {
      this.vibration.vibrate([200]);

    } catch (error) {
      navigator.vibrate([200]);
    }
    return this.sound;
  }

  playSoundBeep() {
    this.sound = new Audio('assets/sounds/beep.mp3');
    this.sound.play();
    try {
      this.vibration.vibrate([50]);

    } catch (error) {
      navigator.vibrate([50]);
    }
    return this.sound;
  }

  playSoundSOS() {
    this.sound = new Audio('assets/sounds/sos.mp3');
    this.sound.play();
    try {
      this.vibration.vibrate([300, 200, 300, 200, 300, 200, 300, 300, 200, 300, 200, 300, 200, 300, 200]);

    } catch (error) {
      navigator.vibrate([300, 200, 300, 200, 300, 200, 300, 300, 200, 300, 200, 300, 200, 300, 200]);
    }
    return this.sound;
  }

}
