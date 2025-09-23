import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-location-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-modal.component.html',
  styleUrls: ['./location-modal.component.css']
})
export class LocationModalComponent implements OnInit, OnDestroy {
  isOpen = false;
  restaurantInfo: any;
  private subscription: Subscription = new Subscription();

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    console.log('LocationModalComponent: ngOnInit called');
    // Subscribe to modal state
    this.subscription.add(
      this.locationService.isLocationModalOpenObservable().subscribe(
        (isOpen: boolean) => {
          console.log('LocationModalComponent: Modal state changed to:', isOpen);
          this.isOpen = isOpen;
        }
      )
    );

    // Get restaurant information
    this.restaurantInfo = this.locationService.getRestaurantInfo();
    console.log('LocationModalComponent: Restaurant info loaded:', this.restaurantInfo);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  closeModal(): void {
    this.locationService.closeLocationModal();
  }

  getDirections(): void {
    window.open(this.locationService.getDirectionsUrl(), '_blank');
  }

  viewOnGoogleMaps(): void {
    window.open(this.locationService.getGoogleMapsUrl(), '_blank');
  }

  callRestaurant(): void {
    window.open(this.locationService.getPhoneCallUrl());
  }

  sendEmail(): void {
    window.open(this.locationService.getEmailUrl());
  }

  shareLocation(): void {
    this.locationService.shareLocation();
  }
}