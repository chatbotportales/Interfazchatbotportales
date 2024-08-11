import { Component, OnInit, inject } from '@angular/core';
import { Portal } from 'src/app/models/portal.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { orderBy, where } from 'firebase/firestore'
import { Course } from 'src/app/models/course.model';
import { ActivatedRoute } from '@angular/router';
import { AddUpdateCourseComponent } from 'src/app/shared/components/add-update-course/add-update-course.component';
import { IonItemSliding } from '@ionic/angular';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-course',
  templateUrl: './course.page.html',
  styleUrls: ['./course.page.scss'],
})
export class CoursePage implements OnInit {

  @ViewChild('slidingItem', { static: false }) slidingItem: IonItemSliding;

  openOptions(slidingItem: IonItemSliding) {
    slidingItem.open('end'); // Abre las opciones desde el final (deslizar hacia la izquierda)
  }

  firebaseSvc = inject(FirebaseService);
  utilsSvs = inject(UtilsService);

  courses: Course[] = [];
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
    if(this.idPortal) this.getCourses();
  }

  getCourses(){
    //this.user().uid
    let path = `courses`;
    
    this.loading = true;

    let query = [
      orderBy('name', 'asc'),
      //where('idPortal', '==', this.idPortal),
    ]

    let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
      next: (res: any) => {
        this.courses = res;
        this.courses = res.filter((course: any) => {
            return course.idPortal === this.idPortal;
        });
        this.loading = false;
        sub.unsubscribe();
      }
    })
  }

  doRefresh(event) {   
    setTimeout(() => {
      this.getCourses();
      event.target.complete();
    }, 1000);
  }

  async addUpdateCourse(course?: Course) {
    let success = await this.utilsSvs.presentModal({
      component: AddUpdateCourseComponent,
      cssClass: 'add-update-modal',
      componentProps: { course },
    })

    if(success)this.getCourses();
  }

  async deleteCourse(course: Course){

    let path = `courses/${course.id}`

    const loading = await this.utilsSvs.loading();
    await loading.present();

    this.firebaseSvc.deleteDocument(path).then(async res =>{

      this.courses = this.courses.filter(p=> p.id !== course.id);

      this.utilsSvs.presentToast({
        message: "Curso eliminado exitosamente",
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

  async ConfirmDeleteCourse(cuorse: Course) {
    this.utilsSvs.presentAlert({
      header: 'Eliminar Curso!',
      message: ' ¿Estas seguro que quiere eliminar este curso?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
        }, {
          text: 'Si, Eliminar',
          handler: () => {
            this.deleteCourse(cuorse);
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
