import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Purchase } from '../../models/purchase.model';
import { PurchaseService } from '../../services/purchase.service';

@Component({
  selector: 'app-purchase-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
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

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.purchaseService.getPurchases().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
        // Sort and paginator must be set after data is loaded and view is rendered
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

  getStatusColor(status: Purchase['status']): string {
    switch (status) {
      case 'paid':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'cancelled':
        return 'warn';
      case 'refunded':
        return 'warn';
    }
  }
}
