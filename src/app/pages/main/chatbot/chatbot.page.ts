import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'; 
import { CoursesModalComponent } from 'src/app/shared/components/courses-modal/courses-modal.component';
import { UtilsService } from 'src/app/services/utils.service';
import { NavController } from '@ionic/angular';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FrequentquestionsModalComponent } from 'src/app/shared/components/frequentquestions-modal/frequentquestions-modal.component';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.page.html',
  styleUrls: ['./chatbot.page.scss'],
})
export class ChatbotPage implements OnInit {
  portalCourses: any[] = [];
  portalFrequentQuestions: any[] = [];
  portales: any[] = [];
  
  portalCourseCounts: { [key: string]: number } = {};
  portalFrequentQuestionsCounts: { [key: string]: number } = {};

  loading: boolean = false;
  idUser = ""

  firebaseSvc = inject(FirebaseService);
  utilsSvs = inject(UtilsService);
  sanitizedMapUrls: { [key: string]: SafeHtml } = {};
  mapUrls: { [key: string]: string } = {};
  private sanitizer = inject(DomSanitizer);
 
  constructor(private navCtrl: NavController, private router: Router) {}
  ngOnInit() {
    this.loadPortales();
    const htmlContent = `
      <div>
      
      <df-messenger
        project-id="chatbot-portales-v3"
        agent-id="acfe22ea-dff0-4dc8-b812-74c36a786687"
        language-code="es"
        max-query-length="-1">
        <df-messenger-chat-bubble
         chat-title="ChatBot Portales Interactivos Ciudad Bolivar">
        </df-messenger-chat-bubble>
      </df-messenger>
      <style>
      df-messenger {
        z-index: 999;
        position: fixed;
        bottom: 16px;
        right: 16px;
       
        border-radius: 50px; /* Bordes redondeados */
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Sombra suave para profundidad */
        background-color: #ffffff; /* Fondo blanco para el chatbot */
        --df-messenger-font-color: #333333; /* Color del texto */
        --df-messenger-font-family: 'Roboto', sans-serif; /* Fuente del chatbot */
        --df-messenger-chat-background: #f9f9f9; /* Fondo del área de chat */
        --df-messenger-message-user-background: #e1f5fe; /* Fondo de mensajes del usuario */
        --df-messenger-message-bot-background: #ffffff; /* Fondo de mensajes del bot */
        border: 2px solid #007bff; /* Borde azul para destacar */
      }        
      </style>
      </div>
    `;
    // Insertar el HTML en el contenedor dinámico
    const dynamicContentContainer = document.getElementById('dynamicContentContainer');
    dynamicContentContainer.innerHTML = htmlContent;
    // Ejecutar scripts presentes en el HTML
    const scripts = dynamicContentContainer.querySelectorAll('script');
    scripts.forEach(script => {
      const scriptElement = document.createElement('script');
      scriptElement.innerHTML = script.innerHTML;
      dynamicContentContainer.appendChild(scriptElement);
    });
    // Aplicar estilos CSS presentes en el HTML
    const styles = dynamicContentContainer.querySelectorAll('style');
    styles.forEach(style => {
      const styleElement = document.createElement('style');
      styleElement.innerHTML = style.innerHTML;
      dynamicContentContainer.appendChild(styleElement);
    });
  }

  async loadPortales() {
    this.loading = true;
    await this.getPortales();
    this.updateCourseCounts();
    this.updateFrequentQuestionsCounts();
    this.portales.forEach(portal => {
      if (portal.linkMap) {
        // Extraer el enlace de Google Maps del iframe
        const mapUrlMatch = portal.linkMap.match(/src="([^"]+)"/);
        if (mapUrlMatch) {
          const mapUrl = mapUrlMatch[1];
          this.sanitizedMapUrls[portal.id] = this.sanitizer.bypassSecurityTrustHtml(`<iframe src="${mapUrl}" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`);
          this.mapUrls[portal.id] = mapUrl;
        }
      }
    });
    this.loading = false;
  }

  getPortales() {
    let path = `portales`;
    let query = [orderBy('name', 'asc')];

    return new Promise<void>((resolve) => {
      this.firebaseSvc.getCollectionData(path, query).subscribe({
        next: (res: any) => {
          this.portales = res;
          resolve();
        }
      });
    });
  }

  updateCourseCounts() {
    if (this.portales.length) {
      this.portales.forEach(portal => {
        let path = `courses`;
        let query = [
          where('idPortal', '==', portal.id), 
          where('status', '==', 'activo')];

        this.firebaseSvc.getCollectionData(path, query).subscribe({
          next: (res: any) => {
            this.portalCourseCounts[portal.id] = res.length;
            this.portalCourses[portal.id] = res;
          }
        });
      });
    }
  }

  updateFrequentQuestionsCounts() {
    if (this.portales.length) {
      this.portales.forEach(portal => {
        let path = `frequentQuestions`;
        let query = [where('idPortal', '==', portal.id)];

        this.firebaseSvc.getCollectionData(path, query).subscribe({
          next: (res: any) => {
            this.portalFrequentQuestionsCounts[portal.id] = res.length;
            this.portalFrequentQuestions[portal.id] = res;
          }
        });
      });
    }
  }

  getCoursesByPortal(portalId: string) {
    // Filtrar cursos por portal
    return this.portalCourses[portalId] || [];
  }

  getFrequentQuestionsByPortal(portalId: string) {
    // Filtrar preguntas frecuentes por portal
    return this.portalFrequentQuestions[portalId] || [];
  }

  async openCoursesModal(portal: any) {
    const modal = await this.utilsSvs.presentModal({
      component: CoursesModalComponent,
      cssClass: 'add-update-modal',
      componentProps: { 
        portalId: portal.id,
        portalName: portal.name,
        courses: this.getCoursesByPortal(portal.id) // Asegúrate de pasar los cursos
      }
    });
    return await modal.present();
  }

  async openportalFrequentQuestionsModal(portal: any) {
    const modal = await this.utilsSvs.presentModal({
      component: FrequentquestionsModalComponent,
      cssClass: 'add-update-modal',
      componentProps: { 
        portalId: portal.id,
        portalName: portal.name,
        frequentquestions: this.getFrequentQuestionsByPortal(portal.id) // Asegúrate de pasar los cursos
      }
    });
    return await modal.present();
  }

  // En tu componente
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


}
