import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantService } from '../services/restaurant.service';
import { RewardService } from '../services/reward.service';
import { VisitService } from '../services/visit.service';
import { IRestaurant } from '../models/restaurant.model';
import { IReward } from '../models/reward.model';
import { IVisit } from '../models/visit.model';
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

  editingRewardId: string | null = null;
  editRewardForm!: FormGroup;

  restaurantVisits: { [key: string]: IVisit[] } = {};
  showVisitForm: { [key: string]: boolean } = {};
  newVisitForm!: FormGroup;
  editingVisitId: string | null = null;
  editVisitForm!: FormGroup;

  constructor(private api: RestaurantService, private rewardApi: RewardService, private visitApi: VisitService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private dialog: MatDialog) {
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

    this.editRewardForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      pointsRequired: [0, [Validators.min(0)]]
    });

    this.newVisitForm = this.fb.group({
      customer_id: ['', Validators.required],
      date: [new Date().toISOString().substring(0, 16), Validators.required],
      billAmount: [0, [Validators.min(0)]],
      pointsEarned: [0, [Validators.min(0)]]
    });

    this.editVisitForm = this.fb.group({
      date: ['', Validators.required],
      billAmount: [0, [Validators.min(0)]],
      pointsEarned: [0, [Validators.min(0)]]
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

  save(): void {
    if (this.restaurantForm.invalid) return;

    const name: string = this.restaurantForm.value.name;

    if (this.editting && this.restaurantEditId) {
      this.api.updateRestaurant(this.restaurantEditId, { profile: { name, description: '', category: [], location: { city: '', address: '' } } } as any)
        .subscribe({
          next: () => {
            this.resetForm();
            this.load();
          },
          error: () => {
            this.errorMsg = 'Could not update the restaurant.';
          }
        });
    } else {
      const newRestaurant: Partial<IRestaurant> = {
        profile: {
          name,
          description: this.restaurantForm.value.description || 'No description',
          category: this.restaurantForm.value.category ? [this.restaurantForm.value.category] : ['Italià'],
          location: {
            city: this.restaurantForm.value.city || 'Unknown',
            address: this.restaurantForm.value.address || '',
            coordinates: {
              type: 'Point' as any,
              coordinates: [
                parseFloat(this.restaurantForm.value.lon) || 0,
                parseFloat(this.restaurantForm.value.lat) || 0
              ]
            }
          }
        }
      };

      this.api.createRestaurant(newRestaurant)
        .subscribe({
          next: () => {
            this.resetForm();
            this.load();
          },
          error: () => {
            this.errorMsg = 'Could not create the restaurant.';
          }
        });
    }
  }

  toggleExpand(id: string): void {
    this.expanded[id] = !this.expanded[id];
    if (this.expanded[id] && !this.restaurantVisits[id]) {
      this.loading = true;
      this.visitApi.getVisitsByRestaurantId(id).subscribe({
        next: (visits) => {
          this.restaurantVisits[id] = visits;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMsg = 'Could not load visits.';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
    }
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

  startEditReward(reward: any): void {
    const rewardId = reward._id || reward.id || reward;
    if (!rewardId) return;
    this.editingRewardId = rewardId;
    this.editRewardForm.patchValue({
      name: reward.name || '',
      description: reward.description || '',
      pointsRequired: reward.pointsRequired !== undefined ? reward.pointsRequired : (reward.points || 0)
    });
  }

  cancelEditReward(): void {
    this.editingRewardId = null;
    this.editRewardForm.reset();
  }

  saveEditedReward(restaurant: IRestaurant): void {
    if (this.editRewardForm.invalid || !this.editingRewardId) return;

    this.loading = true;
    this.cdr.markForCheck();

    const data: Partial<IReward> = {
      name: this.editRewardForm.value.name,
      description: this.editRewardForm.value.description,
      pointsRequired: this.editRewardForm.value.pointsRequired
    };

    const targetRewardId = this.editingRewardId;

    this.rewardApi.updateReward(targetRewardId, data).subscribe({
      next: (updatedReward) => {
        if (restaurant.rewards) {
          const index = restaurant.rewards.findIndex((r: any) => (r._id || r.id || r) === targetRewardId);
          if (index !== -1) {
            restaurant.rewards[index] = updatedReward;
          }
        }
        this.editingRewardId = null;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Could not update reward.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleVisitForm(restaurantId: string): void {
    this.showVisitForm[restaurantId] = !this.showVisitForm[restaurantId];
    if (this.showVisitForm[restaurantId]) {
      this.newVisitForm.reset();
      this.newVisitForm.patchValue({ 
        date: new Date().toISOString().substring(0, 16),
        billAmount: 0, 
        pointsEarned: 0 
      });
    }
  }

  saveVisit(restaurantId: string): void {
    if (this.newVisitForm.invalid) return;

    this.loading = true;
    this.cdr.markForCheck();

    const data: Partial<IVisit> = {
      restaurant_id: restaurantId as any,
      customer_id: this.newVisitForm.value.customer_id,
      date: new Date(this.newVisitForm.value.date),
      billAmount: this.newVisitForm.value.billAmount,
      pointsEarned: this.newVisitForm.value.pointsEarned
    };

    this.visitApi.createVisit(data).subscribe({
      next: (savedVisit) => {
        if (!this.restaurantVisits[restaurantId]) this.restaurantVisits[restaurantId] = [];
        this.showVisitForm[restaurantId] = false;
        
        this.visitApi.getVisitsByRestaurantId(restaurantId).subscribe(visits => {
           this.restaurantVisits[restaurantId] = visits;
           this.loading = false;
           this.cdr.markForCheck();
        });
      },
      error: () => {
        this.errorMsg = 'Could not add visit.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  removeVisit(restaurantId: string, visit: IVisit): void {
    const customerName = visit.customer_id?.name || 'this customer';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: `Delete visit from ${customerName}?`
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const visitId = visit._id || visit.id;
        if (!visitId) return;

        this.loading = true;
        this.cdr.markForCheck();

        this.visitApi.deleteVisit(visitId).subscribe({
          next: () => {
            if (this.restaurantVisits[restaurantId]) {
              this.restaurantVisits[restaurantId] = this.restaurantVisits[restaurantId].filter((v: IVisit) => (v._id || v.id) !== visitId);
            }
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.errorMsg = 'Could not remove visit.';
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  startEditVisit(visit: any): void {
    const visitId = visit._id || visit.id;
    if (!visitId) return;
    this.editingVisitId = visitId;
    
    let dateStr = '';
    if (visit.date) {
      const d = new Date(visit.date);
      if (!isNaN(d.getTime())) {
         dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().substring(0, 16);
      }
    }
    
    this.editVisitForm.patchValue({
      date: dateStr,
      billAmount: visit.billAmount || 0,
      pointsEarned: visit.pointsEarned || 0
    });
  }

  cancelEditVisit(): void {
    this.editingVisitId = null;
    this.editVisitForm.reset();
  }

  saveEditedVisit(restaurantId: string): void {
    if (this.editVisitForm.invalid || !this.editingVisitId) return;

    this.loading = true;
    this.cdr.markForCheck();

    const data: Partial<IVisit> = {
      date: new Date(this.editVisitForm.value.date),
      billAmount: this.editVisitForm.value.billAmount,
      pointsEarned: this.editVisitForm.value.pointsEarned
    };

    const targetVisitId = this.editingVisitId;

    this.visitApi.updateVisit(targetVisitId, data).subscribe({
      next: () => {
        this.visitApi.getVisitsByRestaurantId(restaurantId).subscribe({
           next: (visits) => {
             this.restaurantVisits[restaurantId] = visits;
             this.editingVisitId = null;
             this.loading = false;
             this.cdr.markForCheck();
           }
        });
      },
      error: () => {
        this.errorMsg = 'Could not update visit.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}

