import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  userEmail: string = '';
  userName: string = '';
  userCourse: string = '';
  profileImageUrl: string = '../../assets/images/profile-icon.png';
  private auth = getAuth();
  private db = getFirestore();
  private maxWidth = 400; 
  private maxHeight = 400; 
  private quality = 0.7; 

  constructor(
    private navCtrl: NavController,
    private alertController: AlertController,
    private userService: UserService
  ) { }

  async ngOnInit() {
    await this.loadUserData();
    this.userService.getProfileImageUrl().subscribe(url => {
      if (url) {
        this.profileImageUrl = url;
      }
    });
  }

  async loadUserData() {
    try {
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        this.userEmail = currentUser.email || '';
        
        const userData = await this.userService.getCurrentUserData();
        if (userData) {
          this.userName = userData['username'] || '';
          this.profileImageUrl = userData['profileImageUrl'] || '../../assets/images/profile-icon.png';
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  private async compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > this.maxWidth) {
              height = Math.round(height * (this.maxWidth / width));
              width = this.maxWidth;
            }
          } else {
            if (height > this.maxHeight) {
              width = Math.round(width * (this.maxHeight / height));
              height = this.maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', this.quality);
          resolve(compressedBase64);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  async uploadProfilePicture(event: any) {
    const file = event.target.files[0];
    if (file) {
      try {
        const alert = await this.alertController.create({
          header: 'Processing...',
          message: 'Please wait while we process your profile picture.',
          backdropDismiss: false
        });
        await alert.present();

        const compressedBase64 = await this.compressImage(file);

        const user = this.auth.currentUser;
        if (!user) {
          throw new Error('No user logged in');
        }

        const userDocRef = doc(this.db, 'users', user.uid);
        await updateDoc(userDocRef, {
          profileImageUrl: compressedBase64
        });

        this.profileImageUrl = compressedBase64;
        this.userService.updateProfileImage(compressedBase64);

        await alert.dismiss();
        
        const successAlert = await this.alertController.create({
          header: 'Success',
          message: 'Profile picture updated successfully',
          buttons: ['OK']
        });
        await successAlert.present();
        
      } catch (error) {
        console.error('Error processing profile picture:', error);
        const errorAlert = await this.alertController.create({
          header: 'Error',
          message: 'Failed to update profile picture. Please try a smaller image.',
          buttons: ['OK']
        });
        await errorAlert.present();
      }
    }
  }

  async editProfile() {
    const alert = await this.alertController.create({
      header: 'Edit Profile',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'Username',
          value: this.userName
        },
        {
          name: 'course',
          type: 'text',
          placeholder: 'Course',
          value: this.userCourse
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: async (data) => {
            try {
              const user = this.auth.currentUser;
              if (!user) {
                throw new Error('No user logged in');
              }

              const userDocRef = doc(this.db, 'users', user.uid);
              
              await updateDoc(userDocRef, {
                username: data.username,
                profileImageUrl: this.profileImageUrl
              });
              
              this.userName = data.username;
              this.userCourse = data.course;
              
              console.log('Profile updated successfully');
              return true;

            } catch (error) {
              console.error('Error updating profile:', error);
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.navCtrl.navigateRoot('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}