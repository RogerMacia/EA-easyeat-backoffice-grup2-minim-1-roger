import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../services/customer.service';
import { ICustomer } from '../models/customer.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './customer-list.html',
  
})
export class CustomerList implements OnInit {
  filteredCustomers: ICustomer[] = [];
  customers: ICustomer[] = [];
  loading = true;
  errorMsg = '';
  searchControl = new FormControl('');
  customerForm!: FormGroup;
  editting = false;
  showForm = false;
  showAllCustomers = false;
  limit=10;
  customerEditId: string | undefined;
  expanded: { [key: string]: boolean } = {};

  constructor(private api: CustomerService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private dialog: MatDialog) {
      this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.searchControl = new FormControl('');
  }

  ngOnInit(): void {
    this.load();

    this.searchControl.valueChanges.subscribe(value => {
      const term = value?.toLowerCase() ?? '';
  
      this.filteredCustomers = this.customers.filter(customer =>
        customer.name.toLowerCase().includes(term)
      );
    }); 
  }

  load(): void {
   this.loading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    this.api.getCustomers().subscribe({
      next: (res: any) => {
        this.customers = res.data;
        this.filteredCustomers = [...this.customers];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Could not load customers.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

guardar(): void {
  if (this.customerForm.invalid) return;

  const data = this.customerForm.value;
  console.log('ENVIANDO:', data);
  if (this.editting && this.customerEditId) {
    this.api.updateCustomer(this.customerEditId, data).subscribe(() => {
      this.load();
      this.resetForm();
    });
  } else {
    this.api.createCustomer(data).subscribe(() => {
      this.load();
      this.resetForm();
    });
  }
}


  delete(id: string) {
    this.api.deleteCustomer(id).subscribe(() => {
      this.load();
    });
  }
  trackById(_index: number, customer: ICustomer): string | undefined {
    return customer._id;
  }
  toggleShowForm(): void {
    if (this.editting) {
      this.showForm = true;
      this.editting = false;
      this.customerForm.patchValue({
        name: ""
      });
    }
    else { this.showForm = !this.showForm; }
  }
showMore(): void {
    this.showAllCustomers = true;
  } 

get visibleCustomers(): ICustomer[] {
    if (this.showAllCustomers) {
      return this.filteredCustomers;
    }
    return this.filteredCustomers.slice(0, this.limit);
  }

  edit(customer: ICustomer): void {
    this.showForm = true;
    this.editting = true;
    this.customerEditId = customer._id;

    this.customerForm.patchValue({
      name: customer.name
    });
  }
  toggleExpand(id: string): void {
    this.expanded[id] = !this.expanded[id];
  }

  resetForm(): void {
    this.showForm = false;
    this.editting = false;
    this.customerEditId = undefined;
    this.customerForm.reset();
  }

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

  /*delete(id: string): void {
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
  }*/
}