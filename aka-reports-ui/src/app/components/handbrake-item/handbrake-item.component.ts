import { Component, Input, OnInit } from '@angular/core';
import { HandbrakeItem } from 'src/app/models/handbrake-item.model';

@Component({
  selector: 'app-handbrake-item',
  templateUrl: './handbrake-item.component.html',
  styleUrls: ['./handbrake-item.component.scss']
})
export class HandbrakeItemComponent implements OnInit {

  @Input()
  handbrakeItem!: HandbrakeItem;

  constructor() { }

  ngOnInit(): void {
  }

}
