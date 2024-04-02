import { Component } from '@angular/core';
import { HomeService } from '../../home/home.service';
import { Watchlist } from '../../../models/watchlist';
import { is } from '@babel/types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.css'
})
export class WatchlistComponent {

  constructor(
    private stockService: HomeService,
    private router: Router
  ) { }

  watchlist: Watchlist[] = [];
  isLoading = true;

  ngOnInit() {
    this.checkWatchlist();
  }

  checkWatchlist() {
    this.stockService.getWatchlistData().subscribe((data) => {
      console.log(data);
      this.watchlist = data;
      this.watchlist.forEach((item) => {
        this.stockService.getQuoteDetailsWP(item.ticker).subscribe((quote) => {
          item.c = quote.c;
          item.d = quote.d;
          item.dp = quote.dp;
        });
      });
    });
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  delete(ticker: string) {
    this.stockService.deleteFromWatchlist(ticker).subscribe(() => {
      this.checkWatchlist();
    });
  }

  goToDetails(ticker: string) {
    this.router.navigate(['/search/' + ticker]);
  }

}
