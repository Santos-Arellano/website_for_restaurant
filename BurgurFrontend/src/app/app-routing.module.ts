import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeroComponent } from './Components/LandingPage/hero/hero.component';
import { MenuComponent } from './Components/LandingPage/menu/menu.component';
import { AuthComponent } from './Components/LandingPage/auth/auth.component';
import { CartComponent } from './Components/Shared/cart/cart.component';
import { ProfileComponent } from './Components/Shared/profile/profile.component';
import { OrderHistoryComponent } from './Components/Shared/order-history/order-history.component';
import { ProductDetailComponent } from './Components/Shared/product-detail/product-detail.component';
import { OrderDetailComponent } from './Components/Shared/order-detail/order-detail.component';
import { DashboardComponent } from './Components/Admin/dashboard/dashboard.component';
import { AdminProductsComponent } from './Components/Admin/admin-products/admin-products.component';
import { AdminClientesComponent } from './Components/Admin/admin-clientes/admin-clientes.component';
import { AdminAdicionalesComponent } from './Components/Admin/admin-adicionales/admin-adicionales.component';
import { AdminDomiciliariosComponent } from './Components/Admin/admin-domiciliarios/admin-domiciliarios.component';
import { AdminOperadoresComponent } from './Components/Admin/admin-operadores/admin-operadores.component';

const routes: Routes = [
  { path: '', component: HeroComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
  { path: 'cart', component: CartComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'orders', component: OrderHistoryComponent },
  { path: 'orders/:id', component: OrderDetailComponent },
  // Rutas de administración
  { path: 'admin', component: DashboardComponent },
  { path: 'admin/dashboard', component: DashboardComponent },
  { path: 'admin/productos', component: AdminProductsComponent },
  { path: 'admin/clientes', component: AdminClientesComponent },
  { path: 'admin/adicionales', component: AdminAdicionalesComponent },
  { path: 'admin/domiciliarios', component: AdminDomiciliariosComponent },
  { path: 'admin/operadores', component: AdminOperadoresComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
