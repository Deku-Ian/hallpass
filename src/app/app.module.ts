import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { environment } from '../environments/environment';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { UserService } from './services/user.service';

@NgModule({
  declarations: [AppComponent, ProfileMenuComponent], 
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'md', 
      animated: true 
    }),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule, 
    AngularFirestoreModule 
  ],
  providers: [
    UserService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    const app = initializeApp(environment.firebase);
    const storage = getStorage(app);
  }

 }
