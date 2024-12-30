import { Routes } from '@angular/router';
import { AgenteComponent } from './agente/agente.component';
import { ClienteComponent } from './cliente/cliente.component';

export const routes: Routes = [
  { path: '', redirectTo: 'agente', pathMatch: 'full' },
  { path: 'agente', component: AgenteComponent },
  { path: 'cliente', component: ClienteComponent },
];
