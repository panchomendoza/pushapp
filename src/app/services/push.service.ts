import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensajes: OSNotificationPayload[] = [
    // {
    //   title: 'Titulo Push',
    //   body: 'Body Push',
    //   date: new Date()
    // }
  ];

  userId: string;

  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor(private oneSignal: OneSignal,
              private storage: Storage) { 

    this.cargarMensajes();
  
  }

  async getMensajes(){
    await this.cargarMensajes();
    return [...this.mensajes];
  }

  configuracionInicial(){
    this.oneSignal.startInit('af783149-6a63-4c6c-8cd9-e5882a0e3935','482991871730');

    this.oneSignal.inFocusDisplaying( this.oneSignal.OSInFocusDisplayOption.Notification );

    this.oneSignal.handleNotificationReceived().subscribe((noti) => {
    // do something when notification is received
      console.log('Notificacion recibida ', noti);
      this.notificacionRecibida(noti);
    });

    this.oneSignal.handleNotificationOpened().subscribe( async (noti) => {
      // do something when a notification is opened
      console.log('Notificacion abierta ', noti);
      await this.notificacionRecibida( noti.notification )
    });


    // Obtener id de suscriptor
    this.oneSignal.getIds().then(info => {
      this.userId = info.userId;
      console.log(this.userId);
    })

    this.oneSignal.endInit();
  }


  async notificacionRecibida(noti:OSNotification){
    
    await this.cargarMensajes()

    const payload = noti.payload;
    
    const existePush = this.mensajes.find(mensaje => {
      mensaje.notificationID === payload.notificationID;
    })

    if(existePush){
      return;
    }

    this.mensajes.unshift( payload );

    this.pushListener.emit( payload );

    await this.guardarMensajes();
  }

  guardarMensajes(){
    this.storage.set('mensajes', this.mensajes)
  }

  async cargarMensajes(){
    
    this.mensajes = await this.storage.get('mensajes') || [] ;
//    return this.mensajes;
  }

  async borrarMensajes(){
    await this.storage.clear();
    this.mensajes = [];
    this.guardarMensajes();
  }

}
