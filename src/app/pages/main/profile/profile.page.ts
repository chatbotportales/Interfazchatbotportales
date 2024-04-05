import { Component, Input, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  @Input() userp: User;

  firebaseSvs = inject(FirebaseService);
  utilsSvs = inject(UtilsService);

  
  form = new FormGroup({
    uid: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),

  })

  ngOnInit() {
    this.userp = this.utilsSvs.getFromLocalStorage('user');
    this.form.setValue({
      'name': this.userp.name,
      uid: this.userp.uid
    });
  }

  signOut(){
    this.firebaseSvs.signOut();
  }

  user(): User{
    return this.utilsSvs.getFromLocalStorage('user');
  }

  submit(){
    if (this.form.valid){
      this.updateUser();
    }
  }

  async updateUser(){

    let user = this.userp;
    let path = `users/${user.uid}`

    const loading = await this.utilsSvs.loading();
    await loading.present();

    this.firebaseSvs.updateDocument(path,{name: this.form.value.name}).then(async res =>{
      user.name = this.form.value.name
      this.utilsSvs.saveInLocalStorage('user', user)

      this.utilsSvs.presentToast({
        message: "Usuario actualizado exitosamente",
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
