import { PanicPage } from './../pages/panic/panic';
import { Injectable, NgZone } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';

import moment from 'moment';
import Echo from 'laravel-echo';
declare var window: any;
import Pusher from 'pusher-js';
import { AlertController, ToastController, ModalController, Events } from "ionic-angular";
import langs from "../assets/langs";
window.Pusher = Pusher;
import { Vibration } from '@ionic-native/vibration';
import { SettingProvider } from './setting/setting';

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
  objects: any = {}
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
  constructor(public http: Http, public storage: Storage, public zone: NgZone, public alert: AlertController, public toast: ToastController, public vibration: Vibration, public modal: ModalController, public events: Events, public setting:SettingProvider) {
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
      storage.get('visits_approved').then(visits_approved => { 
        this.visits_approved = visits_approved.filter((v)=>{
          return moment().isSame(moment(v.created_at),'day')
        })

      });
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

  load(resource) {
    console.time("load " + resource)
    return new Promise((resolve, reject) => {
      if (this.objects[resource]) {
        this.objects[resource].promise
          .then((resp) => {
            resolve(resp);
            console.timeEnd("load " + resource)
          })
          .catch(reject)
        return
      }
      this.storage.get(resource + "_resource")
        .then((data) => {
          this.objects[resource] = []
          if (data) {
            this.objects[resource] = data;
          }
          var promise, query = "";
          if (resource == 'users' || resource == 'workers' || resource == 'visitors' || resource == 'pets') {
            query = "?with[]=residence"
          }
          if (resource == 'vehicles') {
            query = "?with[]=owner&with[]=residence"
          }
          if (resource == 'parkings') {
            query = "?with[]=user"
          }
          if (resource == 'products') {
            query = "?with[]=category"
          }
          if (resource == 'residences') {
            query = "?with[]=owner&with[]=users"
          }
          this.objects[resource].promise = promise = this.get(resource + query)
          this.objects[resource].promise.then((resp) => {
            this.objects[resource] = resp;
            this.objects[resource].promise = promise;
            this.objects[resource].collection = this.mapToCollection(resp);
            this.storage.set(resource + "_resource", resp);
            console.timeEnd("load " + resource)
            return resolve(this.objects[resource]);
          })
            .catch((err) => {
              reject(err);
              this.Error(err)
            })
        })
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
      // console.log(this.user.hostEcho)
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

      })

      this.Echo.private('Application')

        // user Events
        .listen('UserCreated', (data) => {
          console.log("created user:", data);
          if (this.objects.users) {
            this.zone.run(() => {
              var user = this.objects.users[this.objects.users.length] = data.user;
              this.objects.users.collection[data.user.id] = user
              if (data.image)
                user.image = data.image;
            })
          }
        })
        .listen('UserUpdated', (data) => {
          console.log("updated user:", data);
          var user_index = this.objects.users.findIndex((user) => {
            return user.id === data.user.id;
          });
          if (this.objects.users) {
            this.zone.run(() => {
              var user;
              if (user_index > -1)
                user = this.objects.users[user_index] = data.user;
              else {
                user = this.objects.users[this.objects.users.length] = data.user;
              }
              if (data.image) {
                user.image = data.image;
              }
            });
          }
        })
        .listen('UserDeleted', (data) => {
          console.log("deleted user:", data);
          var user = this.objects.users.findIndex((user) => {
            return user.id === data.user.id;
          });
          if (this.objects.user)
            this.zone.run(() => {
              if (user >= 0) {
                this.objects.users.splice(user, 1);
                delete (this.objects.user[data.user.id])
              }
            })
        })
        
        // Parking Events
        .listen('ParkingCreated', (data) => {
          console.log("created parking:", data);
          if (this.objects.parkings) {
            this.zone.run(() => {
              var parking = this.objects.parkings[this.objects.parkings.length] = data.parking;
              this.objects.parkings.collection[data.parking.id] = parking
              if (data.image)
                parking.image = data.image;
            })
          }
        })
        .listen('ParkingUpdated', (data) => {
          console.log("updated parking:", data);
          var parking_index = this.objects.parkings.findIndex((parking) => {
            return parking.id === data.parking.id;
          });
          if (this.objects.parkings) {
            this.zone.run(() => {
              var parking;
              if (parking_index > -1)
                parking = this.objects.parkings[parking_index] = data.parking;
              else {
                parking = this.objects.parkings[this.objects.parkings.length] = data.parking;
              }
              if (data.image) {
                parking.image = data.image;
              }
            });
          }
        })
        .listen('ParkingDeleted', (data) => {
          console.log("deleted parking:", data);
          var parking = this.objects.parkings.findIndex((parking) => {
            return parking.id === data.parking.id;
          });
          if (this.objects.parking)
            this.zone.run(() => {
              if (parking >= 0) {
                this.objects.parkings.splice(parking, 1);
                delete (this.objects.parking[data.parking.id])
              }
            })
        })

        // Visitor Events
        .listen('VisitorCreated', (data) => {
          console.log("created visitor:", data);
          if(this.objects.visitors){
            this.zone.run(() => {
              var visitor = this.objects.visitors[this.objects.visitors.length] = data.visitor;
              this.objects.visitors.collection[data.visitor.id] = visitor
              if (data.image)
                visitor.image = data.image;
            })
          }
        })
        .listen('VisitorUpdated', (data) => {
          console.log("updated visitor:", data);
          var visitor_index = this.objects.visitors.findIndex((visitor) => {
            return visitor.id === data.visitor.id;
          });
          if(this.objects.visitors){
            this.zone.run(() => {
              var visitor;
              if (visitor_index > -1)
                visitor = this.objects.visitors[visitor_index] = data.visitor;
              else {
                visitor = this.objects.visitors[this.objects.visitors.length] = data.visitor;
              }
              if (data.image) {
                visitor.image = data.image;
              }
            });
          }
        })
        .listen('VisitorDeleted', (data) => {
          console.log("deleted visitor:", data);
          var visitor = this.objects.visitors.findIndex((visitor) => {
            return visitor.id === data.visitor.id;
          });
          if(this.objects.visitor)
          this.zone.run(() => {
            if (visitor >= 0) {
              this.objects.visitors.splice(visitor, 1);
              delete (this.objects.visitor[data.visitor.id])
            }
          })
        })


        // Worker Events
        .listen('WorkerCreated', (data) => {
          console.log("created worker:", data);
          if (this.objects.workers) {
            this.zone.run(() => {
              var worker = this.objects.workers[this.objects.workers.length] = data.worker;
              this.objects.workers.collection[data.worker.id] = worker
              if (data.image)
                worker.image = data.image;
            })
          }
        })
        .listen('WorkerUpdated', (data) => {
          console.log("updated worker",data.worker) 
          var worker_index = this.objects.workers.findIndex((worker) => {
            return worker.id === data.worker.id;
          });
          if (this.objects.workers) {
            this.zone.run(() => {
              var worker;
              if (worker_index > -1)
                worker = this.objects.workers[worker_index] = data.worker;
              else {
                worker = this.objects.workers[this.objects.workers.length] = data.worker;
              }
              if (data.image) {
                worker.image = data.image;
              }
            });
          }
        })
        .listen('WorkerDeleted', (data) => {
          console.log("deleted worker:", data);
          var worker = this.objects.workers.findIndex((worker) => {
            return worker.id === data.worker.id;
          });
          if (this.objects.worker)
            this.zone.run(() => {
              if (worker >= 0) {
                this.objects.workers.splice(worker, 1);
                delete(this.objects.worker[data.worker.id])
              }
            })
        })

        // Correspondence Events
        .listen('CorrespondenceCreated', (data) => {
          console.log("correspondence created:", data);
          this.events.publish("CorrespondenceCreated", data);
          this.zone.run(() => {
          })
        })


        // Visit Events
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
        .listen('VisitConfirmed', (data) => {
          this.VisitConfirmed(data);
        })

        // Panic Events
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
    if(this.setting.panic) {
      data.sound = this.playSoundSOS();
      if (open == true) {
        var modal = this.modal.create(PanicPage, data);
        modal.present();
      }
      this.events.publish("panic", data);
    }
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

  private mapToCollection(array, key ="id"){
    var collection = {}
      array.forEach(element => {
          collection[element[key]] = element  
      });
      return collection;
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
