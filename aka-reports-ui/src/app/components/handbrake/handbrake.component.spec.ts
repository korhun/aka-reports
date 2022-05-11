import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandbrakeComponent } from './handbrake.component';

describe('HandbrakeComponent', () => {
  let component: HandbrakeComponent;
  let fixture: ComponentFixture<HandbrakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandbrakeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HandbrakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
