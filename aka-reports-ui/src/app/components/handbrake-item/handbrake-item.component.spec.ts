import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandbrakeItemComponent } from './handbrake-item.component';

describe('HandbrakeItemComponent', () => {
  let component: HandbrakeItemComponent;
  let fixture: ComponentFixture<HandbrakeItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandbrakeItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HandbrakeItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
