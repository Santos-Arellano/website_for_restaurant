import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderFooterComponent } from './Components/Reusable/header-footer/header-footer.component';
import { TarjetaProductoComponent } from './Components/Reusable/tarjeta-producto/tarjeta-producto.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderFooterComponent,
    TarjetaProductoComponent,
    HeaderFooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
