import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Portal } from 'src/app/models/portal.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-portal',
  templateUrl: './add-update-portal.component.html',
  styleUrls: ['./add-update-portal.component.scss'],
})
export class AddUpdatePortalComponent  implements OnInit {

  @Input() portal: Portal;

  form = new FormGroup({
    id: new FormControl(''),
    iduser: new FormControl(''),
    
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    image: new FormControl('', [Validators.required,]),
    address: new FormControl('', [Validators.required,]),

    mondayStartTime: new FormControl('', [Validators.required]),
    mondayEndTime: new FormControl('', [Validators.required]),
    saturdayStartTime: new FormControl('', [Validators.required]),
    saturdayEndTime: new FormControl('', [Validators.required]),

    email: new FormControl(''),
    phone: new FormControl(''),
    url: new FormControl(''),
    linkMap: new FormControl(''),

  })

  firebaseSvc = inject(FirebaseService);
  utilsSvs = inject(UtilsService);

  user = {} as User;


  ngOnInit() {
    this.user = this.utilsSvs.getFromLocalStorage('user');
    if (this.portal) this.form.setValue(this.portal);
  }

  async takeImage(){
    const dataUrl = (await this.utilsSvs.takePicture('Imagen del Portal')).dataUrl;
    this.form.controls.image.setValue(dataUrl);
  }

  submit(){
    if (this.form.valid){
      if (this.portal) this.updatePortal();
      else this.createPortal();
    }
  }

  async createPortal(){
   

      //let path = `users/${this.user.uid}/products`
      let path = `portales`
      let uid = this.user.uid;
      this.form.controls.iduser.setValue(uid);

      const loading = await this.utilsSvs.loading();
      await loading.present();

      // sibir imagen y obtene url
      let dataUrl = this.form.value.image;
      //this.user.uid
      let imagePath = `portales/${Date.now()}`;
      let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
      this.form.controls.image.setValue(imageUrl);

      delete this.form.value.id;

      this.firebaseSvc.addDocument(path, this.form.value).then(async res =>{

        this.utilsSvs.dismissModal({success: true});

        this.utilsSvs.presentToast({
          message: "Portal Creado exitosamente",
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

      let path = `portales/${this.portal.id}`

      const loading = await this.utilsSvs.loading();
      await loading.present();

      // sibir imagen y obtene url
      let dataUrl = this.form.value.image;
      if ( this.form.value.image !== this.portal.image ){
        let imagePath = await this.firebaseSvc.getFilePath(this.portal.image);
        let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
        this.form.controls.image.setValue(imageUrl);
      }
      

      delete this.form.value.id;

      this.firebaseSvc.updateDocument(path, this.form.value).then(async res =>{

        this.utilsSvs.dismissModal({success: true});

        this.utilsSvs.presentToast({
          message: "Portal actualizado exitosamente",
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
