import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    NgbAlertModule
  ]
})
export class HomeModule { }
