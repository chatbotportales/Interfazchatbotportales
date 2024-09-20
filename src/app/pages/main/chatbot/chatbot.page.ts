import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { CoursesModalComponent } from 'src/app/shared/components/courses-modal/courses-modal.component';
import { UtilsService } from 'src/app/services/utils.service';
import { NavController } from '@ionic/angular';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FrequentquestionsModalComponent } from 'src/app/shared/components/frequentquestions-modal/frequentquestions-modal.component';
import { PortalinfomodalComponent } from 'src/app/shared/components/portalinfomodal/portalinfomodal.component';
import { DialogflowModalComponent } from 'src/app/shared/components/dialogflow-modal/dialogflow-modal.component';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.page.html',
  styleUrls: ['./chatbot.page.scss'],
})
export class ChatbotPage implements OnInit {
  portalCourses: any[] = [];
  portalFrequentQuestions: any[] = [];
  portales: any[] = [];

  isRecording = false;
  isSupported = true;

  portalCourseCounts: { [key: string]: number } = {};
  portalFrequentQuestionsCounts: { [key: string]: number } = {};

  loading: boolean = false;
  idUser = ""

  firebaseSvc = inject(FirebaseService);
  utilsSvs = inject(UtilsService);
  sanitizedMapUrls: { [key: string]: SafeHtml } = {};
  mapUrls: { [key: string]: string } = {};
  private sanitizer = inject(DomSanitizer);

  lastFoundPortal: any = null;

  recognition: any;
  isRecognizing: boolean = false; // Agregado para controlar el estado

  expandedPortalId: string | null = null; // Variable para controlar el estado expandido
  selectedPortalId: string | null = null; // Variable para controlar el estado de selección

  constructor(private navCtrl: NavController, private router: Router, private cdr: ChangeDetectorRef) {}

  startVoiceRecognition(): void {
    this.isRecording = true;
    this.recognition.start();
    // Inicia la grabación de voz aquí
    console.log('Iniciando grabación...');
  }

  stopVoiceRecognition(): void {
    if (this.isRecording) {
      this.isRecording = false;
      this.recognition.stop();
      // Detiene la grabación de voz aquí
      console.log('Deteniendo grabación...');
    }
  }

  ngOnInit() {
    this.loadPortales();
    this.setupVoiceRecognition();  }

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
      cssClass: 'add-update-modal2',
      componentProps: {
        portalId: portal.id,
        portalName: portal.name,
        courses: this.getCoursesByPortal(portal.id) // Asegúrate de pasar los cursos
      }
    });
    //return await modal.present();
  }

  async openChatbotModal() {
    const modal = await this.utilsSvs.presentModal({
      component: DialogflowModalComponent,
      cssClass: 'add-update-modal',
      componentProps: {

      }
    });

    // Escuchar el evento de cierre del modal
    document.getElementById('playIcon').style.display = 'inline';
    document.getElementById('pauseIcon').style.display = 'none';
    window.speechSynthesis.cancel();
    //return await modal.present();
  }

  async openPortalModal() {
    const modal = await this.utilsSvs.presentModal({
      component: PortalinfomodalComponent,
      cssClass: 'add-update-modal',
      componentProps: {
        portal: this.lastFoundPortal,
        frequentquestions: this.getFrequentQuestionsByPortal(this.lastFoundPortal.id),
        courses: this.getCoursesByPortal(this.lastFoundPortal.id) // Asegúrate de pasar los cursos
      }
    });
    //return await modal.present();
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
    //return await modal.present();
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

  setupVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'es-ES';

      this.recognition.onstart = () => {
        console.log('Listening...');
        this.isRecognizing = true; // Actualiza el estado
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('You said:', transcript);

        this.processVoiceCommand(transcript);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Error occurred:', event.error);
      };

      this.recognition.onend = () => {
        console.log('Click the button to start voice search');
        this.isRecognizing = false; // Actualiza el estado
      };
    } else {
      this.isSupported = false;
      console.log('Speech recognition is not supported in this browser.');
    }
  }

  /*startVoiceRecognition(): void {
    if (this.recognition) {
      if (this.isRecognizing) {
        console.log('Recognition is already in progress.');
        return;
      }

      this.recognition.start();
    }
  }*/


  //-------------------
  processVoiceCommand(command: string): void {
    // Normaliza el comando a minúsculas para la comparación
    const lowerCaseCommand = command.toLowerCase().trim();

    // Extrae el nombre del portal
    const portalName = this.extractPortalName(lowerCaseCommand);

    if (lowerCaseCommand.includes('cursos')) {
      // Si se menciona "cursos", abre el modal para el portal
      this.handlePortalAction(portalName, 'cursos');
    } else if (lowerCaseCommand.includes('preguntas frecuentes')) {
      // Si se menciona "preguntas frecuentes", abre el modal para el portal
      this.handlePortalAction(portalName, 'preguntas frecuentes');
    } else if (lowerCaseCommand.includes('buscar información del portal') || lowerCaseCommand.includes('portal')) {
      // Si se menciona "buscar información del portal" o "portal", solo busca la información
      this.searchPortalInformation(portalName);
    } else {
      console.log('No se encontró ninguna acción para el comando.');
    }
  }

  // Función para manejar acciones según el comando
  handlePortalAction(portalName: string | null, action: 'cursos' | 'preguntas frecuentes'): void {
    // Usa el último portal encontrado si no se proporciona un nombre
    const portal = portalName ? this.findClosestPortal(portalName) : this.lastFoundPortal;

    if (portal) {
      this.lastFoundPortal = portal;
      this.cdr.detectChanges();

      console.log(`Portal encontrado: ${portal.name}`);
      if (action === 'cursos') {
        this.openCoursesModal(portal);
      } else if (action === 'preguntas frecuentes') {
        this.openportalFrequentQuestionsModal(portal);
      }
      // Actualiza el último portal encontrado

    } else {
      console.log('No se encontró ningún portal con un nombre similar.');
    }
  }

  // Función para encontrar el portal más cercano basado en el nombre
  findClosestPortal(portalName: string): any | null {
    if (!this.portales || this.portales.length === 0) {
      console.log('No hay portales disponibles.');
      return null;
    }

    let closestPortal = null;
    let smallestDistance = Infinity;

    this.portales.forEach(portal => {
      // Normalizar nombres para comparación
      const portalNameNormalized = portal.name.toLowerCase().trim();
      const distance = this.getLevenshteinDistance(portalNameNormalized, portalName.toLowerCase());

      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestPortal = portal;
      }
    });

    return closestPortal;
  }

  // Función para extraer el nombre del portal del comando
  extractPortalName(command: string): string | null {
    // Lista de frases comunes que no son parte del nombre del portal
    const phrasesToRemove = [
      'buscar información del portal',
      'portal',
      'cursos',
      'preguntas frecuentes',
      'el',
      'la',
      'un',
      'una'
    ];

    let extractedName = command;
    phrasesToRemove.forEach(phrase => {
      // Reemplaza las frases comunes
      extractedName = extractedName.replace(new RegExp(phrase, 'g'), '').trim();
    });

    // Limpia espacios adicionales
    extractedName = extractedName.replace(/\s\s+/g, ' ');

    return extractedName || null;
  }

  // Implementación del algoritmo de Levenshtein (simplificado)
  getLevenshteinDistance(a: string, b: string): number {
    const aLength = a.length;
    const bLength = b.length;
    const matrix = Array.from({ length: aLength + 1 }, (_, i) => Array(bLength + 1).fill(i));

    for (let j = 1; j <= bLength; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= aLength; i++) {
      for (let j = 1; j <= bLength; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // Deletion
          matrix[i][j - 1] + 1, // Insertion
          matrix[i - 1][j - 1] + cost // Substitution
        );
      }
    }

    return matrix[aLength][bLength];
  }
  //----------------------



  // La función de búsqueda ya no necesita cambios
  searchPortalInformation(portalName: string): void {
    if (!this.portales || this.portales.length === 0) {
      console.log('No hay portales disponibles.');
      return;
    }

    let closestPortal = null;
    let smallestDistance = Infinity;

    this.portales.forEach(portal => {
      const distance = this.getLevenshteinDistance(portal.name.toLowerCase(), portalName.toLowerCase());
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestPortal = portal;
      }
    });

    if (closestPortal) {

      console.log('Portal encontrado..:', closestPortal);
      this.openPortalAccordion(closestPortal.id);
      this.lastFoundPortal = closestPortal;
      this.cdr.detectChanges();
      this.selectedPortalId = closestPortal.id; // Marca el portal como seleccionado

      this.openPortalModal();
    } else {
      console.log('No se encontró ningún portal con un nombre similar.');
    }
  }


  openPortalAccordion(portalId: string): void {
    // Encuentra el acordeón correspondiente en el DOM
    const accordionElement = document.getElementById(`${portalId}`);
    //const nativeEl = this.accordionGroup;
    //nativeEl.value = portalId;
    console.log(`holaaaaaaaaaaaaaaaaaaaaaaaaaaaa ${portalId}.`);
    if (accordionElement) {
      // Abre el acordeón utilizando el atributo 'expanded'
      const ionAccordion = accordionElement as HTMLIonAccordionElement;
      ionAccordion['expanded'] = true; // Abre el acordeón
    } else {
      console.log(`No se encontró el acordeón para el portal ID ${portalId}.`);
    }
  }

  async openCoursesModalForPortal() {
    const portal = this.portales.find(p => p.id === this.selectedPortalId);
    if (portal) {
      await this.openCoursesModal(portal);
    } else {
      console.log('No se encontró el portal seleccionado.');
    }
  }

  async openFrequentQuestionsModalForPortal() {
    const portal = this.portales.find(p => p.id === this.selectedPortalId);
    if (portal) {
      await this.openportalFrequentQuestionsModal(portal);
    } else {
      console.log('No se encontró el portal seleccionado.');
    }
  }



}
