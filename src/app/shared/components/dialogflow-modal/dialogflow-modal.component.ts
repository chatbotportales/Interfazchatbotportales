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
      <iframe
          allow="microphone;"
          width="100%"
          height="600"
          intent="WELCOME"
          src="https://console.dialogflow.com/api-client/demo/embedded/53497ddd-2517-4741-ad58-53a74e440bb8">
      </iframe>
      
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
