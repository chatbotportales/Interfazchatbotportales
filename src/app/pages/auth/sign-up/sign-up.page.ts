import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  form = new FormGroup({
    uid: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required,]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    status: new FormControl('0'),
  })

  firebaseSvc = inject(FirebaseService);
  utilsSvs = inject(UtilsService);

  ngOnInit() {
  }

  async submit(){
    if (this.form.valid){
      const loading = await this.utilsSvs.loading();
      await loading.present();

      this.firebaseSvc.signUp(this.form.value as User).then(async res =>{
        await this.firebaseSvc.updateUser(this.form.value.name);

        let uid = res.user.uid;
        this.form.controls.uid.setValue(uid);
        this.setUserInfo(uid);


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

  async setUserInfo(uid: string,){
    if (this.form.valid){
      const loading = await this.utilsSvs.loading();
      await loading.present();

      let path = `users/${uid}`
      delete this.form.value.password;

      this.firebaseSvc.setDocument(path, this.form.value).then(async res =>{
        
        //this.utilsSvs.saveInLocalStorage("user", this.form.value);
        this.utilsSvs.routerlink('/auth');
        this.form.reset();

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
        this.utilsSvs.presentToast({
          message: `Usuario Registrado, debe esperar a habilitar el perfil`,
          duration: 2800,
          color: 'primary',
          position: 'middle',
          icon: 'person-circle-outline',
        });
      })
    }
  }

}
