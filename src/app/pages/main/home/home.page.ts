import { Component, OnInit, inject } from '@angular/core';
import { Portal } from 'src/app/models/portal.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdatePortalComponent } from 'src/app/shared/components/add-update-portal/add-update-portal.component';
import { orderBy } from 'firebase/firestore'
import { Router, NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { IonItemSliding } from '@ionic/angular';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  @ViewChild('slidingItem', { static: false }) slidingItem: IonItemSliding;

  openOptions(slidingItem: IonItemSliding) {
    slidingItem.open('end'); // Abre las opciones desde el final (deslizar hacia la izquierda)
  }

  firebaseSvc = inject(FirebaseService);
  utilsSvs = inject(UtilsService);

  portales: Portal[] = [];
  loading: boolean = false;
  idUser = ""

  portalCourseCounts: { [key: string]: number } = {};
  portalfrequentQuestionsCounts: { [key: string]: number } = {};

  ngOnInit() {
    this.loadPortales();
  }

  async loadPortales() {
    this.loading = true;
    this.getPortales();
  }

  getPortales() {
    //this.user().uid
    let path = `portales`;

    this.loading = true;

    let query = [
      orderBy('name', 'asc'),
      //where('name','>','30'),
    ];

    let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
      next: (res: any) => {
        this.portales = res;
        sub.unsubscribe();
        this.updateCourseCounts();
        this.updateFrequentQuestionsCounts();
        this.loading = false;
      }
    });

    
  }

  updateCourseCounts() {
    if (this.portales.length) {
      this.portales.forEach(portal => {
        let path = `courses`;
        let courses = null
        let query = []
    
        let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
          next: (res: any) => {
            courses = res;
            courses = res.filter((course: any) => {
                return course.idPortal === portal.id;
            });
            sub.unsubscribe();
            this.portalCourseCounts[portal.id] = courses.length;
          }
        })
      });
    }
  }

  updateFrequentQuestionsCounts() {
    if (this.portales.length) {
      this.portales.forEach(portal => {
        let path = `frequentQuestions`;
        let frequentQuestions = null
        let query = []
    
        let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
          next: (res: any) => {
            frequentQuestions = res;
            frequentQuestions = res.filter((course: any) => {
                return course.idPortal === portal.id;
            });
            sub.unsubscribe();
            this.portalfrequentQuestionsCounts[portal.id] = frequentQuestions.length;
          }
        })
      });
    }
  }

  user(): User{
    this.idUser = this.utilsSvs.getFromLocalStorage('user').id
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


  getPortales2(){
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
        message: "Portal eliminado exitosamente",
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
  constructor(private navCtrl: NavController, private router: Router) {}
  goToCursos(id: string, name:string) {
    
    // Puedes pasar parámetros a través de queryParams o state
    //let navigationExtras: NavigationExtras = {
    //  state: {
    //    id: id
    //  }
    //};
    
    // Navegar a la página "cursos" con los parámetros
    //this.utilsSvs.routerlink('/main/course');
    this.router.navigate(['/main/course'], { queryParams: { id: id, name: name} });
  }

  goToFrequentQuestion(id: string, name:string) {
    this.router.navigate(['/main/frequent-questions'], { queryParams: { id: id, name: name} });
  }
  

}
