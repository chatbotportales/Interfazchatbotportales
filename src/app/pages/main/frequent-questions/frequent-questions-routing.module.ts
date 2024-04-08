import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FrequentQuestionsPage } from './frequent-questions.page';

const routes: Routes = [
  {
    path: '',
    component: FrequentQuestionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FrequentQuestionsPageRoutingModule {}
