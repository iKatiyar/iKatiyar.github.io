import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



@NgModule({
  declarations: [
    WatchlistComponent
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule
  ]
})
export class WatchlistModule { }
