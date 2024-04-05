import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Course } from 'src/app/models/course.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-update-course',
  templateUrl: './add-update-course.component.html',
  styleUrls: ['./add-update-course.component.scss'],
})
export class AddUpdateCourseComponent  implements OnInit {

  @Input() course: Course;

  form = new FormGroup({
    id: new FormControl(''),
    idPortal: new FormControl(''),
    
    name: new FormControl('', [Validators.required,Validators.minLength(4)]),
    description: new FormControl('', [Validators.required,]),
    duration: new FormControl('', [Validators.required,]),
    status: new FormControl('', [Validators.required,]),
    modality: new FormControl('', [Validators.required,]),
    creationDate: new FormControl(''),
    modificationDate: new FormControl(''),
    prerequisites: new FormControl('', [Validators.required,]),

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
    if (this.course) this.form.setValue(this.course);
  }

  submit(){
    if (this.form.valid){
      if (this.course) this.updatePortal();
      else this.createPortal();
    }
  }

  async createPortal(){
  
      let currentDate = new Date();
      let formattedDate = currentDate.toLocaleString();
      //let path = `users/${this.user.uid}/products`
      let path = `courses`
      this.form.controls.idPortal.setValue(this.idPortal);
      this.form.controls.modificationDate.setValue(formattedDate);
      this.form.controls.creationDate.setValue(formattedDate);

      const loading = await this.utilsSvs.loading();
      await loading.present();

      delete this.form.value.id;

      this.firebaseSvc.addDocument(path, this.form.value).then(async res =>{

        this.utilsSvs.dismissModal({success: true});

        this.utilsSvs.presentToast({
          message: "Curso Creado exitosamente",
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


  async updatePortal(){

      let path = `courses/${this.course.id}`

      const loading = await this.utilsSvs.loading();
      await loading.present();      
      let currentDate = new Date();
      let formattedDate = currentDate.toLocaleString();
      this.form.controls.modificationDate.setValue(formattedDate);

      delete this.form.value.id;

      this.firebaseSvc.updateDocument(path, this.form.value).then(async res =>{

        this.utilsSvs.dismissModal({success: true});

        this.utilsSvs.presentToast({
          message: "Curso actualizado exitosamente",
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
