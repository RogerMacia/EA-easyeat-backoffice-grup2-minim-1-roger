import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationService } from '../services/organization.service';
import { Organization } from '../models/organization.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './organization-list.html',
  styleUrls: ['./organization-list.css'],
})
export class OrganizationList implements OnInit {
  organizations: Organization[] = [];
  filteredOrgs: Organization[] = [];
  searchControl = new FormControl('');
  loading = true;
  errorMsg = '';
  showForm = false;
  organizationForm!: FormGroup;
  editting = false;
  orgEditId: string | null = null;
  expanded: { [key: string]: boolean } = {};
  limit = 10;
  showAllOrg = false;
  
  constructor(private api: OrganizationService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private dialog: MatDialog) {
    this.organizationForm = this.fb.group({
      name: ['', Validators.required],
    });

    this.searchControl = new FormControl('');
  }

  ngOnInit(): void {
    this.load();

    this.searchControl.valueChanges.subscribe(value => {
      const term = value?.toLowerCase() ?? '';
  
      this.filteredOrgs = this.organizations.filter(org =>
        org.name.toLowerCase().includes(term)
      );
    }); 
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.api.getOrganizations().subscribe({
      next: (res) => {
        this.organizations = res;
        this.filteredOrgs = [...this.organizations];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Could not load organizations.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  trackById(_index: number, org: Organization): string {
    return org._id;
  }

  showOrgForm(): void {
  this.showForm = true;
  }

  showMore(): void {
  this.showAllOrg = true;
  } 

  get visibleOrgs(): Organization[] {
    if (this.showAllOrg) {
      return this.filteredOrgs;
    }
    return this.filteredOrgs.slice(0, this.limit);
  }

  edit(org: Organization): void {
    this.showForm = true;
    this.editting = true;
    this.orgEditId = org._id;

    this.organizationForm.patchValue({
      name: org.name
    });
  }

  save(): void {
    if (this.organizationForm.invalid) return;

    const name = this.organizationForm.value.name;

    if (this.editting && this.orgEditId) {

      this.api.updateOrganization(this.orgEditId, name)
        .subscribe({
          next: () => {
            this.resetForm();
            this.load();
          },
          error: () => {
            this.errorMsg = 'Could not update the organization.';
          }
        });

    } else {
      this.api.createOrganization(name)
        .subscribe({
          next: () => {
            this.resetForm();
            this.load();
          },
          error: () => {
            this.errorMsg = 'Could not create the organization.';
          }
        });
    }
  }

  toggleExpand(id: string): void {
    this.expanded[id] = !this.expanded[id];
  }

  resetForm(): void {
    this.showForm = false;
    this.editting = false;
    this.orgEditId = null;
    this.organizationForm.reset();
  }

  editOrganization(org: Organization) {
    const newName = prompt('New name:', org.name);

    if (newName && newName.trim() !== '') {

      this.api.updateOrganization(org._id, newName)
        .subscribe(() => { org.name = newName; });
    }
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

  delete(id: string): void {
    this.errorMsg = '';
    this.loading = true;

    this.api.deleteOrganization(id).subscribe({
      next: () => {
        this.load();
      },
      error: () => {
        this.errorMsg = 'Error delete';
        this.loading = false;
      }
    });
  }

//   getFormattedName(org: Organization): string {
//     if (org.name.length <= 15) {
//       return org.name;
//     } else if (!this.expanded[org._id]) {
//       return org.name.slice(0, 15) + '...';
//     } else {
//       const parts: string[] = [];
//       for (let i = 0; i < org.name.length; i += 50) {
//         parts.push(org.name.slice(i, i + 50));
//       }
//       return parts.join('<br>');
//     }
//   }
}
