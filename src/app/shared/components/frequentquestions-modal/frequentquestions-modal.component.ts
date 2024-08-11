import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FrequentQuestion } from 'src/app/models/frequentQuestion.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-frequentquestions-modal',
  templateUrl: './frequentquestions-modal.component.html',
  styleUrls: ['./frequentquestions-modal.component.scss'],
})
export class FrequentquestionsModalComponent  implements OnInit {
  @Input() portalId: string;
  @Input() portalName: string;
  @Input() frequentquestions: FrequentQuestion[] = [];

  firebaseSvc = inject(FirebaseService);
  utilsSvs = inject(UtilsService);

  ngOnInit() {
  }

  dismiss() {
    this.utilsSvs.dismissModal({success: true});
  }

  openLink(url: string) {
    window.open(url, '_blank');
  }
  
}
