import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductsComponent } from './products/products.component';

@NgModule({
  declarations: [
    DashboardComponent,
    ProductsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    DashboardComponent,
    ProductsComponent
  ]
})
export class AdminModule { }