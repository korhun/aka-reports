import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandbrakeDetailsComponent } from './handbrake-details.component';

describe('HandbrakeDetailsComponent', () => {
  let component: HandbrakeDetailsComponent;
  let fixture: ComponentFixture<HandbrakeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandbrakeDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HandbrakeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
