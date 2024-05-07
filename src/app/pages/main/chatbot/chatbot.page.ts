import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.page.html',
  styleUrls: ['./chatbot.page.scss'],
})
export class ChatbotPage implements OnInit {

  constructor(private navCtrl: NavController, private router: Router) {}

  ngOnInit() {
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
          --df-messenger-font-color: #000000;
          --df-messenger-font-family: Roboto;
          --df-messenger-chat-background: #f3f6fc;
          --df-messenger-message-user-background: #d3e3fd;
          --df-messenger-message-bot-background: #fff;
          bottom: 16px;
          right: 16px;
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


  

}
