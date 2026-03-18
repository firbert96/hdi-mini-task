import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Purchase } from '../../models/purchase.model';
import { PurchaseService } from '../../services/purchase.service';

@Component({
  selector: 'app-purchase-table',
  standalone: true,
  imports: [
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    NgxSkeletonLoaderModule,
    CurrencyPipe,
    DatePipe,
    TitleCasePipe,
  ],
  templateUrl: './purchase-table.component.html',
  styleUrl: './purchase-table.component.scss',
})
export class PurchaseTableComponent implements OnInit {
  private readonly purchaseService = inject(PurchaseService);

  displayedColumns: string[] = [
    'id',
    'memberName',
    'city',
    'category',
    'amount',
    'quantity',
    'date',
    'status',
  ];

  dataSource = new MatTableDataSource<Purchase>();
  loading = true;
  skeletonRows = Array(5);

  // Filter values
  searchName = '';
  selectedCity = '';
  selectedCategory = '';
  selectedStatus = '';

  // Unique filter options derived from data
  cities: string[] = [];
  categories: string[] = [];
  statuses: string[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.purchaseService.getPurchases().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;

        // Extract unique filter options
        this.cities = [...new Set(data.map(d => d.city))].sort();
        this.categories = [...new Set(data.map(d => d.category))].sort();
        this.statuses = [...new Set(data.map(d => d.status))].sort();

        // Custom filter predicate for combined filters
        this.dataSource.filterPredicate = (row: Purchase) => {
          const matchesName = !this.searchName ||
            row.memberName.toLowerCase().includes(this.searchName.toLowerCase());
          const matchesCity = !this.selectedCity || row.city === this.selectedCity;
          const matchesCategory = !this.selectedCategory || row.category === this.selectedCategory;
          const matchesStatus = !this.selectedStatus || row.status === this.selectedStatus;
          return matchesName && matchesCity && matchesCategory && matchesStatus;
        };

        setTimeout(() => {
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    // Trigger filter — value doesn't matter since filterPredicate reads component fields
    this.dataSource.filter = Date.now().toString();
  }

  clearFilters(): void {
    this.searchName = '';
    this.selectedCity = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchName || this.selectedCity || this.selectedCategory || this.selectedStatus);
  }
}
