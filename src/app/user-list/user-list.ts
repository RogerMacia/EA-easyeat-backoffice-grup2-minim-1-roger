import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { Organization } from '../models/organization.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css'],
})

export class UserList implements OnInit {
  users: User[] = [];
  organizations: Organization[] = [];
  filteredUsers: User[] = [];
  searchControl = new FormControl('');
  loading = false;
  errorMsg = '';
  showForm = false;
  userForm!: FormGroup;
  editting = false;
  userEditId: string | null = null;
  expanded: { [key: string]: boolean } = {};
  limit = 10;
  showAllUsers = false;

  constructor(private api: UserService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private dialog: MatDialog) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      organization: ['', Validators.required],
    });

    this.searchControl = new FormControl('');
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  //Función: leer
  ngOnInit(): void {
    this.load();
    this.loadOrgs();
    
    this.searchControl.valueChanges.subscribe(value => {
      const term = value?.toLowerCase() ?? '';
  
      this.filteredUsers = this.users.filter(org =>
        org.name.toLowerCase().includes(term)
      );
    });
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.api.getUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.filteredUsers = [...this.users];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Could not load users.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  trackById(_index: number, u: User): string {
    return u._id;
  }

  organizationLabel(u: User): string {
    const org = u.organization;
    if (!org) return '-';
    if (typeof org === 'string') return org; 
    return (org as Organization).name ?? '-';
  }

  showUserForm(): void {
    this.showForm = true;
  }

  loadOrgs(): void {
    this.api.getOrganizations().subscribe({
      next: (res) => {
        this.organizations = res;
        console.log('Organizations:', this.organizations);
      },
      error: (err) => console.error(err)
    });
  }

  showMore(): void {
  this.showAllUsers = true;
  } 

  get visibleUsers(): User[] {
    if (this.showAllUsers) {
      return this.filteredUsers;
    }
    return this.filteredUsers.slice(0, this.limit);
  }
  
  save(): void {
    if (this.userForm.invalid) return;

    const { name, email, password, organization } = this.userForm.value;

    if (this.editting && this.userEditId) {
      // UPDATE: pasamos id, name, email, password, organization
      this.api.updateUser(this.userEditId, name, email, password, organization)
        .subscribe({
          next: () => {
            this.resetForm();
            this.load();
          },
          error: (err) => {
            console.error(err);
            this.errorMsg = 'Could not update user.';
          }
        });
    } else {
      this.api.createUser(name, email, password, organization)
        .subscribe({
          next: () => {
            this.resetForm();
            this.load();
          },
          error: (err) => {
            console.error(err);
            this.errorMsg = 'Could not create user.';
          }
        });
    }
  }

  toggleExpand(id: string): void {
    this.expanded[id] = !this.expanded[id];
  }

  confirmDelete(id: string, name: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: name
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.delete(id);
      }
    });
  }

  edit(user: User): void {
    this.showForm = true;
    this.editting = true;
    this.userEditId = user._id;

    this.userForm.patchValue({
      name: user.name,
      organization: typeof user.organization === 'string'
        ? user.organization
        : (user.organization as Organization)?._id
    });
  }

  resetForm(): void {
    this.showForm = false;
    this.editting = false;
    this.userEditId = null;
    this.userForm.reset();
  }

  delete(id: string): void {
    this.errorMsg = '';
    this.loading = true;

    this.api.deleteUser(id).subscribe({
      next: () => {
        this.load();
      },
      error: () => {
        this.errorMsg = 'Error delete';
        this.loading = false;
      }
    });
  }
}
