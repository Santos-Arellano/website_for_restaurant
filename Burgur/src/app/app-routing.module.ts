import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/components/home/home.component';
import { MenuComponent as NewMenuComponent } from './features/menu/components/menu/menu.component';
import { MenuComponent } from './pages/menu/menu.component';
import { LoginComponent as NewLoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent as NewRegisterComponent } from './features/auth/components/register/register.component';
import { UserProfileComponent } from './features/user/components/user-profile/user-profile.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './pages/user/profile/profile.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { ProductsComponent } from './pages/admin/products/products.component';
import { ClientsComponent } from './pages/admin/clients/clients.component';
import { DeliveryComponent } from './pages/admin/delivery/delivery.component';
import { AdditionalsComponent } from './pages/admin/additionals/additionals.component';
import { DashboardComponent as AdminDashboardComponent } from './admin/dashboard/dashboard.component';
import { ProductManagementComponent } from './admin/product-management/product-management.component';
import { ProductsComponent as AdminProductsComponent } from './admin/products/products.component';
import { ClientesComponent } from './admin/clientes/clientes.component';
import { DomiciliariosComponent } from './admin/domiciliarios/domiciliarios.component';
import { AdicionalesComponent } from './admin/adicionales/adicionales.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'menu', component: NewMenuComponent },
  { 
    path: 'auth', 
    children: [
      { path: 'login', component: NewLoginComponent },
      { path: 'register', component: NewRegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { 
    path: 'admin', 
    // Temporalmente removemos el guard para acceso directo
    // canActivate: [AdminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'product-management', component: ProductManagementComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'delivery', component: DeliveryComponent },
      { path: 'domiciliarios', component: DomiciliariosComponent },
      { path: 'additionals', component: AdditionalsComponent },
      { path: 'adicionales', component: AdicionalesComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
