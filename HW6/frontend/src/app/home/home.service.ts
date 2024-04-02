import { DataService } from './../data.service';
import { Watchlist } from './../../models/watchlist';
import { Injectable } from '@angular/core';
import { CompanyProfile } from '../../models/company-profile';
import { QuoteDetails } from '../../models/quote-details';
import { NewsDetails } from '../../models/news-details';
import { HttpClient } from '@angular/common/http';
import { AutoComplete } from '../../models/auto-complete';
import { Observable, of, switchMap, take, tap } from 'rxjs';
import { Charts } from '../../models/charts';
import { Recommendation } from '../../models/recommendation';
import { Sentiment } from '../../models/sentiment';
import { Earnings } from '../../models/earnings';
import { PortfolioStock } from '../../models/porfolio-stock';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient, private dataService: DataService) { }

  private oldTicker: string[] = [];
  // private HOST = 'http://localhost:3000/';
  private HOST = 'https://csci571stockbackend.wl.r.appspot.com/';
  private autoCompleteUrl = this.HOST + 'search';
  private profileUrl = this.HOST + 'profile';
  private quoteUrl = this.HOST + 'quote';
  private newsUrl = this.HOST + 'news';
  private peerUrl = this.HOST + 'peers';
  private dailyChartsUrl = this.HOST + 'dailyCharts';
  private chartsUrl = this.HOST + 'charts';
  private reccUrl = this.HOST + 'recommendation';
  private sentimentUrl = this.HOST + 'sentiment';
  private earningsUrl = this.HOST + 'earnings';
  private fetchUrl = this.HOST + 'fetch';
  private updateUrl = this.HOST + 'update?amount=';
  private buyUrl = this.HOST + 'updatestock?ticker=';
  private fetchStockUrl = this.HOST + 'fetchstock';
  private fetchStocksUrl = this.HOST + 'fetchstocks';
  private fetchWatchlistUrl = this.HOST + 'fetchWatchlist';
  private addWatchlistUrl = this.HOST + 'addToWatchlist?ticker=';
  private delWatchlistUrl = this.HOST + 'deleteFromWatchlist';
  private quoteWPUrl = this.HOST + 'quote';

  // get data for the autocomplete
  getAutoComplete(ticker: string): Observable<AutoComplete[]> {
    const autoCompleteUrl = `${this.autoCompleteUrl}/${ticker}`;
    return this.http.get<AutoComplete[]>(autoCompleteUrl)
  }

  // get data for the company profile
  // getCompanyProfile(ticker: string) {
  //   const profileUrl = `${this.profileUrl}/${ticker}`;
  //   return this.http.get<CompanyProfile>(profileUrl);
  // }

  getCompanyProfile(ticker: string): Observable<CompanyProfile> {
    let profileUrl = `${this.profileUrl}/${ticker}`;
    this.oldTicker = this.dataService.getTicker();
    console.log('Old Ticker: ', this.oldTicker);
    console.log('New Ticker: ', ticker);
    if (this.oldTicker.length === 0) {
      console.log('Old and New Ticker are different');
      this.dataService.setTicker(ticker);
      console.log('Fetching from server');
    return this.fetchFromServerCP(profileUrl);
    } else if (this.oldTicker[this.oldTicker.length - 1] === ticker){
      console.log('Old and New Ticker are same');
      return this.dataService.getCompanyProfile().pipe(
        take(1),
        switchMap((data) => {
          console.log(data);
          if (data && Object.keys(data).length !== 0) {
            console.log('fetched from cache: Stock Data');
            return of(data);
          } else {
            console.log('fetched from server: Stock Data');
            return this.fetchFromServerCP(profileUrl);
          }
        })
      );
    }
    console.log('Fetching from server');
    return this.fetchFromServerCP(profileUrl);
  }

  private fetchFromServerCP(profileUrl: string): Observable<CompanyProfile> {
    return this.http.get<CompanyProfile>(profileUrl).pipe(
      tap((data) => {
        console.log('Fetched from server: Stock Data');
        console.log(data);
        this.dataService.setCompanyProfile(data);
        this.dataService.setTicker(data.ticker);
      })
    );
  }

  // get data for the quote
  getQuoteDetails(ticker: string): Observable<QuoteDetails> {

    const quoteUrl = `${this.quoteUrl}/${ticker}`;

    if (this.oldTicker[this.oldTicker.length - 1] !== ticker) {
      return this.fetchFromServerQD(quoteUrl);
    }

    return this.dataService.getQuoteDetails().pipe(
      take(1),
      switchMap((data) => {
        if (data && Object.keys(data).length !== 0) {
          console.log('fetched from cache: Quote');
          return of(data);
        } else {
          return this.fetchFromServerQD(quoteUrl);
        }
      })
    );
  }

  private fetchFromServerQD(url: string): Observable<QuoteDetails> {
    return this.http.get<QuoteDetails>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Quote');
        this.dataService.setQuoteDetails(data);
      })
    );
  }


  getNewsDetails(ticker: string): Observable<NewsDetails[]> {
    const newsUrl = `${this.newsUrl}/${ticker}`;
  
    if (this.oldTicker[this.oldTicker.length - 1] !== ticker) {
      return this.fetchFromServerND(newsUrl);
    }
  
    return this.dataService.getNewsDetails().pipe(
      take(1),
      switchMap((data) => {
        if (data && data.length !== 0) {
          console.log('fetched from cache: News');
          return of(data);
        } else {
          return this.fetchFromServerND(newsUrl);
        }
      })
    );
  }
  
  private fetchFromServerND(url: string): Observable<NewsDetails[]> {
    return this.http.get<NewsDetails[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: News');
        this.dataService.setNewsDetails(data);
      })
    );
  }
  
  getPeerDetails(ticker: string): Observable<string[]> {
    const peerUrl = `${this.peerUrl}/${ticker}`;
  
    if (this.oldTicker[this.oldTicker.length - 1] !== ticker) {
      return this.fetchFromServerPD(peerUrl);
    }
  
    return this.dataService.getPeerDetails().pipe(
      take(1),
      switchMap((data) => {
        if (data && data.length !== 0) {
          console.log('fetched from cache: Peers');
          return of(data);
        } else {
          return this.fetchFromServerPD(peerUrl);
        }
      })
    );
  }
  
  private fetchFromServerPD(url: string): Observable<string[]> {
    return this.http.get<string[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Peers');
        this.dataService.setPeerDetails(data);
      })
    );
  }

  // get data for the daily charts
  getDailyCharts(ticker: string): Observable<Charts[]> {
    const dailyChartsUrl = `${this.dailyChartsUrl}/${ticker}`;

    if (this.oldTicker[this.oldTicker.length - 1] !== ticker) {
      return this.fetchFromServerDailyCharts(dailyChartsUrl);
    }

    return this.dataService.getDailyCharts().pipe(
      take(1),
      switchMap((data) => {
        if (data && data.length !== 0) {
          console.log('fetched from cache: Daily Charts');
          return of(data);
        } else {
          return this.fetchFromServerDailyCharts(dailyChartsUrl);
        }
      })
    );
  }

  private fetchFromServerDailyCharts(url: string): Observable<Charts[]> {
    return this.http.get<Charts[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Daily Charts');
        this.dataService.setDailyCharts(data);
      })
    );
  }

  getCharts(ticker: string): Observable<Charts[]> {
    const chartsUrl = `${this.chartsUrl}/${ticker}`;
    this.oldTicker = this.dataService.getTicker();
    if (this.oldTicker[this.oldTicker.length - 1] !== ticker) {
      return this.fetchFromServerCharts(chartsUrl);
    }

    return this.dataService.getCharts().pipe(
      take(1),
      switchMap((data) => {
        if (data && data.length !== 0) {
          console.log('fetched from cache: Charts');
          return of(data);
        } else {
          return this.fetchFromServerCharts(chartsUrl);
        }
      })
    );
  }

  private fetchFromServerCharts(url: string): Observable<Charts[]> {
    return this.http.get<Charts[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Charts');
        this.dataService.setCharts(data);
      })
    );
  }
  // get data for the recommendation
  getRecommendation(ticker: string): Observable<Recommendation[]> {
    const reccUrl = `${this.reccUrl}/${ticker}`;
  
    if (this.oldTicker[this.oldTicker.length - 1] !== ticker) {
      return this.fetchFromServerRec(reccUrl);
    }
  
    return this.dataService.getRecommendation().pipe(
      take(1),
      switchMap((data) => {
        if (data && data.length !== 0) {
          console.log('fetched from cache: Recommendation');
          return of(data);
        } else {
          return this.fetchFromServerRec(reccUrl);
        }
      })
    );
  }
  
  private fetchFromServerRec(url: string): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Recommendation');
        this.dataService.setRecommendation(data);
      })
    );
  }
  
  getSentiment(ticker: string): Observable<Sentiment[]> {
    const sentimentUrl = `${this.sentimentUrl}/${ticker}`;
  
    if (this.oldTicker[this.oldTicker.length - 1] !== ticker) {
      return this.fetchFromServerSen(sentimentUrl);
    }
  
    return this.dataService.getSentiment().pipe(
      take(1),
      switchMap((data) => {
        if (data && data.length !== 0) {
          console.log('fetched from cache: Sentiment');
          return of(data);
        } else {
          return this.fetchFromServerSen(sentimentUrl);
        }
      })
    );
  }
  
  private fetchFromServerSen(url: string): Observable<Sentiment[]> {
    return this.http.get<Sentiment[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Sentiment');
        this.dataService.setSentiment(data);
      })
    );
  }

  // get data for the earnings
  getEarnings(ticker: string): Observable<Earnings[]> {
    const earningsUrl = `${this.earningsUrl}/${ticker}`;

    if (!this.oldTicker.includes(ticker)) {
      return this.fetchFromServerEarnings(earningsUrl);
    }

    return this.dataService.getEarnings().pipe(
      take(1),
      switchMap((data) => {
        if (data && data.length !== 0) {
          console.log('fetched from cache: Earnings');
          return of(data);
        } else {
          return this.fetchFromServerEarnings(earningsUrl);
        }
      })
    );
  }

  private fetchFromServerEarnings(url: string): Observable<Earnings[]> {
    return this.http.get<Earnings[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Earnings');
        this.dataService.setEarnings(data);
      })
    );
  }

  // get wallet data 
  getWalletData() {
    return this.http.get(this.fetchUrl);
  }

  // update wallet data
  updateWalletData(data: number) {
    const updateUrl = this.updateUrl + data;
    return this.http.put(updateUrl, null); // Pass null as the second argument
  }

  // buy stock
  buyStock(ticker: string, quantity: number, price: number, name: string) {
    const buyUrl = this.buyUrl + ticker + '&quantity=' + quantity + '&price=' + price + '&name=' + name;
    return this.http.put(buyUrl, null); // Pass null as the second argument
  }

  //if stock purchased
  getStockData(ticker: string) {
    const fetchStockUrl = `${this.fetchStockUrl}/${ticker}`;
    return this.http.get(fetchStockUrl);
  }

  // get all stocks
  getStocksData(): Observable<PortfolioStock[]> {
    return this.http.get<PortfolioStock[]>(this.fetchStocksUrl);
  }

  // get watchlist
  getWatchlistData(): Observable<Watchlist[]> {
    return this.http.get<Watchlist[]>(this.fetchWatchlistUrl);
  }

  // add to watchlist
  addToWatchlist(ticker: string, name: string) {
    const addWatchlistUrl = this.addWatchlistUrl + ticker + '&name=' + name;
    console.log(addWatchlistUrl);
    return this.http.post(addWatchlistUrl, null); // Pass null as the second argument
  }

  // delete from watchlist
  deleteFromWatchlist(ticker: string) {
    const delWatchlistUrl = `${this.delWatchlistUrl}/${ticker}`;
    return this.http.delete(delWatchlistUrl);
  }

  // get data for the quote Watchlist and Portfolio
  getQuoteDetailsWP(ticker: string): Observable<QuoteDetails> {
    const quoteWPUrl = `${this.quoteWPUrl}/${ticker}`;
    return this.http.get<QuoteDetails>(quoteWPUrl);
  }

}
