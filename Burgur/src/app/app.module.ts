import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminModule } from './pages/admin/admin.module';

// Components
import { HeaderComponent } from './core/components/header/header.component';
import { MenuComponent } from './pages/menu/menu.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './pages/user/profile/profile.component';

// Services
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { HelpersService } from './services/helpers.service';
import { ProductService } from './services/product.service';
import { CartService } from './services/cart.service';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ProductManagementComponent } from './admin/product-management/product-management.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    ProfileComponent,
    ProductManagementComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    AdminModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LoginComponent,
    RegisterComponent,
    HeaderComponent
  ],
  providers: [
    AuthService,
    NotificationService,
    HelpersService,
    ProductService,
    CartService,
    AuthGuard,
    AdminGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
