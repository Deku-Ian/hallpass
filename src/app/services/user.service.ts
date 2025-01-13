import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private db = getFirestore();
  private auth = getAuth();
  private storage = getStorage();
  private defaultProfileImage = '../../../assets/images/profile-icon.png';
  private profileImageSubject = new BehaviorSubject<string>(this.defaultProfileImage);

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
    this.initProfileImage();
  }

  private async initProfileImage() {
    try {
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        const userData = await this.getCurrentUserData();
        const profileUrl = userData?.['profileImageUrl'] || this.defaultProfileImage;
        this.profileImageSubject.next(profileUrl);
      }
    } catch (error) {
      console.error('Error initializing profile image:', error);
    }
  }
  

  async getCurrentUserData() {
    try {
      const user = this.auth.currentUser;
      if (!user) return null;

      const userDocRef = doc(this.db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  updateProfileImage(url: string) {
    this.profileImageSubject.next(url);
  }

  getProfileImageUrl(): Observable<string> {
    return this.profileImageSubject.asObservable();
  }

  getUserProfile(): Observable<any> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection('users').doc(user.uid).valueChanges();
        }
        return of(null);
      })
    );
  }
}
