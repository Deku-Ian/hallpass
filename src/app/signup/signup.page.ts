import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastController, LoadingController } from '@ionic/angular';
import { MenuController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['../login/login.page.scss'],
})
export class SignupPage implements OnInit {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(
    private menuCtrl: MenuController, 
    private alertController: AlertController,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router
  ) { }

  ngOnInit() {
  }

  async signUp() {

    if (!this.username || this.username.length < 3) {
      this.showErrorAlert('Username must be at least 3 characters');
      return;
    }
  
    if (!this.email || !this.isValidEmail(this.email)) {
      this.showErrorAlert('Please enter a valid email address');
      return;
    }
  
    if (!this.password || this.password.length < 6) {
      this.showErrorAlert('Password must be at least 6 characters');
      return;
    }
  

    const loading = await this.loadingController.create({
      message: 'Creating account...',
      spinner: 'crescent'
    });
    await loading.present();
  
    try {

      const userCredential = await this.afAuth.createUserWithEmailAndPassword(this.email, this.password);
      
      const user = userCredential.user;

      if (user) {
        await this.firestore.collection('users').doc(user.uid).set({
          uid: user.uid,
          username: this.username.trim(),
          email: this.email.toLowerCase(),
          createdAt: new Date(),
          lastLogin: new Date()
        });

        await loading.dismiss();
        await this.presentToast('Account created successfully!', 'success');

        this.router.navigate(['/login']);
      }
    } catch (error: any) {

      await loading.dismiss();
  

      let errorMessage = 'Registration failed';
      switch(error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred';
      }
  

      this.presentToast(errorMessage, 'danger');
    }
  }
  async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Sign up Error',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async presentToast(message: string, color: 'success' | 'danger' = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    toast.present();
    return toast;
  }
}