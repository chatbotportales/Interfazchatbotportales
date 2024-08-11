import { Component, OnInit, inject } from '@angular/core';
import { Portal } from 'src/app/models/portal.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { orderBy, where } from 'firebase/firestore'
import { FrequentQuestion } from 'src/app/models/frequentQuestion.model';
import { ActivatedRoute } from '@angular/router';
import { AddUpdateFrequentQuestionComponent } from 'src/app/shared/components/add-update-frequent-question/add-update-frequent-question.component';
import { IonItemSliding } from '@ionic/angular';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-frequent-questions',
  templateUrl: './frequent-questions.page.html',
  styleUrls: ['./frequent-questions.page.scss'],
})
export class FrequentQuestionsPage implements OnInit {

  @ViewChild('slidingItem', { static: false }) slidingItem: IonItemSliding;

  openOptions(slidingItem: IonItemSliding) {
    slidingItem.open('end'); // Abre las opciones desde el final (deslizar hacia la izquierda)
  }

  firebaseSvc = inject(FirebaseService);
  utilsSvs = inject(UtilsService);

  frequentQuestions: FrequentQuestion[] = [];
  loading: boolean = false;
  idPortal: string;
  namePortal: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    // Recibiendo el ID del curso desde la navegación
    this.route.queryParams.subscribe(params => {
      this.idPortal = params['id'];
      this.namePortal = params['name'];
    });
  }

  user(): User{
    return this.utilsSvs.getFromLocalStorage('user');
  }

  ionViewDidEnter() { //funcion cada vez que entre a la pagina
    if(this.idPortal) this.getFrequentQuestions();
  }

  getFrequentQuestions(){
    //this.user().uid
    let path = `frequentQuestions`;
    
    this.loading = true;

    let query = [
      orderBy('ask', 'asc'),
      //where('idPortal', '==', this.idPortal),
    ]

    let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
      next: (res: any) => {
        this.frequentQuestions = res;
        this.frequentQuestions = res.filter((frequentQuestion: any) => {
            return frequentQuestion.idPortal === this.idPortal;
        });
        this.loading = false;
        sub.unsubscribe();
      }
    })
  }

  doRefresh(event) {   
    setTimeout(() => {
      this.getFrequentQuestions();
      event.target.complete();
    }, 1000);
  }

  async addUpdateFrequentQuestion(frequentQuestion?: FrequentQuestion) {
    let success = await this.utilsSvs.presentModal({
      component: AddUpdateFrequentQuestionComponent,
      cssClass: 'add-update-modal',
      componentProps: { frequentQuestion },
    })

    if(success)this.getFrequentQuestions();
  }

  async deleteFrequentQuestion(frequentQuestion: FrequentQuestion){

    let path = `frequentQuestions/${frequentQuestion.id}`

    const loading = await this.utilsSvs.loading();
    await loading.present();

    this.firebaseSvc.deleteDocument(path).then(async res =>{

      this.frequentQuestions = this.frequentQuestions.filter(p=> p.id !== frequentQuestion.id);

      this.utilsSvs.presentToast({
        message: "Pregunta eliminada exitosamente",
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

  async ConfirmDeleteFrequentQuestion(frequentQuestion: FrequentQuestion) {
    this.utilsSvs.presentAlert({
      header: 'Eliminar Pregunta!',
      message: ' ¿Estas seguro que quiere eliminar esta Pregunta?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
        }, {
          text: 'Si, Eliminar',
          handler: () => {
            this.deleteFrequentQuestion(frequentQuestion);
          }
        }
      ]
    });
  }

  async getPortalInfo(uid: string){
      let path = `portales/${uid}`
      this.firebaseSvc.getDocument(path).then((portal: Portal) =>{
        
      });
  }



}
