import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderFooterComponent } from './Components/Reusable/header-footer/header-footer.component';
import { TarjetaProductoComponent } from './Components/Reusable/tarjeta-producto/tarjeta-producto.component';
import { HeroComponent } from './Components/LandingPage/hero/hero.component';
import { MenuComponent } from './Components/LandingPage/menu/menu.component';
import { AuthComponent } from './Components/LandingPage/auth/auth.component';
import { NavbarComponent } from './Components/Shared/navbar/navbar.component';
import { CartComponent } from './Components/Shared/cart/cart.component';
import { CartModalComponent } from './Components/Shared/cart-modal/cart-modal.component';
import { ProfileComponent } from './Components/Shared/profile/profile.component';
import { OrderHistoryComponent } from './Components/Shared/order-history/order-history.component';
import { ProductDetailComponent } from './Components/Shared/product-detail/product-detail.component';
import { AdminAdicionalesComponent } from './Components/Admin/admin-adicionales/admin-adicionales.component';
import { ProductDetailModalComponent } from './Components/LandingPage/product-detail-modal/product-detail-modal.component';
import { DashboardComponent } from './Components/Admin/dashboard/dashboard.component';
import { AdminProductsComponent } from './Components/Admin/admin-products/admin-products.component';
import { AdminClientesComponent } from './Components/Admin/admin-clientes/admin-clientes.component';
import { AdminDomiciliariosComponent } from './Components/Admin/admin-domiciliarios/admin-domiciliarios.component';

@NgModule({
  declarations: [
    AppComponent,
    TarjetaProductoComponent,
    HeroComponent,
    MenuComponent,
    AuthComponent,
    NavbarComponent,
    CartComponent,
    CartModalComponent,
    ProfileComponent,
    OrderHistoryComponent,
    ProductDetailComponent,
    AdminAdicionalesComponent,
    ProductDetailModalComponent,
    DashboardComponent,
    AdminProductsComponent,
    AdminClientesComponent,
    AdminDomiciliariosComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    HeaderFooterComponent
  ],
  exports: [
    CartModalComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
