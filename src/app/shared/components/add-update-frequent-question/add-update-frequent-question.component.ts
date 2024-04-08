import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FrequentQuestion } from 'src/app/models/frequentQuestion.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-update-frequent-question',
  templateUrl: './add-update-frequent-question.component.html',
  styleUrls: ['./add-update-frequent-question.component.scss'],
})
export class AddUpdateFrequentQuestionComponent  implements OnInit {

  @Input() frequentQuestion: FrequentQuestion;

  form = new FormGroup({
    id: new FormControl(''),
    idPortal: new FormControl(''),
    
    answer: new FormControl('', [Validators.required,Validators.minLength(4)]),
    ask: new FormControl('', [Validators.required,]),
    url: new FormControl(''),

  })

  firebaseSvc = inject(FirebaseService);
  utilsSvs = inject(UtilsService);

  user = {} as User;
  idPortal: string;

  constructor(private route: ActivatedRoute) { }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idPortal = params['id'];
    });
    if (this.frequentQuestion) this.form.setValue(this.frequentQuestion);
  }

  submit(){
    if (this.form.valid){
      if (this.frequentQuestion) this.updateFrequentQuestion();
      else this.createFrequentQuestion();
    }
  }

  async createFrequentQuestion(){
  
      let currentDate = new Date();
      let formattedDate = currentDate.toLocaleString();
      //let path = `users/${this.user.uid}/products`
      let path = `frequentQuestions`
      this.form.controls.idPortal.setValue(this.idPortal);

      const loading = await this.utilsSvs.loading();
      await loading.present();

      delete this.form.value.id;

      this.firebaseSvc.addDocument(path, this.form.value).then(async res =>{

        this.utilsSvs.dismissModal({success: true});

        this.utilsSvs.presentToast({
          message: "Pregunta Creada exitosamente",
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


  async updateFrequentQuestion(){

      let path = `frequentQuestions/${this.frequentQuestion.id}`

      const loading = await this.utilsSvs.loading();
      await loading.present();        

      delete this.form.value.id;

      this.firebaseSvc.updateDocument(path, this.form.value).then(async res =>{

        this.utilsSvs.dismissModal({success: true});

        this.utilsSvs.presentToast({
          message: "Pregunta actualizada exitosamente",
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
