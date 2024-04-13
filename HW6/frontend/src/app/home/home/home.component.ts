import { Component } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, debounceTime, finalize, map, of, switchMap, tap } from 'rxjs';
import { AutoComplete } from '../../../models/auto-complete';
import { Alert } from '../../../models/alert';
import { HomeService } from '../home.service';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  filteredCompanies!: Observable<AutoComplete[]>;
  tickerForm: FormControl = new FormControl();
  isLoading = false;
  ticker: string = "";
  noTickerError = false;
  showSearch = false;

  alerts: Alert[] = [];

  constructor(
    public stockService: HomeService,
    private router: Router,
    private dataService: DataService
  ) { }

  onSubmit(formEntered: any) {
    console.log("Form entered" + formEntered);
    let ticker = this.tickerForm.value;
    console.log(ticker);
    if(ticker == null || ticker == undefined || ticker == '') {
      this.alerts.push({
         type: "danger",
         message: "Please enter a valid ticker"
       })
      
    } else {
      this.router.navigate(['/search/' + ticker]);
    }
    // if (formEntered.value.tickerEntered?.displaySymbol) {
    //   this.ticker = formEntered.value.tickerEntered.displaySymbol;
    // } else {
    //   this.ticker = formEntered.value.tickerEntered;
    // }
    // console.log('ticker name in form: ', this.ticker);
    // if (this.ticker?.length) {
    //   this.stockService.getAllDetails(this.ticker);
    //   this.router.navigate(['/search/' + this.ticker]);
    //   this.showSearch = this.stockService.showDeatils;
    // } else {
    //   this.alerts.push({
    //     type: "danger",
    //     message: "Please enter a valid ticker"
    //   })
    //   console.log("Alert :" + this.alerts)

      // this.alerts[0].type = 'danger';
      // this.alerts[0].message = 'Please enter a valid ticker';
      //this.router.navigateByUrl('/search/home'); 
    // }

  }

  close(alert: Alert) {
		this.alerts = [];
	}

  onReset() {
    console.log('Inside');
    this.tickerForm.reset();
    this.dataService.clearTicker();
    console.log('checking ticker RH'+JSON.stringify(this.dataService.getTicker()));
    this.router.navigateByUrl('/search/home');
  }

  ngOnInit() {
    this.dataService.clearTicker();
    console.log('checking ticker NGH'+JSON.stringify(this.dataService.getTicker()));
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

}
