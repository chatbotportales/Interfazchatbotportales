import { Component, OnInit, inject } from '@angular/core';
import { Portal } from 'src/app/models/portal.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdatePortalComponent } from 'src/app/shared/components/add-update-portal/add-update-portal.component';
import { orderBy } from 'firebase/firestore'

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvs = inject(UtilsService);

  portales: Portal[] = [];
  loading: boolean = false;

  ngOnInit() {
  }

  user(): User{
    return this.utilsSvs.getFromLocalStorage('user');
  }

  ionViewDidEnter() { //funcion cada vez que entre a la pagina
    this.getPortales();
  }

  async ConfirmDeletePortal(portal: Portal) {
    this.utilsSvs.presentAlert({
      header: 'Eliminar Portal!',
      message: ' ¿Estas seguro que quiere eliminar este portal?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
        }, {
          text: 'Si, Eliminar',
          handler: () => {
            this.deletePortal(portal);
          }
        }
      ]
    });
  }

  doRefresh(event) {   
    setTimeout(() => {
      this.getPortales();
      event.target.complete();
    }, 1000);
  }


  getPortales(){
    //this.user().uid
    let path = `portales`;
    
    this.loading = true;

    let query = [
      orderBy('name', 'asc'),
      //where('name','>','30'),
    ]

    let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
      next: (res: any) => {
        this.portales = res;
        this.loading = false;
        sub.unsubscribe();
      }
    })
  }

  async addUpdatePortal(portal?: Portal) {
    let success = await this.utilsSvs.presentModal({
      component: AddUpdatePortalComponent,
      cssClass: 'add-update-modal',
      componentProps: { portal },
    })

    if(success)this.getPortales();
  }

  async deletePortal(portal: Portal){

    let path = `portales/${portal.id}`

    const loading = await this.utilsSvs.loading();
    await loading.present();

    let imagePath = await this.firebaseSvc.getFilePath(portal.image);
    await this.firebaseSvc.deleteFile(imagePath)

    this.firebaseSvc.deleteDocument(path).then(async res =>{

      this.portales = this.portales.filter(p=> p.id !== portal.id);

      this.utilsSvs.presentToast({
        message: "Portal acteliminado exitosamente",
        duration: 1800,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline',
      })


    }).catch(error => {
      
      this.utilsSvs.presentToast({
        message: error.message,
        duration: 2500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline',
      })

    }).finally(() => {
      loading.dismiss();
    })

  }

}
