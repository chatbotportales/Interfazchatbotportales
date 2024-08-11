import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { LogoComponent } from './components/logo/logo.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddUpdatePortalComponent } from './components/add-update-portal/add-update-portal.component';
import { AddUpdateCourseComponent } from './components/add-update-course/add-update-course.component';
import { AddUpdateFrequentQuestionComponent } from './components/add-update-frequent-question/add-update-frequent-question.component';

import { CoursesModalComponent } from './components/courses-modal/courses-modal.component';
import { FrequentquestionsModalComponent } from './components/frequentquestions-modal/frequentquestions-modal.component';
import { PortalinfomodalComponent } from './components/portalinfomodal/portalinfomodal.component';


@NgModule({
  declarations: [
    HeaderComponent,  CustomInputComponent, LogoComponent,
    AddUpdatePortalComponent, AddUpdateCourseComponent, AddUpdateFrequentQuestionComponent, 
    CoursesModalComponent, FrequentquestionsModalComponent, PortalinfomodalComponent
  ],
  exports: [
    HeaderComponent,  CustomInputComponent, LogoComponent, ReactiveFormsModule,
    AddUpdatePortalComponent, AddUpdateCourseComponent, AddUpdateFrequentQuestionComponent, 
    CoursesModalComponent, FrequentquestionsModalComponent, PortalinfomodalComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class SharedModule { }
