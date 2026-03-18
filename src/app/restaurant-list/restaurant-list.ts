import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantService } from '../services/restaurant.service';
import { RewardService } from '../services/reward.service';
import { IRestaurant } from '../models/restaurant.model';
import { IReward } from '../models/reward.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './restaurant-list.html',
  styleUrls: ['./restaurant-list.css'],
})
export class RestaurantList implements OnInit {
  restaurants: IRestaurant[] = [];
  filteredRestaurants: IRestaurant[] = [];
  searchControl = new FormControl('');
  loading = true;
  errorMsg = '';
  showForm = false;
  restaurantForm!: FormGroup;
  editting = false;
  restaurantEditId: string | undefined;
  expanded: { [key: string]: boolean } = {};
  limit = 10;
  showAllRestaurants = false;
  showAllData = false;
  
  showRewardForm: { [key: string]: boolean } = {};
  newRewardForm!: FormGroup;

  constructor(private api: RestaurantService, private rewardApi: RewardService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private dialog: MatDialog) {
    this.restaurantForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      rating: [0, [Validators.pattern('^[0-5]+(\\.[0-9]+)?$'), Validators.min(0), Validators.max(5)]],
      mondayOpen: [''],
      tuesdayOpen: [''],
      wednesdayOpen: [''],
      thursdayOpen: [''],
      fridayOpen: [''],
      saturdayOpen: [''],
      sundayOpen: [''],
      mondayClose: [''],
      tuesdayClose: [''],
      wednesdayClose: [''],
      thursdayClose: [''],
      fridayClose: [''],
      saturdayClose: [''],
      sundayClose: [''],
      imageUrl: [''],
      phone: [''],
      email: ['', Validators.email],
      city: ['', Validators.required],
      address: ['', Validators.required],
      googlePlaceId: [''],
      type: [''], //Coordinates type
      lat: ['', Validators.required],
      lon: ['', Validators.required],
      employees: [''],
      dishes: [''],
      rewards: [''],
      statistics: [''],
      badges: [''],
    });

    this.newRewardForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      pointsRequired: [0, [Validators.min(0)]]
    });

    this.searchControl = new FormControl('');
  }

  ngOnInit(): void {
    this.load();

    this.searchControl.valueChanges.subscribe(value => {
      const term = value?.toLowerCase() ?? '';
  
      this.filteredRestaurants = this.restaurants.filter(restaurant =>
        restaurant.profile.name.toLowerCase().includes(term)
      );
    }); 
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    this.api.getRestaurants().subscribe({
      next: (res) => {
        this.restaurants = res;
        this.filteredRestaurants = [...this.restaurants];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Could not load restaurants.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  trackById(_index: number, restaurant: IRestaurant): string | undefined {
    return restaurant._id;
  }

  toggleShowForm(): void {
    if (this.editting) {
      this.showForm = true;
      this.editting = false;
      this.restaurantForm.patchValue({
        name: ""
      });
    }
    else { this.showForm = !this.showForm; }
  }

  showMore(): void {
    this.showAllRestaurants = true;
  } 

  get visibleRestaurants(): IRestaurant[] {
    if (this.showAllRestaurants) {
      return this.filteredRestaurants;
    }
    return this.filteredRestaurants.slice(0, this.limit);
  }

  edit(restaurant: IRestaurant): void {
    this.showForm = true;
    this.editting = true;
    this.restaurantEditId = restaurant._id;

    this.restaurantForm.patchValue({
      name: restaurant.profile.name
    });
  }

  // save(): void {
  //   if (this.restaurantForm.invalid) return;

  //   const name: string = this.restaurantForm.value.name;

  //   if (this.editting && this.restaurantEditId) {

  //     this.api.updateRestaurant(this.restaurantEditId, name)
  //       .subscribe({
  //         next: () => {
  //           this.resetForm();
  //           this.load();
  //         },
  //         error: () => {
  //           this.errorMsg = 'Could not update the restaurant.';
  //         }
  //       });

  //   } else {
  //     this.api.createRestaurant(name)
  //       .subscribe({
  //         next: () => {
  //           this.resetForm();
  //           this.load();
  //         },
  //         error: () => {
  //           this.errorMsg = 'Could not create the restaurant.';
  //         }
  //       });
  //   }
  // }

  toggleExpand(id: string): void {
    this.expanded[id] = !this.expanded[id];
  }

  resetForm(): void {
    this.showForm = false;
    this.editting = false;
    this.restaurantEditId = undefined;
    this.restaurantForm.reset();
  }

  // Function editRestaurant not yet implemented
  //
  // editRestaurant(restaurant: IRestaurant) {
  //   const newName = prompt('New name:', restaurant.profile.name);

  //   if (newName && newName.trim() !== '' && restaurant._id != null) {
  //     this.api.updateRestaurant(restaurant._id, newName)
  //       .subscribe(() => { restaurant.profile.name = newName; });
  //   }
  // }

  confirmDelete(id: string, name?: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: name
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.delete(id);
      }
    });
  }

  delete(id: string): void {
    this.errorMsg = '';
    this.loading = true;
    this.cdr.markForCheck();

    this.api.deleteRestaurant(id).subscribe({
      next: () => {
        this.load();
      },
      error: () => {
        this.errorMsg = 'Error delete';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleRewardForm(restaurantId: string): void {
    this.showRewardForm[restaurantId] = !this.showRewardForm[restaurantId];
    if (this.showRewardForm[restaurantId]) {
      this.newRewardForm.reset();
      this.newRewardForm.patchValue({ pointsRequired: 0 });
    }
  }

  saveReward(restaurant: IRestaurant): void {
    if (this.newRewardForm.invalid || !restaurant._id) return;

    this.loading = true;
    this.cdr.markForCheck();

    const data: Partial<IReward> = {
      restaurant_id: restaurant._id,
      name: this.newRewardForm.value.name,
      description: this.newRewardForm.value.description,
      pointsRequired: this.newRewardForm.value.pointsRequired,
      active: true
    };

    this.rewardApi.createReward(data).subscribe({
      next: (savedReward) => {
        if (!restaurant.rewards) restaurant.rewards = [];
        restaurant.rewards.push(savedReward);
        this.showRewardForm[restaurant._id!] = false;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Could not add reward.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  removeReward(restaurant: IRestaurant, reward: any): void {
    const rewardName = reward.name || 'this reward';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: `Delete ${rewardName}?`
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const rewardId = reward._id || reward.id;
        if (!rewardId) return;

        this.loading = true;
        this.cdr.markForCheck();

        this.rewardApi.deleteReward(rewardId).subscribe({
          next: () => {
            if (restaurant.rewards) {
              restaurant.rewards = restaurant.rewards.filter((r: any) => (r._id || r.id || r) !== rewardId);
            }
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.errorMsg = 'Could not remove reward.';
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
      }
    });
  }
}

