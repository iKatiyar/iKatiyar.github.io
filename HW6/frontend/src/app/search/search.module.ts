import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    SearchComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HighchartsChartModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule
  ]
})
export class SearchModule { }
