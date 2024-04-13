import { Component } from '@angular/core';
import { DataService } from './data.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
  ticker = "";
  isTickerPresent = false;
  selectedItem = "search"

  constructor(private dataService: DataService, private router: Router, private route: ActivatedRoute) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.selectedItem = event.urlAfterRedirects.split('/')[1];
    });
   }

  checkTicker(): boolean {
    return this.isTickerPresent = this.ticker !== "";
  }

  isSearchRoute() {
    const root = this.router.url.split('/')[1];
    return root === 'search';
  }

  saveTickerValue(): void {
    const ticker = this.dataService.getTicker();
    let tickerValue = ticker[ticker.length - 1];
    if (tickerValue !== "" && tickerValue !== undefined && tickerValue !== null) {
      this.ticker = tickerValue;
      this.isTickerPresent = true;
    } else {
      this.ticker = "";
      this.isTickerPresent = false;
    }
  }
}
