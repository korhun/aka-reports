import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HandbrakeComponent } from './components/handbrake/handbrake.component';

const routes: Routes = [
  // { path: 'medigrafi', component: MedigrafiComponent },
  { path: 'handbrake', component: HandbrakeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
