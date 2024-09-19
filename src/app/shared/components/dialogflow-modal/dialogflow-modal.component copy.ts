import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-dialogflow-modal',
  templateUrl: './dialogflow-modal.component.html',
  styleUrls: ['./dialogflow-modal.component.scss'],
})
export class DialogflowModalComponent implements OnInit {

  private sanitizer = inject(DomSanitizer);
  utilsSvs = inject(UtilsService);
  private cdr = inject(ChangeDetectorRef); // Inyectar ChangeDetectorRef

  recognition: any;
  isRecording = false;
  isSupported = true;
  isRecognizing: boolean = false;
  currentTranscript: string = ''; // Variable para almacenar el texto en tiempo real
  finalTranscript: string = '';   // Variable para almacenar el texto final

  constructor() { }

  ngOnInit() {
    this.setupVoiceRecognition();
    const htmlContent = `
      <div>

        <link rel="stylesheet" href="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css">
        <script src="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js"></script>


        <df-messenger
        project-id="portalbotcb"
        allow="microphone;"
        agent-id="f761968c-5cfc-4b45-9b4b-aeba5d86724b"
        language-code="es"
        max-query-length="-1">
        <df-messenger-chat
        chat-title="PortalBot CB">
        </df-messenger-chat>
        </df-messenger>
        <style>
        df-messenger {
          z-index: 999;
          position: fixed;
          --df-messenger-font-color: #000;
          --df-messenger-font-family: Google Sans;
          --df-messenger-chat-background: #f3f6fc;
          --df-messenger-message-user-background: #d3e3fd;
          --df-messenger-message-bot-background: #fff;
          bottom: 0;
          right: 0;
          top: 0;
          width: 100%;
        }
        </style>

        <script>
        // Esperar a que el df-messenger esté completamente cargado
        window.addEventListener('df-messenger-loaded', () => {
        console.log('Dialogflow Messenger cargado y listo.');
        });

        window.addEventListener('df-response-received', (event) => {
        console.log('Respuesta del chatbot:', event.detail.data.messages);

        event.detail.data.messages = event.detail.data.messages.filter(message => {
        if (message.type === 'text' && message.text) {
            const text = message.text;
            console.log('Texto del mensaje:', text);

            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);

                // Configurar eventos para depuración
                utterance.onstart = () => console.log('Comenzando a reproducir');
                utterance.onend = () => console.log('Reproducción completada');
                utterance.onerror = (e) => console.error('Error en la reproducción:', e);

                // Reproducir el mensaje
                window.speechSynthesis.speak(utterance);
            } else {
                console.log('La API de Text-to-Speech no está soportada en este navegador.');
            }
        }
        return message.type !== 'prueba';
        });
        });


        </script>


        <script id="customScript">
        Variable global para almacenar el mensaje
        let messageToSend = '';

        // Definir una función para actualizar el mensaje y enviar la solicitud
        function updateMessageAndSend(message) {
          const dfMessenger = document.querySelector('df-messenger');
          messageToSend = message;
          if (dfMessenger) {
            dfMessenger.renderCustomText(messageToSend, false);
            dfMessenger.sendRequest('query', messageToSend);
          }
        }

        // Función para manejar el evento personalizado
        function handleCustomEvent(event) {
          if (event.detail && event.detail.message) {
            updateMessageAndSend(event.detail.message);
          }
        }

        // Escuchar el evento personalizado
        document.addEventListener('customEvent', handleCustomEvent);
        </>


        <script>
        // Selecciona todas las etiquetas <p> en el documento
        const paragraphs = document.querySelectorAll('p');

        // Añade un manejador de eventos de mouseover a cada párrafo
        paragraphs.forEach(paragraph => {
        paragraph.addEventListener('mouseover', function() {
        console.log(this.textContent); // Muestra el contenido del párrafo en la consola
        });
        });
        </script>



      </div>
    `;
    // Insertar el HTML en el contenedor dinámico
    const dynamicContentContainer = document.getElementById('dynamicContentContainer');
    if (dynamicContentContainer) {
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
  }

  dismiss() {
    this.utilsSvs.dismissModal({success: true});
  }

  startVoiceRecognition(): void {
    this.isRecording = true;
    this.recognition.start();
    this.currentTranscript = '';
    this.updateVoiceButtonState('normal'); // Cambia el estado del botón a normal

    console.log('Iniciando grabación...');
  }

  stopVoiceRecognition(): void {
    if (this.isRecording) {
      this.isRecording = false;
      this.recognition.stop();
      this.currentTranscript = '';
      this.processVoiceCommand(this.finalTranscript);
      this.finalTranscript = '';
      this.updateVoiceButtonState('normal'); // Cambia el estado del botón a normal después de detener la grabación
      this.cdr.detectChanges();
      console.log('Deteniendo grabación...', this.currentTranscript);
    }
  }

  toggleVoiceRecognition(): void {
    if (this.isRecording) {
      this.stopVoiceRecognition();
    } else {
      this.startVoiceRecognition();
    }
  }

  cancelVoiceRecognition(): void {
    if (this.isRecording) {
      this.isRecording = false;
      this.recognition.stop();
      this.currentTranscript = '';
      this.finalTranscript = ''; // Cancelar el texto final
      this.updateVoiceButtonState('cancelled'); // Cambia el estado del botón a cancelado
      this.cdr.detectChanges();
      console.log('Grabación cancelada.');
    }
  }

  setupVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = true; // Mantener el reconocimiento continuo
      this.recognition.interimResults = true; // Habilitar resultados interinos
      this.recognition.lang = 'es-ES';

      this.recognition.onstart = () => {
        console.log('Listening...');
        this.isRecognizing = true; // Actualiza el estado
      };

      this.recognition.onresult = (event: any) => {
        let text = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {

          const result = event.results[i];
          if (result.isFinal) {
            this.finalTranscript += result[0].transcript; // Actualiza finalTranscript con el texto final
            this.currentTranscript = this.finalTranscript
          } else {
            text += result[0].transcript; // Acumula el texto interino
          }
        }

        if(! this.finalTranscript){
          this.currentTranscript = text
        }



        // Forzar la detección de cambios
        this.cdr.detectChanges();

        //this.processVoiceCommand(this.currentTranscript);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Error occurred:', event.error);
      };

      this.recognition.onend = () => {
        console.log('Click the button to start voice search');
        this.isRecognizing = false; // Actualiza el estado
        this.updateVoiceButtonState('normal'); // Asegura que el botón esté en estado normal cuando termine
      };
    } else {
      this.isSupported = false
      console.log('Speech recognition is not supported in this browser.');
    }
  }

  processVoiceCommand(command: string): void {
    if(this.finalTranscript){
      console.log('Processing voice command:', command);

      // Emitir el evento personalizado con el mensaje
      const event = new CustomEvent('customEvent', {
        detail: {
          message: command
        }
      });
      document.dispatchEvent(event);
    }
  }

  updateVoiceButtonState(state: 'normal' | 'cancelled') {

  }





}


/***
<div class="sp-container">
        <button class="sp-button" id="playPauseButton">
            <span id="playIcon">▶️</span>
            <span id="pauseIcon" style="display:none;">⏸️</span>
        </button>
    </div>

    <style>
    .sp-button {
        font-size: 18px;
        padding: 1px;
        margin: 0px;
        border: none;
        cursor: pointer;
        border-radius: 5px;
        transition: background-color 0.3s;
    }

    .sp-button:hover {
        background-color: rgba(12, 15, 207, 0.1);
    }

    .sp-container {
        position: fixed;
        top: 30px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        display: flex;
        justify-content: center;
    }
    </style>
*/
