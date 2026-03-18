import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass, TitleCasePipe } from '@angular/common';
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
import { MatCardModule } from '@angular/material/card';
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
    MatCardModule,
    NgxSkeletonLoaderModule,
    CurrencyPipe,
    DatePipe,
    NgClass,
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

  // Summary stats (computed from filtered data)
  totalTransactions = 0;
  paidTotalAmount = 0;
  paidTotalQuantity = 0;
  topPaidCategory = '—';
  paidByCity: { city: string; amount: number; count: number }[] = [];
  summaryHighlight = false;

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

          this.dataSource.sortingDataAccessor = (row: Purchase, col: string) => {
            if (col === 'date') return new Date(row.date).getTime();
            if (col === 'amount') return row.amount;
            return (row as Record<string, any>)[col];
          };

          this.updateSummary();
        });
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.dataSource.filter = Date.now().toString();
    this.updateSummary();
    this.triggerHighlight();
  }

  private triggerHighlight(): void {
    this.summaryHighlight = false;
    requestAnimationFrame(() => this.summaryHighlight = true);
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

  private updateSummary(): void {
    const filtered = this.dataSource.filteredData;
    this.totalTransactions = filtered.length;

    const paidRows = filtered.filter(r => r.status === 'paid');
    this.paidTotalAmount = paidRows.reduce((sum, r) => sum + r.amount, 0);
    this.paidTotalQuantity = paidRows.reduce((sum, r) => sum + r.quantity, 0);

    // Top category by paid amount
    const categoryTotals = new Map<string, number>();
    for (const row of paidRows) {
      categoryTotals.set(row.category, (categoryTotals.get(row.category) ?? 0) + row.amount);
    }
    let topCat = '—';
    let topAmount = 0;
    for (const [cat, amount] of categoryTotals) {
      if (amount > topAmount) {
        topCat = cat;
        topAmount = amount;
      }
    }
    this.topPaidCategory = topCat;

    // Paid amount grouped by city
    const cityMap = new Map<string, { amount: number; count: number }>();
    for (const row of paidRows) {
      const entry = cityMap.get(row.city) ?? { amount: 0, count: 0 };
      entry.amount += row.amount;
      entry.count++;
      cityMap.set(row.city, entry);
    }
    this.paidByCity = [...cityMap.entries()]
      .map(([city, data]) => ({ city, ...data }))
      .sort((a, b) => b.amount - a.amount);
  }
}
