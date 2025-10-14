import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit, OnDestroy {
  dots = '';
  private intervalId?: any;

  ngOnInit(): void {
    let count = 0;
    this.intervalId = setInterval(() => {
      count = (count + 1) % 4; // 0..3
      this.dots = '.'.repeat(count);
    }, 400);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}