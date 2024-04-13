import { Observable, Subject, debounceTime, finalize, interval, map, of, startWith, switchMap, takeUntil, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { AutoComplete } from '../../../models/auto-complete';
import { FormControl } from '@angular/forms';
import { HomeService } from '../../home/home.service';
import { Alert } from '../../../models/alert';
import { ActivatedRoute, Router } from '@angular/router';
import * as Highcharts from 'highcharts/highstock';
import { NewsDetails } from '../../../models/news-details';
import { QuoteDetails } from '../../../models/quote-details';
import { CompanyProfile } from '../../../models/company-profile';
import HC_sma from 'highcharts/indicators/indicators';
import HC_vbp from 'highcharts/indicators/volume-by-price';
import { SeriesOptionsType } from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import { Earnings } from '../../../models/earnings';
import { DataService } from '../../data.service';
HC_exporting(Highcharts)

HC_sma(Highcharts);
HC_vbp(Highcharts);

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  filteredCompanies!: Observable<AutoComplete[]>;
  tickerForm: FormControl = new FormControl();
  isLoading = false;
  ticker: string = "";
  noTickerError = false;
  showSearch = false;
  quantityBuy: number = 0;
  quantitySell: number = 0;
  showSearchResults = false;
  noData = false;
  active = 1;

  inWatchList = false;
  timeNow = Date.now();
  private stop$ = new Subject<void>();

  Highcharts: typeof Highcharts = Highcharts;
  dailyChartOptions: Highcharts.Options = {};
  chartOptions: Highcharts.Options = {};
  reccChartOptions: Highcharts.Options = {};
  earningsChartOptions: Highcharts.Options = {};
  updateFlag: boolean = false;
  updateFlag1: boolean = false;
  updateFlag2: boolean = false;
  updateFlag3: boolean = false;

  profile: CompanyProfile = {} as CompanyProfile;
  quote: QuoteDetails = {} as QuoteDetails;
  newsData: NewsDetails[] = [];
  peers: string[] = [];
  sentiments = {
    totalMspr: 0,
    totalChange: 0,
    positiveMspr: 0,
    negativeMspr: 0,
    positiveChange: 0,
    negativeChange: 0,
  }
  earnings: Earnings[] = [];
  walletAmount: any = [];
  fetchedStock: any = [];


  alerts: Alert[] = [];
  Date: any;
  showBuyAlert = false;
  showSellAlert = false;
  addWatchlist = false;
  removeWatchlist = false;
  buyMessage = '';
  sellMessage = '';
  addWatchlistMessage = '';
  removeWatchlistMessage = '';

  showSelfClosingBuyAlert(ticker: string) {
    this.buyMessage = `${ticker} bought successfully.`;
    this.showBuyAlert = true;
    setTimeout(() => this.showBuyAlert = false, 5000);  // close the alert after 5 seconds
  }

  showSelfClosingSellAlert(ticker: string) {
    this.sellMessage = `${ticker} sold successfully.`;
    this.showSellAlert = true;
    setTimeout(() => this.showSellAlert = false, 5000);  // close the alert after 5 seconds
  }

  showSelfClosingAddAlert(ticker: string) {
    this.buyMessage = `${ticker} added to Watchlist.`;
    this.showBuyAlert = true;
    setTimeout(() => this.showBuyAlert = false, 5000);  // close the alert after 5 seconds
  }

  showSelfClosingRemoveAlert(ticker: string) {
    this.sellMessage = `${ticker} removed from Watchlist.`;
    this.showSellAlert = true;
    setTimeout(() => this.showSellAlert = false, 5000);  // close the alert after 5 seconds
  }

  constructor(
    private stockService: HomeService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private renderer: Renderer2,
    private dataService: DataService
  ) { }

  onSubmit(formEntered: any) {
    console.log("Form entered" + formEntered);
    let ticker = this.tickerForm.value.toUpperCase();
    console.log(ticker);
    this.noData = false;
    if (ticker == null || ticker == undefined || ticker == '') {
      this.alerts.push({
        type: "danger",
        message: "Please enter a valid ticker"
      })

    } else {
      this.router.navigate(['/search/' + ticker]);
      console.log('called' + ticker);
      this.showSearchResults = true;

      // Data for the profile
      this.stockService.getCompanyProfile(ticker).subscribe((data) => {
        this.profile = data;
      });

      // Data for the quote
      this.stockService.getQuoteDetails(ticker).subscribe((data) => {
        this.timeNow = Date.now();
        this.quote = data;
        this.updateFlag = true;
        // // Data for the daily charts 
        this.stockService.getDailyCharts(ticker).subscribe((data) => {
          console.log(data);
          let chartValues = data.map((item) => [item.t, item.c]);
          this.dailyChartOptions = {
            accessibility: {
              enabled: true,
            },
            title: {
              text: ticker + ' Hourly Price Variation',
            },
            chart: {
              backgroundColor: 'rgb(248, 248, 248)',
            },
            yAxis: {
              title: {
                text: 'Stock Price',
              },
              opposite: true,
            },
            xAxis: {
              type: 'datetime',
            },
            exporting: {
              enabled: false
            },
            series: [
              {
                id: 'stock',
                name: 'Stock Price',
                data: chartValues,
                type: 'line',
                threshold: null,
                marker: {
                  enabled: false,
                },
                color: this.quote.d < 0 ? 'red' : 'green'
              },
            ],
          };
          this.updateFlag = true;
        });
        // Data for the peers
      this.stockService.getPeerDetails(ticker).subscribe((data) => {
        if (data.length > 0) {
          this.showSearchResults = false;
        } else {
          this.showSearchResults = false;
          this.noData = true;
        }
        this.peers = data.filter((peer) => !peer.includes('.'));
      })
      });

      // Data for the news
      this.stockService.getNewsDetails(ticker).subscribe((data) => {
        this.newsData = [];
        data.forEach(item => {
          if (item.image.length) {
            this.newsData.push(item);
          }
        })
        this.newsData = this.newsData.slice(0, 20);
      });

      //Data for the charts
      this.stockService.getCharts(ticker).subscribe((data) => {
        this.updateFlag1 = false;
        console.log('chart data-->' + data);
        let volume = data.map((item) => [item.t, item.v]);
        let ohlc = data.map((item) => [item.t, item.o, item.h, item.l, item.c]);
        this.chartOptions = {
          rangeSelector: {
            selected: 2,
            enabled: true,
            buttons: [{
              type: 'month',
              count: 1,
              text: '1M'
            }, {
              type: 'month',
              count: 3,
              text: '3M'
            }, {
              type: 'month',
              count: 6,
              text: '6M'
            },
            {
              type: 'ytd',
              text: 'YTD',
            },
            {
              type: 'year',
              count: 1,
              text: '1Y'
            },
            {
              type: 'all',
              text: 'All'
            }]
          },
          title: {
            text: ticker + ' Historical'
          },
          xAxis: {
            type: 'datetime',
            ordinal: true,
            lineWidth: 1,
            lineColor: 'black',
          },
          subtitle: {
            text: 'With SMA and Volume by Price technical indicators'
          },
          chart: {
            backgroundColor: 'rgb(248, 248, 248)',
          },
          yAxis: [{
            labels: {
              align: 'right',
              x: -3,
              y: -6
            },
            title: {
              text: 'OHLC'
            },
            height: '60%',
            lineWidth: 2,
            lineColor: 'black',
            resize: {
              enabled: true
            },
            opposite: true,
            startOnTick: false,
            showLastLabel: false,
          }, {
            labels: {
              align: 'right',
              x: -3,
              y: -6
            },
            title: {
              text: 'Volume'
            },
            top: '65%',
            height: '35%',
            lineColor: 'black',
            lineWidth: 2,
            offset: 0,
            opposite: true,
            tickInterval: 50000000,
            showLastLabel: false,
            tickAmount: 4,
          }],
          tooltip: {
            split: true
          },
          series: [{
            type: 'candlestick',
            id: 'aapl',
            data: ohlc,
            yAxis: 0,
          },
          {
            type: 'sma',
            id: 'sma',
            linkedTo: 'aapl',
            params: {
              period: 14
            },
            yAxis: 0,
            lineWidth: 2,
            color: '#F99E87',
            marker: {
              enabled: false,
            },
          },
          {
            type: 'column',
            name: 'Volume',
            id: 'volume',
            borderRadius: 2,
            data: volume,
            yAxis: 1,
            color: '#494ABA'
          },
          {
            type: 'vbp',
            linkedTo: 'aapl',
            params: {
              volumeSeriesID: 'volume'
            },
            dataLabels: {
              enabled: false
            },
            zoneLines: {
              enabled: false
            },
          }
          ],
          legend: {
            enabled: false
          },
          navigator: {
            enabled: true,
            series: {
              type: 'line',
              data: ohlc
            }
          },
          exporting: {
            enabled: false
          }
        }
        this.updateFlag1 = true;
      })
      // Data for sentiment
      this.stockService.getSentiment(ticker).subscribe((data) => {
        this.sentiments = {
          totalMspr: 0,
          totalChange: 0,
          positiveMspr: 0,
          negativeMspr: 0,
          positiveChange: 0,
          negativeChange: 0,
        }
        data.forEach(item => {
          this.sentiments.totalMspr += item.mspr;
          this.sentiments.totalChange += item.change;
          if (item.mspr > 0) { this.sentiments.positiveMspr += item.mspr; }
          if (item.mspr < 0) { this.sentiments.negativeMspr += item.mspr; }
          if (item.change > 0) { this.sentiments.positiveChange += item.change; }
          if (item.change < 0) { this.sentiments.negativeChange += item.change; }
        });
        this.sentiments.totalChange = parseFloat(this.sentiments.totalChange.toFixed(2));
        this.sentiments.totalMspr = parseFloat(this.sentiments.totalMspr.toFixed(2));
        this.sentiments.positiveMspr = parseFloat(this.sentiments.positiveMspr.toFixed(2));
        this.sentiments.negativeMspr = parseFloat(this.sentiments.negativeMspr.toFixed(2));
        this.sentiments.positiveChange = parseFloat(this.sentiments.positiveChange.toFixed(2));
        this.sentiments.negativeChange = parseFloat(this.sentiments.negativeChange.toFixed(2));
      });

      // Data for recommendation
      this.stockService.getRecommendation(ticker).subscribe((data) => {
        //let reccData = data.map((item) => [item.period, item.buy, item.sell, item.strongBuy, item.strongSell, item.hold])
        const reccDate: {
          strongBuy: number[],
          buy: number[],
          hold: number[],
          sell: number[],
          strongSell: number[],
          period: string[]
        } = {
          strongBuy: [],
          buy: [],
          hold: [],
          sell: [],
          strongSell: [],
          period: []
        };
        data.forEach(item => {
          reccDate.strongBuy.push(item.strongBuy);
          reccDate.buy.push(item.buy);
          reccDate.hold.push(item.hold);
          reccDate.sell.push(item.sell);
          reccDate.strongSell.push(item.strongSell);
          reccDate.period.push(item.period.substring(0, 7));
        });
        this.reccChartOptions = {
          title: {
            text: 'Recommendation Trends',
            style: {
              fontSize: '15px',
              fontWeight: 'bold',
            },
          },
          xAxis: {
            categories: reccDate.period,
          },
          yAxis: {
            min: 0,
            title: {
              text: '#Analysis'
            }
          },
          credits: {
            enabled: false
          },
          chart: {
            type: 'column',
            backgroundColor: 'rgb(248, 248, 248)',
          },
          plotOptions: {
            column: {
              stacking: 'normal',
              dataLabels: {
                enabled: true,
                color: '#000000'
              }
            }
          },
          exporting: {
            enabled: false
          },
          series: [{
            name: 'Strong Buy',
            data: reccDate.strongBuy,
            color: 'rgb(24, 100, 55)',
            dataLabels: {
              color: '#ffffff'
            }
          }, {
            name: 'Buy',
            data: reccDate.buy,
            color: 'rgb(30, 176, 87)'

          }, {
            name: 'Hold',
            data: reccDate.hold,
            color: 'rgb(176, 127, 52)'
          },
          {
            name: 'Sell',
            data: reccDate.sell,
            color: 'rgb(241, 80, 87)'
          },
          {
            name: 'Strong Sell',
            data: reccDate.strongSell,
            color: 'rgb(117, 43, 46)'
          }
          ] as SeriesOptionsType[]
        }
        this.updateFlag2 = true;
      });

      // Data for earnings 
      this.stockService.getEarnings(ticker).subscribe((data) => {
        this.earnings = data;
        console.log(data);
        const actual: number[] = [];
        const estimate: number[] = [];
        const surprise: number[] = [];
        const period: string[] = [];
        this.earnings.forEach((item) => {
          actual.push(item['actual']);
          estimate.push(item['estimate']);
          surprise.push(item['surprise']);
          period.push(item['period']);
        });
        let xAxis = [];
        for (let i = 0; i < period.length; i++) {
          xAxis.push(period[i] + ' ' + 'Surprise:' + surprise[i]);
        }
        this.earningsChartOptions = {
          chart: {
            type: 'spline',
            backgroundColor: 'rgb(248, 248, 248)',
          },
          title: {
            text: 'Historical EPS Surprises',
            align: 'center',
            style: {
              fontSize: '15px',
              fontWeight: 'bold',
            },
          },
          xAxis: {
            categories: xAxis,
          },
          yAxis: {
            title: {
              text: 'Quaterly EPS',
            }
          },
          credits: {
            enabled: false
          },
          exporting: {
            enabled: false
          },
          series: [
            {
              name: 'Actual',
              data: actual,
            } as Highcharts.SeriesOptionsType,
            {
              name: 'Estimate',
              color: 'rgb(76, 69, 181)',
              data: estimate,
            } as Highcharts.SeriesOptionsType,
          ],
        };
      })
      // // Data for the wallet
      // this.stockService.getWalletData().subscribe((data) => {
      //   this.walletAmount = data;
      //   console.log('stock -->' + JSON.stringify(data));
      // });
      //Data to check if stock purchased
      this.stockService.getStockData(ticker).subscribe((data) => {
        console.log('stock -->' + JSON.stringify(data));
        this.fetchedStock = data;
      });
      this.inWatchList = false;
      this.checkWatchlist(ticker);
    }

  }

  close(alert: Alert) {
    this.alerts = [];
  }

  open(content: any) {
    this.modalService.open(content);
  }

  open1(content: any) {
    this.quantityBuy = 0;
    this.stockService.getWalletData().subscribe((data) => {
      this.walletAmount = data;
      console.log('stock amount-->' + JSON.stringify(data));
    });
    this.modalService.open(content);
  }

  open2(content: any) {
    this.quantitySell = 0;
    this.stockService.getWalletData().subscribe((data) => {
      this.walletAmount = data;
      console.log('stock amount -->' + JSON.stringify(data));
    });
    this.modalService.open(content);
  }

  onReset() {
    console.log('reset');
    this.tickerForm.reset();
    this.dataService.clearTicker();
    console.log('checking ticker NGS'+JSON.stringify(this.dataService.getTicker()));
    this.router.navigateByUrl('/search/home');
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.tickerForm.setValue(params['ticker']);
      this.quote = {} as QuoteDetails;
      this.timeNow = Date.now();
      this.onSubmit(params['ticker']);
      this.stop$.next();
      interval(15000)
        .pipe(
          takeUntil(this.stop$),
          startWith(0),
          switchMap(() => this.stockService.getQuoteDetailsWP(params['ticker'].toUpperCase()))
        )
        .subscribe((response: QuoteDetails) => {
          console.log('quote ticker-->' + JSON.stringify((params['ticker'])));
          this.timeNow = Date.now();
          console.log('quote-->' + JSON.stringify(response));
          this.quote = response; 
        });
    });
    this.tickerForm.valueChanges.pipe(
      debounceTime(0),
      tap(() => {
        this.isLoading = true;
        this.filteredCompanies = of([]);
      })
    ).subscribe((value) => {
      this.stockService.getAutoComplete(value).pipe(
        map((array) => array.filter((item) => item.type === 'Common Stock' && !item.displaySymbol.includes('.'))),
        finalize(() => setTimeout(() => this.isLoading = false, 0))
      ).subscribe(result => this.filteredCompanies = of(result));
    });
  }

  getNewsDate(date: number) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  encodeURI(post: string): string {
    return encodeURIComponent(post);
  }

  buyStock(amount: number, ticker: string, price: number, name: string, quantity: number) {

    const pri = (((parseFloat(this.fetchedStock.price) * parseInt(this.fetchedStock.quantity)) + price) / (parseInt(this.fetchedStock.quantity) + quantity)).toFixed(2);
    //Buy stock
    this.stockService.buyStock(ticker, quantity + parseInt(this.fetchedStock.quantity), parseFloat(pri), name).subscribe((data) => {
      //update wallet data
      const amt = (parseFloat(amount.toFixed(2)));
      this.stockService.updateWalletData(amount).subscribe((data) => {
        console.log('stock -->' + JSON.stringify(data));
        //Data to check if stock purchased
        this.stockService.getStockData(ticker).subscribe((data) => {
          console.log('stock -->' + JSON.stringify(data));
          this.fetchedStock = data;
        });
      });

    });


    this.modalService.dismissAll();
    this.showSelfClosingBuyAlert(ticker);
  }

  sellStock(amount: number, ticker: string, name: string, quantity: number) {
    //Buy stock
    this.stockService.buyStock(ticker, this.fetchedStock.quantity - quantity, this.fetchedStock.price, name).subscribe((data) => {
      //update wallet data
      const amt = (parseFloat(this.walletAmount.amount) + amount).toFixed(2);
      this.stockService.updateWalletData(parseFloat(amt)).subscribe((data) => {
        console.log('stock -->' + JSON.stringify(data));
        //Data to check if stock purchased
        this.stockService.getStockData(ticker).subscribe((data) => {
          console.log('stock -->' + JSON.stringify(data));
          this.fetchedStock = data;
        });
      });

    });

    this.modalService.dismissAll();
    this.showSelfClosingSellAlert(ticker);
  }

  checkWatchlist(ticker: string) {
    this.stockService.getWatchlistData().subscribe((data) => {
      data.forEach((item) => {
        if (item.ticker == ticker) {
          this.inWatchList = true;
        }
      });
    });
    console.log(this.inWatchList);
  }

  addToWatchlist(ticker: string, name: string) {
    if (this.inWatchList) {
      this.stockService.deleteFromWatchlist(ticker).subscribe(() => {
        this.inWatchList = false;
        this.showSelfClosingRemoveAlert(ticker);
      });
      return;
    } else {
      console.log('add');
      console.log(ticker, name);
      this.stockService.addToWatchlist(ticker, name).subscribe(() => {
        this.inWatchList = true;
        this.showSelfClosingAddAlert(ticker);
      });
    }
  }


  @ViewChild('scrollableList') scrollableList!: ElementRef;
  @ViewChild('scrollButtonLeft') scrollButtonLeft!: ElementRef;
  @ViewChild('scrollButtonRight') scrollButtonRight!: ElementRef;

  ngAfterViewInit() {
    this.checkScroll();
  }

  scrollLeft() {
    this.scrollableList.nativeElement.scrollBy({
      left: -100,
      behavior: 'smooth',
    });
    this.checkScroll();
  }

  scrollRight() {
    this.scrollableList.nativeElement.scrollBy({
      left: 100,
      behavior: 'smooth',
    });
    this.checkScroll();
  }

  scrollCheckTimeout: any;
  checkScroll() {
    if (this.scrollCheckTimeout) {
      clearTimeout(this.scrollCheckTimeout);
    }

    // Set a timeout to delay the check until after the scrolling has stopped
    this.scrollCheckTimeout = setTimeout(() => {
      const scrollableElement = this.scrollableList.nativeElement;

      if (scrollableElement.scrollLeft <= 0) {
        this.renderer.setProperty(this.scrollButtonLeft.nativeElement, 'disabled', true);
      } else {
        this.renderer.setProperty(this.scrollButtonLeft.nativeElement, 'disabled', false);
      }

      if (scrollableElement.scrollLeft + scrollableElement.offsetWidth >= scrollableElement.scrollWidth) {
        this.renderer.setProperty(this.scrollButtonRight.nativeElement, 'disabled', true);
      } else {
        this.renderer.setProperty(this.scrollButtonRight.nativeElement, 'disabled', false);
      }
    }, 200);  // Adjust the delay as needed
  }

  goToDetails(ticker: string) {
    this.router.navigate(['/search/' + ticker]);
  }

}
