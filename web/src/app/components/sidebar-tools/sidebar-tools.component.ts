import { Component, OnInit } from '@angular/core';
import { style, animate, transition, trigger } from '@angular/animations';
// import '@static/js/plugins/fab/fab.min.js';

@Component({
  selector: 'app-sidebar-tools',
  templateUrl: './sidebar-tools.component.html',
  styleUrls: ['./sidebar-tools.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(500, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SidebarToolsComponent implements OnInit {

  clickedToolButton = true;

  constructor() { }

  ngOnInit() {
  }

  clickedTool() {
    this.clickedToolButton = !!!this.clickedToolButton;
  }

  get _isHidden() {
    return {
      'v-hidden': this.clickedToolButton === false,
    };
  }

  get _getIcon() {
    return {
      'fa-chevron-left': this.clickedToolButton === true,
      'fa-chevron-right': this.clickedToolButton === false,
    };
  }

}
