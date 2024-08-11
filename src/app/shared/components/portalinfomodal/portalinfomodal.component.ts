import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Portal } from 'src/app/models/portal.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { FrequentQuestion } from 'src/app/models/frequentQuestion.model';
import { Course } from 'src/app/models/course.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FrequentquestionsModalComponent } from '../frequentquestions-modal/frequentquestions-modal.component';
import { CoursesModalComponent } from '../courses-modal/courses-modal.component';

@Component({
  selector: 'app-portalinfomodal',
  templateUrl: './portalinfomodal.component.html',
  styleUrls: ['./portalinfomodal.component.scss'],
})
export class PortalinfomodalComponent  implements OnInit {

  @Input() courses: Course[] = [];
  @Input() portal: Portal;
  @Input() frequentquestions: FrequentQuestion[] = [];

  sanitizedMapUrls: { [key: string]: SafeHtml } = {};
  mapUrls: { [key: string]: string } = {};
  private sanitizer = inject(DomSanitizer);

  utilsSvs = inject(UtilsService);

  ngOnInit() {
    if (this.portal.linkMap) {
      // Extraer el enlace de Google Maps del iframe
      const mapUrlMatch = this.portal.linkMap.match(/src="([^"]+)"/);
      if (mapUrlMatch) {
        const mapUrl = mapUrlMatch[1];
        this.sanitizedMapUrls[this.portal.id] = this.sanitizer.bypassSecurityTrustHtml(`<iframe src="${mapUrl}" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`);
        this.mapUrls[this.portal.id] = mapUrl;
      }
    }
  }


  dismiss() {
    this.utilsSvs.dismissModal({success: true});
  }

  openMapInNewTab(portalId: string) {
    const mapUrl = this.mapUrls[portalId];
    if (mapUrl) {
      window.open(mapUrl, '_blank');
    }
  }

  openPortalWebsite(portalUrl?: string) {
    if (portalUrl) {
      window.open(portalUrl, '_blank');
    }
  }

  async openportalFrequentQuestionsModal() {
    if (this.portal) {
    const modal = await this.utilsSvs.presentModal({
      component: FrequentquestionsModalComponent,
      cssClass: 'add-update-modal',
      componentProps: { 
        portalId: this.portal.id,
        portalName: this.portal.name,
        frequentquestions: this.frequentquestions // Asegúrate de pasar los cursos
      }
    });
    return await modal.present();
    }
  }

  async openCoursesModal() {
    if (this.portal) {
    const modal = await this.utilsSvs.presentModal({
      component: CoursesModalComponent,
      cssClass: 'add-update-modal',
      componentProps: { 
        portalId: this.portal.id,
        portalName: this.portal.name,
        courses: this.courses // Asegúrate de pasar los cursos
      }
    });
    return await modal.present();
    }
  }


}
