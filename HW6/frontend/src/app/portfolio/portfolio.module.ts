import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



@NgModule({
  declarations: [
    PortfolioComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule
  ]
})
export class PortfolioModule { }
