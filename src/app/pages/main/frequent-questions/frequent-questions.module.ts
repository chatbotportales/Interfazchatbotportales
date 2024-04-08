import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FrequentQuestionsPageRoutingModule } from './frequent-questions-routing.module';

import { FrequentQuestionsPage } from './frequent-questions.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FrequentQuestionsPageRoutingModule,
    SharedModule,
  ],
  declarations: [FrequentQuestionsPage]
})
export class FrequentQuestionsPageModule {}
