import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app/app-routing.module';

// Services
import { AuthService } from './app/services/auth.service';
import { NotificationService } from './app/services/notification.service';
import { HelpersService } from './app/services/helpers.service';
import { ProductService } from './app/services/product.service';
import { CartService } from './app/services/cart.service';

// Guards
import { AuthGuard } from './app/guards/auth.guard';
import { AdminGuard } from './app/guards/admin.guard';

// Interceptors
import { AuthInterceptor } from './app/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      CommonModule,
      AppRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      HttpClientModule
    ),
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
  ]
}).catch(err => console.error(err));
