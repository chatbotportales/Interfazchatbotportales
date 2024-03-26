import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, AlertOptions, LoadingController, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  loadingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  modalCtr = inject(ModalController);
  router = inject(Router);
  alertCtrl = inject(AlertController);
  

  async takePicture (promptLabelHeader: string) {
    return await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      promptLabelHeader,
      promptLabelPhoto: 'Selecciona una imagen',
      promptLabelPicture: 'Toma una foto',
    });

  };


  loading() {
    return this.loadingCtrl.create({ spinner: 'crescent'})
  }

  async presentToast(opts?: ToastOptions) {
    const toast = await this.toastCtrl.create(opts);
    toast.present();
  }

  routerlink(url: string) {
    return this.router.navigateByUrl(url);
  }

  saveInLocalStorage(key: string, value: any){
    return localStorage.setItem(key, JSON.stringify(value));
  }

  getFromLocalStorage(key: string){
    return JSON.parse(localStorage.getItem(key));
  }

  // modal
  async presentModal(opts: ModalOptions) {
    const modal = await this.modalCtr.create(opts); 
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if(data) return data;
  
  }

  dismissModal(data?: any){
    return this.modalCtr.dismiss(data);
  }

  async presentAlert(opts?: AlertOptions) {
    const alert = await this.alertCtrl.create(opts);
    await alert.present();
  }
}
