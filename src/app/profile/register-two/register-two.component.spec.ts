import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterTwoComponent } from './register-two.component';

describe('RegisterTwoComponent', () => {
  let component: RegisterTwoComponent;
  let fixture: ComponentFixture<RegisterTwoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterTwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});