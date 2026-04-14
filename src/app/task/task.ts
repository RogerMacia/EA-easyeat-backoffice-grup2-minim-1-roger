import { Component, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl, FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { TaskService } from '../services/task.service';
import { ITask } from '../models/task.model';

@Component({
  selector: 'app-task',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, FormsModule],
  templateUrl: './task.html',
  styleUrl: './task.css',
})
export class Task implements OnInit, OnChanges {
  @Input() restaurantId ='';
  tasks: ITask[] = [];
  loading: boolean = true;
  errorMsg: string = '';
  objectKeys = Object.keys;

  constructor(
    private api: TaskService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['restaurantId']) {
      this.load();
    }
  }

  load (): void {
    this.loading = true;
    this.errorMsg = '';
    if (!this.restaurantId) return;

    this.api.getByRestaurant(this.restaurantId).subscribe({
      next: (res: any) => {
        const data = res.data ?? res ?? [];
        if (!res) {
          this.api.create({
            restaurant_id: this.restaurantId,
            tasks: {},
          }).subscribe({
            next: (res: any) => {
              data.push(res.data ?? res ?? []);
            },
            error: (err: any) => {
                this.errorMsg = 'Error creating task';
                this.loading = false;
                this.cdr.markForCheck();
                return;
            }
          });
        }
        this.tasks = data;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  updateRestaurantId(id: string): void {
    this.restaurantId = id;
  }

  createTask(): void {
    if (!this.restaurantId) return;
    this.api.update(
      this.tasks[0]._id as string,
      {
        restaurant_id: this.restaurantId,
        tasks: { "": false },
      }
    ).subscribe({
      next: (res: any) => {
        this.load();
      },
      error: (err: any) => {
        this.errorMsg = 'Error creating task';
        this.loading = false;
        this.cdr.markForCheck();
        return;
      }
    });
  }

  updateTask(description: string, completed: boolean): void {
    if (!this.restaurantId) return;
    this.api.update(
      this.tasks[0]._id as string,
      {
        restaurant_id: this.restaurantId,
        tasks: { [description]: completed },
      }
    ).subscribe({
      next: (res: any) => {
        this.load();
      },
      error: (err: any) => {
        this.errorMsg = 'Error updating task';
        this.loading = false;
        this.cdr.markForCheck();
        return;
      }
    });
  }
}
