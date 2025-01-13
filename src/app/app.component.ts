import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  activePage: string = '';  
  showBottomNavbar: boolean = true;  

  constructor(private router: Router, private menuController: MenuController) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateNavbarVisibility(event.urlAfterRedirects);
      }
    });
  }

  private updateNavbarVisibility(url: string) {
    if (url.includes('landing') || url.includes('login') || url.includes('signup')) {
      this.showBottomNavbar = false;
    } else {
      this.showBottomNavbar = true;
    }

 
    if (url.includes('colleges')) {
      this.activePage = 'colleges';
    } else if (url.includes('map')) {
      this.activePage = 'map';
    } else if (url.includes('profile')) {
      this.activePage = 'profile';
    } else {
      this.activePage = '';  
    }
  }

  navigateTo(page: string) {
    this.menuController.close();
    this.router.navigate([`/${page}`]);
  }

  logout() {
    this.menuController.close();
    this.router.navigate(['/login']);
  }
}