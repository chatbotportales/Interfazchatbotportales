import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FrequentquestionsModalComponent } from './frequentquestions-modal.component';

describe('FrequentquestionsModalComponent', () => {
  let component: FrequentquestionsModalComponent;
  let fixture: ComponentFixture<FrequentquestionsModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FrequentquestionsModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FrequentquestionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
