import { NewsDetails } from './../models/news-details';
import { Injectable } from '@angular/core';
import { CompanyProfile } from '../models/company-profile';
import { QuoteDetails } from '../models/quote-details';
import { Charts } from '../models/charts';
import { Recommendation } from '../models/recommendation';
import { Sentiment } from '../models/sentiment';
import { Earnings } from '../models/earnings';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  ticker: string[] = [];
  companyProfile: CompanyProfile = {} as CompanyProfile;
  quoteDetails: QuoteDetails = {} as QuoteDetails;
  newsDetails: NewsDetails[] = [];
  peerDetails: string[] = [];
  dailyCharts: Charts[] = [];
  charts: Charts[] = [];
  recommendation: Recommendation[] = [];
  sentiment: Sentiment[] = [];
  earnings: Earnings[] = [];

  setTicker(ticker: string) {
    this.ticker.push(ticker);
  }

  getTicker(): string[] {
    return this.ticker;
  }

  clearTicker() {
    this.ticker = [];
  }

  setCompanyProfile(profile: CompanyProfile) {
    this.companyProfile = profile;
  }

  getCompanyProfile(): Observable<CompanyProfile> {
    return of(this.companyProfile);
  }

  setQuoteDetails(quote: QuoteDetails) {
    this.quoteDetails = quote;
  }

  getQuoteDetails(): Observable<QuoteDetails> {
    return of(this.quoteDetails);
  }

  setNewsDetails(news: NewsDetails[]) {
    this.newsDetails = news;
  }

  getNewsDetails(): Observable<NewsDetails[]> {
    return of(this.newsDetails);
  }

  setPeerDetails(peer: string[]) {
    this.peerDetails = peer;
  }

  getPeerDetails(): Observable<string[]> {
    return of(this.peerDetails);
  }

  setDailyCharts(charts: Charts[]) {
    this.dailyCharts = charts;
  }

  getDailyCharts(): Observable<Charts[]> {
    return of(this.dailyCharts);
  }

  setCharts(charts: Charts[]) {
    this.charts = charts;
  }

  getCharts(): Observable<Charts[]> {
    return of(this.charts);
  }

  setRecommendation(recommendation: Recommendation[]) {
    this.recommendation = recommendation;
  }

  getRecommendation(): Observable<Recommendation[]> {
    return of(this.recommendation);
  }

  setSentiment(sentiment: Sentiment[]) {
    this.sentiment = sentiment;
  }

  getSentiment(): Observable<Sentiment[]> {
    return of(this.sentiment);
  }

  setEarnings(earnings: Earnings[]) {
    this.earnings = earnings;
  }

  getEarnings(): Observable<Earnings[]> {
    return of(this.earnings);
  }

}
