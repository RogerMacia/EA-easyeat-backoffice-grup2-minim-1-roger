import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../services/customer.service';
import { ReviewService } from '../services/review.service';
import { RestaurantService } from '../services/restaurant.service';

import { ICustomer } from '../models/customer.model';
import { IReview } from '../models/review.model';
import { IRestaurant } from '../models/restaurant.model';

import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './customer-list.html',
})
export class CustomerList implements OnInit {

  Math = Math;

  customers: ICustomer[] = [];
  filteredCustomers: ICustomer[] = [];

  customerEditId?: string;
  reviewsByCustomer: { [key: string]: IReview[] } = {};
  restaurants: IRestaurant[] = [];

  loading = true;
  errorMsg = '';

  searchControl = new FormControl('');

  customerForm!: FormGroup;
  reviewForm!: FormGroup;

  selectedCustomerId: string | null = null;
  editingReviewId: string | null = null;

  editting = false;
  showForm = false;

  expanded: { [key: string]: boolean } = {};

  showAllCustomers = false;
  limit = 10;

  reviewLimit = 1;
  reviewPage: { [key: string]: number } = {};
  reviewTotal: { [key: string]: number } = {};

  minRatingFilter: number | null = null;
  sortByLikes = false;

  constructor(
    private api: CustomerService,
    private reviewService: ReviewService,
    private restaurantService: RestaurantService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {

    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required,Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)]],
    });

    this.reviewForm = this.fb.group({
      restaurant_id: ['', Validators.required],
      rating: [null, [Validators.required, Validators.min(1), Validators.max(10)]],
      comment: ['']
    });
  }

  // ========================
  // INIT
  // ========================

  ngOnInit(): void {
    this.load();
    this.loadRestaurants();

    this.searchControl.valueChanges.subscribe(value => {
      const term = value?.toLowerCase().trim() ?? '';
      this.filteredCustomers = this.customers.filter(c =>
        c.name.toLowerCase().includes(term)
      );
    });
  }

  // ========================
  // CUSTOMERS
  // ========================

  load(): void {
    this.loading = true;
    this.errorMsg = '';

    this.api.getCustomers().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];

        this.customers = data;
        this.filteredCustomers = [...data];

        this.loading = false;
        this.cdr.detectChanges(); // 🔥 CLAVE
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Error loading customers';
        this.customers = [];
        this.filteredCustomers = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe({
      next: (res: any) => {
        this.restaurants = res?.data ?? res ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.restaurants = [];
        this.cdr.detectChanges();
      }
    });
  }

  guardar(): void {
    if (this.customerForm.invalid) return;

    const data = this.customerForm.value;

    const request = this.editting && this.customerEditId
      ? this.api.updateCustomer(this.customerEditId, data)
      : this.api.createCustomer(data);

    request.subscribe(() => {
      this.load();
      this.resetForm();
    });
  }

  delete(id: string): void {
    this.api.deleteCustomer(id).subscribe(() => this.load());
  }

  confirmDelete(id: string, name?: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: name });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.delete(id);
    });
  }

  edit(customer: ICustomer): void {
    this.showForm = true;
    this.editting = true;
    this.customerEditId = customer._id;

    this.customerForm.patchValue({
      name: customer.name,
      email: customer.email,
      password: ''
    });
  }

  resetForm(): void {
    this.showForm = false;
    this.editting = false;
    this.customerEditId = undefined;
    this.customerForm.reset();
  }

  toggleShowForm(): void {
    this.showForm = !this.showForm;
    this.editting = false;
    this.customerForm.reset();
  }

  get visibleCustomers(): ICustomer[] {
    return this.showAllCustomers
      ? this.filteredCustomers
      : this.filteredCustomers.slice(0, this.limit);
  }

  showMore(): void {
    this.showAllCustomers = true;
  }

  // ========================
  // REVIEWS
  // ========================

  toggleExpand(id: string): void {
    this.expanded[id] = !this.expanded[id];

    if (this.expanded[id]) {
      this.reviewPage[id] = 0;
      this.loadReviews(id);
    }
  }

loadReviews(customerId: string): void {
  const page = this.reviewPage[customerId] || 0;
  const skip = page * this.reviewLimit;

  this.reviewService.getByCustomer(
    customerId,
    this.reviewLimit,
    skip,
    this.minRatingFilter || undefined,
    this.sortByLikes
  ).subscribe((res: any) => {

    const reviews = res?.data ?? [];

    this.reviewsByCustomer = {
      ...this.reviewsByCustomer,
      [customerId]: reviews
    };

    //  FIX REAL
    this.reviewTotal[customerId] = res?.total ?? 0;

    this.cdr.detectChanges();
  });
}

  nextPage(customerId: string): void {
    const page = this.reviewPage[customerId] || 0;
    const total = this.reviewTotal[customerId] || 0;

    if ((page + 1) * this.reviewLimit >= total) return;

    this.reviewPage[customerId] = page + 1;
    this.loadReviews(customerId);
  }

  prevPage(customerId: string): void {
    if ((this.reviewPage[customerId] || 0) === 0) return;

    this.reviewPage[customerId]--;
    this.loadReviews(customerId);
  }

  openReviewForm(customerId: string): void {
    this.selectedCustomerId = customerId;
    this.editingReviewId = null;
    this.reviewForm.reset();
  }

  editReview(review: IReview): void {
    const customerId =
      typeof review.customer_id === 'string'
        ? review.customer_id
        : review.customer_id._id;

    this.selectedCustomerId = customerId;
    this.editingReviewId = review._id!;
    this.expanded[customerId] = true;

    this.reviewForm.patchValue({
      restaurant_id: review.restaurant_id._id,
      rating: review.rating,
      comment: review.comment ?? ''
    });
  }

  createReview(): void {
    if (this.reviewForm.invalid || !this.selectedCustomerId) return;

    if (this.editingReviewId) {
      const data = {
        rating: this.reviewForm.value.rating,
        comment: this.reviewForm.value.comment
      };

      this.reviewService.update(this.editingReviewId, data)
        .subscribe(() => this.finishReviewAction());

      return;
    }

    const restaurantId = this.reviewForm.value.restaurant_id;

    const exists = this.reviewsByCustomer[this.selectedCustomerId]?.find(
      r => r.restaurant_id._id === restaurantId
    );

    if (exists) {
      alert('Already reviewed');
      return;
    }

    const data = {
      ...this.reviewForm.value,
      customer_id: this.selectedCustomerId,
      date: new Date()
    };

    this.reviewService.create(data)
      .subscribe(() => this.finishReviewAction());
  }

  finishReviewAction(): void {
    const id = this.selectedCustomerId;

    this.reviewForm.reset();
    this.selectedCustomerId = null;
    this.editingReviewId = null;

    if (id) this.loadReviews(id);
  }

  deleteReview(reviewId: string, customerId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: 'Delete this review?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reviewService.delete(reviewId)
          .subscribe(() => this.loadReviews(customerId));
      }
    });
  }

  like(review: IReview): void {
    this.reviewService.like(review._id!)
      .subscribe(updated => review.likes = updated.likes);
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating / 2)).fill(0);
  }
}