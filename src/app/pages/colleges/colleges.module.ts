import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { CollegesPageRoutingModule } from './colleges-routing.module';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';
import { CollegesPage } from './colleges.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CollegesPageRoutingModule
  ],
  declarations: [CollegesPage]
})
export class CollegesPageModule {}