import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddUpdateFrequentQuestionComponent } from './add-update-frequent-question.component';

describe('AddUpdateFrequentQuestionComponent', () => {
  let component: AddUpdateFrequentQuestionComponent;
  let fixture: ComponentFixture<AddUpdateFrequentQuestionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateFrequentQuestionComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddUpdateFrequentQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
