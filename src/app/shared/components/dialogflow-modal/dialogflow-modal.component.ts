import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Component, Input, OnInit, inject } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-dialogflow-modal',
  templateUrl: './dialogflow-modal.component.html',
  styleUrls: ['./dialogflow-modal.component.scss'],
})
export class DialogflowModalComponent  implements OnInit {

  private sanitizer = inject(DomSanitizer);
  utilsSvs = inject(UtilsService);

  constructor() { }

  ngOnInit() {
    const htmlContent = `
      <div>

      <link rel="stylesheet" href="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css">
      <script src="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js"></script>
      <df-messenger
        project-id="portalbotcb"
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

  dismiss() {
    this.utilsSvs.dismissModal({success: true});
  }

}
