import { Component, ViewChild } from '@angular/core';
import { HomeService } from '../../home/home.service';
import { PortfolioStock } from '../../../models/porfolio-stock';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})
export class PortfolioComponent {

  constructor(
    private stockService: HomeService,
    private modalService: NgbModal,
    private router: Router
  ) { }

  stocks: PortfolioStock[] = [];
  walletAmount: any = [];

  quantityBuy: number = 0;
  quantitySell: number = 0;
  isLoading = true;
  showBuyAlert = false;
  showSellAlert = false;
  buyMessage = '';
  sellMessage = '';

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

  ngOnInit() {
    this.checkStocks();
  }

  checkStocks() {
    this.stockService.getWalletData().subscribe((data) => {
      this.walletAmount = data;
      console.log('stock amount-->' + JSON.stringify(data));
      this.stockService.getStocksData().subscribe(data => {
        console.log(data);
        this.stocks = data.filter((stock) => parseInt(stock.quantity) > 0);
        if(this.stocks.length > 0) {
          this.stocks.forEach((stock) => {
            console.log('stock-->' + JSON.stringify(stock));
            this.stockService.getQuoteDetailsWP(stock.stock).subscribe((quote) => {
              stock.currentPrice = quote.c;
            });
          });
        }
      });
      setTimeout(() => {
        this.isLoading = false;
      }, 2000);
    });
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

  buyStock(amount: number, ticker: string, price: number, name: string, quantity: number, fetchedStock: PortfolioStock) {

    const pri = (((parseFloat(fetchedStock.price)*parseInt(fetchedStock.quantity)) + price)/(parseInt(fetchedStock.quantity) + quantity)).toFixed(2);
    //Buy stock
    this.stockService.buyStock(ticker, quantity + parseInt(fetchedStock.quantity), parseFloat(pri), name).subscribe((data) => {
      //update wallet data
      const amt = (parseFloat(amount.toFixed(2)));
      this.stockService.updateWalletData(amount).subscribe((data) => {
        console.log('stock -->' + JSON.stringify(data));
        //Data to check if stock purchased
        // this.stockService.getStockData(ticker).subscribe((data) => {
        //   console.log('stock -->' + JSON.stringify(data));
        //   this.fetchedStock = data;
        // });
        this.checkStocks();
      });

    });


    this.modalService.dismissAll();
    this.showSelfClosingBuyAlert(ticker);
  }

  sellStock(amount: number, ticker: string, name: string, quantity: number, fetchedStock: PortfolioStock) {
    //Buy stock
    this.stockService.buyStock(ticker, parseInt(fetchedStock.quantity) - quantity, parseFloat(fetchedStock.price), name).subscribe((data) => {
      //update wallet data
      const amt = (parseFloat(this.walletAmount.amount) + amount).toFixed(2);
      this.stockService.updateWalletData(parseFloat(amt)).subscribe((data) => {
        console.log('stock -->' + JSON.stringify(data));
        //Data to check if stock purchased
        // this.stockService.getStockData(ticker).subscribe((data) => {
        //   console.log('stock -->' + JSON.stringify(data));
        //   this.fetchedStock = data;
        // });
        this.checkStocks();
      });

    });

    this.modalService.dismissAll();
    this.showSelfClosingSellAlert(ticker);
  }

  getFormattedNumber(stock: PortfolioStock): number {
    const value = (+stock.currentPrice) - (+stock.price);
    return parseFloat(value.toFixed(2));
  }

  goToDetails(ticker: string) {
    this.router.navigate(['/search/' + ticker]);
  }

}
