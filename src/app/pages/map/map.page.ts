import { Component, AfterViewInit, ViewEncapsulation, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';  
import { Geolocation } from '@capacitor/geolocation';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare module 'leaflet' {
  namespace Routing {
    function control(options: any): any;
  }
}

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MapPage implements AfterViewInit, OnInit {
  map!: L.Map;
  routeControl: L.Routing.Control | null = null;
  currentStepContainer: HTMLDivElement | null = null;
  toggleButton: HTMLButtonElement | null = null;
  isStepContainerVisible: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.initMap();
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {

    if (this.map) {
      this.map.remove();
    }


    const params = this.activatedRoute.snapshot.queryParams;
    const { latitude, longitude, name } = params;


    this.map = L.map('map', {
      zoom: 18,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);


    const destinationName = name || 'CSU Carig';

    this.getGeolocation(latitude, longitude, destinationName);
  }

  private createToggleButton() {

    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'toggle-steps-btn leaflet-bar';
    this.toggleButton.style.position = 'absolute';
    this.toggleButton.style.top = '10px';
    this.toggleButton.style.right = '10px';
    this.toggleButton.style.zIndex = '1001';
    this.toggleButton.style.backgroundColor = 'white';
    this.toggleButton.style.border = '1px solid #ccc';
    this.toggleButton.style.borderRadius = '5px';
    this.toggleButton.style.padding = '5px';
    this.toggleButton.style.cursor = 'pointer';
    this.toggleButton.style.display = 'flex';
    this.toggleButton.style.alignItems = 'center';
    this.toggleButton.style.justifyContent = 'center';
    this.toggleButton.style.width = '40px';
    this.toggleButton.style.height = '40px';

    const iconContainer = document.createElement('div');
    
    this.toggleButton.addEventListener('click', () => this.toggleStepContainer());

    if (this.map) {
      
      this.renderToggleIcon(iconContainer, true);
      this.toggleButton.appendChild(iconContainer);
      this.map.getContainer().appendChild(this.toggleButton);
    }
  }

  private renderToggleIcon(container: HTMLElement, isDown: boolean) {

    container.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.style.color = '#333'; 

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', isDown 
      ? 'M6 9l6 6 6-6'  
      : 'M18 15l-6-6-6 6' 
    );

    svg.appendChild(path);
    container.appendChild(svg);
  }

  private toggleStepContainer() {
    if (!this.currentStepContainer || !this.toggleButton) return;

    this.isStepContainerVisible = !this.isStepContainerVisible;

    if (this.isStepContainerVisible) {
      this.currentStepContainer.style.display = 'block';
      this.renderToggleIcon(this.toggleButton.querySelector('div') as HTMLElement, true);
    } else {
      this.currentStepContainer.style.display = 'none';
      this.renderToggleIcon(this.toggleButton.querySelector('div') as HTMLElement, false);
    }
  }


  private async getGeolocation(defaultLatitude: string, defaultLongitude: string, destinationName: string) {
    try {
  
      const position = await Geolocation.getCurrentPosition();
      const userLocation: L.LatLngExpression = [position.coords.latitude, position.coords.longitude];

      this.map.setView(userLocation, 18);  

      const userIcon = L.icon({
        iconUrl: '../../../assets/images/profile-icon.png',
        iconSize: [32, 21],
        iconAnchor: [16, 22],
      });
      L.marker(userLocation, { icon: userIcon }).addTo(this.map).bindPopup('Your Location').openPopup();

      const destination: L.LatLngExpression = [
        Number(defaultLatitude) || 17.659532,
        Number(defaultLongitude) || 121.751897
      ];


      if (this.routeControl) {
        this.routeControl.remove();
      }

      if (this.currentStepContainer) {
        this.currentStepContainer.remove();
      }

      if (this.toggleButton) {
        this.toggleButton.remove();
      }

      this.currentStepContainer = document.createElement('div');
      this.currentStepContainer.className = 'current-step-container leaflet-bar';
      this.currentStepContainer.style.position = 'absolute';
      this.currentStepContainer.style.top = '10px';
      this.currentStepContainer.style.right = '10px';
      this.currentStepContainer.style.zIndex = '1000';
      this.currentStepContainer.style.backgroundColor = 'white';
      this.currentStepContainer.style.padding = '10px';
      this.currentStepContainer.style.borderRadius = '5px';
      this.currentStepContainer.style.maxWidth = '250px';

      this.map.getContainer().appendChild(this.currentStepContainer);

      this.createToggleButton();

      this.routeControl = L.Routing.control({
        waypoints: [
          L.latLng(userLocation),
          L.latLng(destination),
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        createMarker: () => null,
        lineOptions: {
          styles: [{ color: 'blue', weight: 5, opacity: 0.7 }],
        },
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving',
        }),

        show: false,
        createRoutesContainer: () => {

          return document.createElement('div');
        }
      }).addTo(this.map);


      this.routeControl?.on('routesfound', (e) => {
        const routes = e.routes;
        if (routes.length > 0) {
          const firstRoute = routes[0];
          if (firstRoute.instructions && firstRoute.instructions.length > 0) {

            const nextSteps = firstRoute.instructions.slice(0, 5);
      

            if (this.currentStepContainer) {
              const stepsHTML = nextSteps.map((instruction: any, index: number) => `
                <div class="route-step">
                  <strong>Step ${index + 1}:</strong>
                  ${instruction.text}
                  <br>
                  <small>Distance: ${instruction.distance.toFixed(2)} m</small>
                </div>
              `).join('');
      
              this.currentStepContainer.innerHTML = `
                <h3>Directions:</h3>
                ${stepsHTML}
              `;
            }
          }
        }
      });
      if (this.routeControl) {
        const routingContainer = document.querySelector('.leaflet-routing-container');
        if (routingContainer) {
          routingContainer.remove();
        }
      }

      const destinationIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        shadowSize: [41, 41],
      });
      
      L.marker(destination, { icon: destinationIcon }).addTo(this.map).bindPopup(destinationName).openPopup();

    } catch (error) {
      console.error('Error getting geolocation:', error);

      const fallbackLocation: L.LatLngExpression = [17.659282, 121.752497];
      this.map.setView(fallbackLocation, 18);

      const destination: L.LatLngExpression = [
        Number(defaultLatitude) || 17.659532,
        Number(defaultLongitude) || 121.751897
      ];

      this.routeControl = L.Routing.control({
        waypoints: [
          L.latLng(fallbackLocation),
          L.latLng(destination),
        ],
        routeWhileDragging: false,
        createMarker: () => null,
        lineOptions: {
          styles: [{ color: 'blue', weight: 5, opacity: 0.7 }],
        },
      }).addTo(this.map);

      const destinationIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        shadowSize: [41, 41],
      });
      L.marker(destination, { icon: destinationIcon }).addTo(this.map).bindPopup(destinationName).openPopup();
    }
  }
}