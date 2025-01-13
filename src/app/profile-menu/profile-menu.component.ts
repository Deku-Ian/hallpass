import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss'],
})
export class ProfileMenuComponent {

  constructor(private popoverController: PopoverController, private router: Router) {}


  logout() {

    this.router.navigate(['/login']);
    this.popoverController.dismiss(); // Close the popover menu after logout
  }
  
  closePopover() {
    this.popoverController.dismiss();
  }
}
