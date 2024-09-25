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

  private getHtmlContent(): string {
    return `
    <div>
      <link rel="stylesheet" href="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css">
      <script src="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js"></script>

      <df-messenger

        project-id="portalbotcb"
        agent-id="f761968c-5cfc-4b45-9b4b-aeba5d86724b"
        language-code="es"
        max-query-length="-1">
        <df-messenger-chat
        chat-title="🤖 PortalBot CB"
        chat-title-icon=""
        >
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
        --df-messenger-send-icon-offset-x: 50px;
        bottom: 0;
        right: 0;
        top: 0;
        width: 100%;

      }

      </style>

      <div class="sp-container" id="speechControls">
          <button class="sp-button" id="playPauseButton">
              <span id="playIcon">▶️</span>
              <span id="pauseIcon" style="display:none;">⏸️</span>
          </button>
          <button class="sp-button" id="muteButton">
              <span id="muteIcon" style="display:none;">🔇</span>
              <span id="unmuteIcon">🔊</span>
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
          top: 46px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          display: flex;
          justify-content: center;
        }
      </style>

      <script>
          // Comprobar si la API de SpeechSynthesis está soportada
          if (!('speechSynthesis' in window)) {
              // Si no está soportada, ocultar el contenedor de botones
              document.getElementById('speechControls').style.display = 'none';
          }
      </script>

      <script>
        // Definición de la variable global
        if (typeof dfMessenger === 'undefined') {
          let dfMessenger;
        }

        if (typeof lastSpeechText === 'undefined') {
          let lastSpeechText = ''; // Variable para guardar el último texto convertido a audio


      // Esperar a que el df-messenger esté completamente cargado
      window.addEventListener('df-messenger-loaded', () => {
        dfMessenger = document.querySelector('df-messenger');
        console.log('Dialogflow Messenger cargado y listo.');
      });

      window.addEventListener('df-response-received', (event) => {
        console.log('Respuesta del chatbot:', event.detail.data.messages);

        event.detail.data.messages = event.detail.data.messages.filter(message => {
        if (message.type === 'text' && message.text) {
            const text = message.text;
            lastSpeechText = message.text;
            localStorage.setItem('lastSpeechText', lastSpeechText);
            console.log('Texto del mensaje:', text);

            if ('speechSynthesis' in window && mutespeech) {
                const utterance = new SpeechSynthesisUtterance(text);

                // Cambiar el icono a pausa
                document.getElementById('playIcon').style.display = 'none';
                document.getElementById('pauseIcon').style.display = 'inline';
                isPlaying = true;

                // Configurar eventos para depuración
                utterance.onstart = () => console.log('Comenzando a reproducir');
                utterance.onend = () => {
                    console.log('Reproducción completada');
                    // Cambiar el icono de vuelta a play
                    document.getElementById('playIcon').style.display = 'inline';
                    document.getElementById('pauseIcon').style.display = 'none';
                    isPlaying = false;
                };
                utterance.onerror = (e) => {
                    console.error('Error en la reproducción:', e);
                    // Asegurarse de que el icono vuelva a play en caso de error
                    document.getElementById('playIcon').style.display = 'inline';
                    document.getElementById('pauseIcon').style.display = 'none';
                    isPlaying = false;
                };

                // Reproducir el mensaje
                window.speechSynthesis.speak(utterance);
            } else {
                console.log('Mute habilitado o La API de Text-to-Speech no está soportada en este navegador.');
            }
        }
        return message.type !== 'prueba';
        });
        });

      }
      </script>

      <script>
          if (typeof isPlaying === 'undefined') {
              var isPlaying = false; // Para rastrear el estado de reproducción
          }

          if (typeof mutespeech === 'undefined') {
              var mutespeech = true; // Para rastrear el estado de mute

          }
          document.getElementById('playPauseButton').addEventListener('click', () => {
              if (lastSpeechText && mutespeech) {
                  if (!isPlaying) {

                    if ('speechSynthesis' in window) {
                      const utterance = new SpeechSynthesisUtterance(lastSpeechText);

                      // Cambiar el icono a pausa
                      document.getElementById('playIcon').style.display = 'none';
                      document.getElementById('pauseIcon').style.display = 'inline';
                      isPlaying = true;

                      // Configurar eventos para depuración
                      utterance.onstart = () => {
                          console.log('Comenzando a reproducir');
                      };
                      utterance.onend = () => {
                          console.log('Reproducción completada');
                          // Cambiar el icono de vuelta a play
                          document.getElementById('playIcon').style.display = 'inline';
                          document.getElementById('pauseIcon').style.display = 'none';
                          isPlaying = false;
                      };
                      utterance.onerror = (e) => {
                          console.error('Error en la reproducción:', e);
                          // Asegurarse de que el icono vuelva a play en caso de error
                          document.getElementById('playIcon').style.display = 'inline';
                          document.getElementById('pauseIcon').style.display = 'none';
                          isPlaying = false;
                      };

                      // Reproducir el mensaje
                      window.speechSynthesis.speak(utterance);
                    } else {
                        console.log('La API de Text-to-Speech no está soportada en este navegador.');
                    }

                  } else {
                    isPlaying = false;
                    document.getElementById('playIcon').style.display = 'inline';
                    document.getElementById('pauseIcon').style.display = 'none';
                    window.speechSynthesis.cancel();
                    console.log('Reproducción pausada', lastSpeechText);
                  }

              }
          });


      </script>

      <script>

        // Cargar estado de Local Storage
        window.addEventListener('df-messenger-loaded', () => {
            const savedlastSpeechText = localStorage.getItem('lastSpeechText');
            if (savedlastSpeechText !== null){
              lastSpeechText = savedlastSpeechText;
            }
            const savedMuteState = localStorage.getItem('mutespeech');
            const savedPlayingState = localStorage.getItem('isPlaying');
            console.log("------mute", savedMuteState)

            if (savedMuteState !== null) {
                mutespeech = savedMuteState === 'true'; // Convertir a boolean
                document.getElementById('muteIcon').style.display = mutespeech ? 'none' : 'inline';
                document.getElementById('unmuteIcon').style.display = mutespeech ? 'inline' : 'none';
                document.getElementById('playPauseButton').style.display = mutespeech ? 'inline' : 'none' ;
            }

            if (savedPlayingState !== null) {
                isPlaying = savedPlayingState === 'true'; // Convertir a boolean
                if (isPlaying) {
                    document.getElementById('playIcon').style.display = 'none';
                    document.getElementById('pauseIcon').style.display = 'inline';
                }
            }
        });

      </script>


      <script>

        document.getElementById('muteButton').addEventListener('click', () => {
          mutespeech = !mutespeech; // Cambiar el estado de mute
          document.getElementById('muteIcon').style.display = mutespeech ? 'none' : 'inline';
          document.getElementById('unmuteIcon').style.display = mutespeech ? 'inline' : 'none';
          console.log('Mute está ahora:', mutespeech ? 'Activado' : 'Desactivado');

          document.getElementById('playPauseButton').style.display = mutespeech ? 'inline' : 'none';
          localStorage.setItem('mutespeech', mutespeech);
          console.log("------ca", mutespeech)
          if (isPlaying) {
              isPlaying = false;
              document.getElementById('playIcon').style.display = 'inline';
              document.getElementById('pauseIcon').style.display = 'none';

              window.speechSynthesis.cancel();
          }
      });


      </script>

      <script id="customScript">

      if (typeof scriptcreado === 'undefined') {
        var scriptcreado = true;


      function updateMessageAndSend(message) {
        if (message) {
          dfMessenger.renderCustomText(message, false);
          dfMessenger.sendRequest('query', message);
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
    }
    </script>

    </div>
      `;
  }

  private executeScriptsAndStyles(container: HTMLElement): void {
      const scripts = container.querySelectorAll('script');
      scripts.forEach(script => {
          const scriptElement = document.createElement('script');
          scriptElement.innerHTML = script.innerHTML;
          container.appendChild(scriptElement);
      });

      const styles = container.querySelectorAll('style');
      styles.forEach(style => {
          const styleElement = document.createElement('style');
          styleElement.innerHTML = style.innerHTML;
          container.appendChild(styleElement);
      });
  }

  ngOnInit() {
    this.setupVoiceRecognition();

    // Comprobar si el contenido ya fue insertado
    const dynamicContentContainer = document.getElementById('dynamicContentContainer');
    if (dynamicContentContainer && !dynamicContentContainer.classList.contains('content-inserted')) {
        dynamicContentContainer.classList.add('content-inserted'); // Añadir clase para indicar que se insertó contenido
        dynamicContentContainer.innerHTML = this.getHtmlContent(); // Usar una función para obtener el HTML

        // Ejecutar scripts y estilos presentes en el HTML
        this.executeScriptsAndStyles(dynamicContentContainer);
    }

  }

  dismiss() {
    document.getElementById('playIcon').style.display = 'inline';
    document.getElementById('pauseIcon').style.display = 'none';
    window.speechSynthesis.cancel();
    this.utilsSvs.dismissModal({success: true});
  }

  startVoiceRecognition(): void {
    this.isRecording = true;
    this.recognition.start();
    this.currentTranscript = '';
    console.log('Iniciando grabación...');
  }

  stopVoiceRecognition(): void {
    if (this.isRecording) {
      this.isRecording = false;
      this.recognition.stop();
      this.currentTranscript = '';
      this.processVoiceCommand(this.finalTranscript);
      this.finalTranscript = '';
      console.log('Deteniendo grabación...', this.currentTranscript);
      this.cdr.detectChanges();
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
        this.currentTranscript = '';
        this.finalTranscript = '';
        this.isRecognizing = true; // Actualiza el estado
      };

      this.recognition.onresult = (event: any) => {

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            this.finalTranscript += result[0].transcript; // Actualiza finalTranscript con el texto final
            this.currentTranscript = this.finalTranscript
          } else {
            this.currentTranscript = result[0].transcript; // Acumula el texto interino
          }
        }

        this.cdr.detectChanges();

        //this.processVoiceCommand(this.currentTranscript);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Error occurred:', event.error);
        this.currentTranscript = '';
        this.finalTranscript = '';
      };

      this.recognition.onend = () => {
        console.log('Click the button to start voice search');
        this.isRecognizing = false; // Actualiza el estado

      };
    } else {
      this.isSupported = false
      console.log('Speech recognition is not supported in this browser.');
    }
  }

  processVoiceCommand(command: string): void {
    if(command) {
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

}

