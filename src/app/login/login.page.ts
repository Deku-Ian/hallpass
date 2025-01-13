import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { environment } from 'src/environments/environment';
import { MenuController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  oApp = initializeApp(environment.firebase);
  oAuth = getAuth(this.oApp);

  gEmail = "";
  gPassword = "";

  showPassword = false;

  constructor(
    private menuCtrl: MenuController, 
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.clearLoginFields();
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
    this.clearLoginFields();
  }

  ionViewWillLeave() {
    this.menuCtrl.enable(true);
  }

  clearLoginFields() {
    this.gEmail = "";
    this.gPassword = "";
    this.showPassword = false;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async loginUser() {
    if (!this.gEmail || !this.gPassword) {
      this.showErrorAlert('Please enter both email and password');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(this.oAuth, this.gEmail, this.gPassword);
      const user = userCredential.user;
      console.log(user);
      this.router.navigate(['/colleges']);
    } catch (error: any) {
      let errorMessage = 'An unknown error occurred';
      
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No user found with this email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
      }

      this.showErrorAlert(errorMessage);
    }
  }

  async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Login Error',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }
}