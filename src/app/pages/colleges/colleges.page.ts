import { Component, OnInit, OnDestroy  } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ProfileMenuComponent } from '../../profile-menu/profile-menu.component';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-colleges',
  templateUrl: './colleges.page.html',
  styleUrls: ['./colleges.page.scss'],
})
export class CollegesPage implements OnInit, OnDestroy {
  username: string = 'Student';
  userProfile: any = null;
  profileImageUrl: string = '../../../assets/images/profile-icon.png';
  private userSubscription: Subscription | null = null;
  
  colleges = [
    { name: 'College of Human Kinetics', imageUrl: '../../../assets/images/college pics/CHK/chk.png', latitude: 17.65969753458836, longitude: 121.75385386219797 },
    { name: 'College of Information and Computing Sciences', imageUrl: '../../../assets/images/college pics/CICS/cics.png', latitude: 17.65760121521207, longitude: 121.75234347337498 },
    { name: 'College of Industrial Technology', imageUrl: '../../../assets/images/college pics/CIT/cit.jpg', latitude: 17.65712397527649, longitude: 121.75353301132455 },
    { name: 'College of Medicine', imageUrl: '../../../assets/images/college pics/CM/com.png', latitude: 17.660785747414838, longitude: 121.75247359727997 },
    { name: 'College of Engineering and Agriculture', imageUrl: '../../../assets/images/college pics/COEA/eng1.jpg', latitude: 17.657472251506675, longitude: 121.75280458194715 },
    { name: 'College of Veterinary Medicine', imageUrl: '../../../assets/images/college pics/CVM/cvm.png', latitude: 17.660671780291068, longitude: 121.75370253071314 },
    { name: 'College of Public Administration', imageUrl: '../../../assets/images/college pics/CPA/cpa1.jpg', latitude: 17.658768549206616, longitude: 121.75233389132052 },
    { name: 'College of Natural Science and Mathematics', imageUrl: '../../../assets/images/college pics/CNSM/cnsm.jpg', latitude: 17.65940255699461, longitude: 121.75116105216931 },
  ];

  utilities = [
    { name: 'College Registrar', imageUrl: '../../../assets/images/college pics/registrar/registrar.png', latitude: 17.65971728047515, longitude: 121.75221106219865 },
    { name: 'Red Eagle Gymnasium', imageUrl: '../../../assets/images/college pics/gym/gym0.png', latitude: 17.659161597518697, longitude: 121.75289650107274 },
    { name: 'Agila Convenience Store', imageUrl: '../../../assets/images/college pics/store/store.png', latitude: 17.659001176362928, longitude: 121.75309531951979 },
    { name: 'Food Center', imageUrl: '../../../assets/images/college pics/food center/food-center.png', latitude: 17.658895522856806, longitude: 121.75278404713451 },
    { name: 'University Library', imageUrl: '../../../assets/images/college pics/library/library.png', latitude: 17.660058278172045, longitude: 121.75307860604012 },
    { name: 'Agila Fountain', imageUrl: '../../../assets/images/college pics/rotonda/rotunda.png', latitude: 17.657907856333335, longitude: 121.75299406994569 },
  ];


  filteredData = { colleges: [...this.colleges], utilities: [...this.utilities] };
  menuVisible = false;

  constructor(private popoverController: PopoverController, private router: Router, private userService: UserService,private afAuth: AngularFireAuth) {
    this.userService.getProfileImageUrl().subscribe(url => {
      this.profileImageUrl = url;
    });
  }

ngOnInit() {

  this.userService.getUserProfile().subscribe((userProfile: any) => {
    if (userProfile && userProfile.username) {
      this.username = userProfile.username; 
    } else {
      this.username = 'Guest'; 
    }
  });
  
    this.userSubscription = this.userService.getUserProfile().subscribe(
      (user) => {
        if (user) {
          this.username = user.username || 'Student';
          this.userProfile = user;
        }
      },
      (error) => {
        console.error('Error fetching user profile', error);
      }
    );
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
  
  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }

  logout() {
    this.router.navigate(['/login']);
    this.menuVisible = false;
  }

  async showProfileMenu(event: any) {
    const popover = await this.popoverController.create({
      component: ProfileMenuComponent,
      event: event,
      translucent: true,
    });
    return await popover.present();
  }

  filterColleges(event: any) {
    const searchTerm = event.target.value.toLowerCase();

    this.filteredData.colleges = this.colleges.filter((college) =>
      college.name.toLowerCase().includes(searchTerm)
    );
    this.filteredData.utilities = this.utilities.filter((utility) =>
      utility.name.toLowerCase().includes(searchTerm)
    );
  }
  navigateToMap(place: { name: string; imageUrl: string; latitude: number; longitude: number }) {
    this.router.navigate(['/map'], {
      queryParams: {
        name: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
      },
    });
  }
  
  
}
