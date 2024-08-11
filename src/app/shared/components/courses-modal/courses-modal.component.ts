import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Course } from 'src/app/models/course.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-courses-modal',
  templateUrl: './courses-modal.component.html',
  styleUrls: ['./courses-modal.component.scss'],
})

export class CoursesModalComponent  implements OnInit {
  @Input() portalId: string;
  @Input() portalName: string;
  @Input() courses: Course[] = [];

  firebaseSvc = inject(FirebaseService);
  utilsSvs = inject(UtilsService);

  ngOnInit() {
    this.loadCourses();
  }

  async loadCourses() {
    // this.courses = await this.firebaseSvc.getCoursesByPortal(this.portalId);
  }

  dismiss() {
    this.utilsSvs.dismissModal({success: true});
  }
}
