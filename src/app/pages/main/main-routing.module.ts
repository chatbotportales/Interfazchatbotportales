import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';

const routes: Routes = [
  {
    path: '',
    component: MainPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
      },
      {
        path: 'course',
        loadChildren: () => import('./course/course.module').then( m => m.CoursePageModule)
      },
      {
        path: 'frequent-questions',
        loadChildren: () => import('./frequent-questions/frequent-questions.module').then( m => m.FrequentQuestionsPageModule)
      },
      {
        path: 'chatbot',
        loadChildren: () => import('./chatbot/chatbot.module').then( m => m.ChatbotPageModule)
      },
    ]
  },
  {
    path: 'chatbot',
    loadChildren: () => import('./chatbot/chatbot.module').then( m => m.ChatbotPageModule)
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
