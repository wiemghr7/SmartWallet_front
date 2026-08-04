import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { MainLayout } from './layout/main-layout/main-layout';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Transactions } from './pages/transactions/transactions';
import { Budgets } from './pages/budgets/budgets';
import { Insights } from './pages/insights/insights';
import { Goals } from './pages/goals/goals';
import { Notifications } from './pages/notifications/notifications';
import { Profile } from './pages/profile/profile';
import { AdminDashboard } from './pages/admin/admin-dashboard/admin-dashboard';
import { AdminUsers } from './pages/admin/admin-users/admin-users';
import { AdminCategories } from './pages/admin/admin-categories/admin-categories';
import { AdminStats } from './pages/admin/admin-stats/admin-stats';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // Espace utilisateur — protégé par authGuard
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'transactions', component: Transactions },
      { path: 'budgets', component: Budgets },
      { path: 'insights', component: Insights },
      { path: 'goals', component: Goals },
      { path: 'notifications', component: Notifications },
      { path: 'profile', component: Profile },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Espace admin — protégé par adminGuard
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'users', component: AdminUsers },
      { path: 'categories', component: AdminCategories },
      { path: 'stats', component: AdminStats },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
