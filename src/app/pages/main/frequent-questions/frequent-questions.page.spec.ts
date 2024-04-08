import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FrequentQuestionsPage } from './frequent-questions.page';

describe('FrequentQuestionsPage', () => {
  let component: FrequentQuestionsPage;
  let fixture: ComponentFixture<FrequentQuestionsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FrequentQuestionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
