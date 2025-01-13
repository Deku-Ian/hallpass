import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: true, 
  imports: [
    IonicModule,
    CommonModule
  ]
})
export class LandingPage {

  constructor(private router: Router) {}

  getStarted() {
    this.router.navigate(['/login']); 
  }
}
