import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { vi } from 'vitest';
import { PurchaseTableComponent } from './purchase-table.component';
import { PurchaseService } from '../../services/purchase.service';
import { Purchase } from '../../models/purchase.model';
import { of } from 'rxjs';

const MOCK_DATA: Purchase[] = [
  { id: 'TX001', memberId: 'M001', memberName: 'Andi', city: 'Jakarta', category: 'Supplement', amount: 100000, quantity: 2, date: '2025-01-10', status: 'paid' },
  { id: 'TX002', memberId: 'M002', memberName: 'Budi', city: 'Bandung', category: 'Personal Care', amount: 50000, quantity: 1, date: '2025-01-12', status: 'pending' },
  { id: 'TX003', memberId: 'M003', memberName: 'Citra', city: 'Jakarta', category: 'Home Care', amount: 75000, quantity: 3, date: '2025-02-01', status: 'paid' },
  { id: 'TX004', memberId: 'M004', memberName: 'Dewi', city: 'Surabaya', category: 'Supplement', amount: 200000, quantity: 5, date: '2025-02-15', status: 'cancelled' },
  { id: 'TX005', memberId: 'M005', memberName: 'Eko', city: 'Bandung', category: 'Supplement', amount: 120000, quantity: 4, date: '2025-03-01', status: 'paid' },
  { id: 'TX006', memberId: 'M006', memberName: 'Fira', city: 'Jakarta', category: 'Personal Care', amount: 30000, quantity: 1, date: '2025-03-10', status: 'refunded' },
];

describe('PurchaseTableComponent', () => {
  let component: PurchaseTableComponent;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [PurchaseTableComponent],
      providers: [
        provideAnimationsAsync(),
        {
          provide: PurchaseService,
          useValue: { getPurchases: () => of(MOCK_DATA) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PurchaseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    vi.runAllTimers(); // flush setTimeout in ngOnInit
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---------- Initialization ----------

  it('should load data and set loading to false', () => {
    expect(component.loading).toBe(false);
    expect(component.dataSource.data.length).toBe(6);
  });

  it('should extract unique filter options sorted alphabetically', () => {
    expect(component.cities).toEqual(['Bandung', 'Jakarta', 'Surabaya']);
    expect(component.categories).toEqual(['Home Care', 'Personal Care', 'Supplement']);
    expect(component.statuses).toEqual(['cancelled', 'paid', 'pending', 'refunded']);
  });

  // ---------- Filtering ----------

  it('should filter by member name (case-insensitive)', () => {
    component.searchName = 'andi';
    component.applyFilters();
    expect(component.dataSource.filteredData.length).toBe(1);
    expect(component.dataSource.filteredData[0].id).toBe('TX001');
  });

  it('should filter by city', () => {
    component.selectedCity = 'Jakarta';
    component.applyFilters();
    expect(component.dataSource.filteredData.length).toBe(3);
    expect(component.dataSource.filteredData.every(r => r.city === 'Jakarta')).toBe(true);
  });

  it('should filter by category', () => {
    component.selectedCategory = 'Supplement';
    component.applyFilters();
    expect(component.dataSource.filteredData.length).toBe(3);
  });

  it('should filter by status', () => {
    component.selectedStatus = 'paid';
    component.applyFilters();
    expect(component.dataSource.filteredData.length).toBe(3);
    expect(component.dataSource.filteredData.every(r => r.status === 'paid')).toBe(true);
  });

  it('should apply AND logic across multiple filters', () => {
    component.selectedCity = 'Jakarta';
    component.selectedStatus = 'paid';
    component.applyFilters();
    // TX001 (Jakarta, paid) + TX003 (Jakarta, paid)
    expect(component.dataSource.filteredData.length).toBe(2);
  });

  it('should clear all filters', () => {
    component.searchName = 'Andi';
    component.selectedCity = 'Jakarta';
    component.applyFilters();
    expect(component.dataSource.filteredData.length).toBe(1);

    component.clearFilters();
    expect(component.searchName).toBe('');
    expect(component.selectedCity).toBe('');
    expect(component.dataSource.filteredData.length).toBe(6);
  });

  it('should report hasActiveFilters correctly', () => {
    expect(component.hasActiveFilters).toBe(false);
    component.selectedStatus = 'paid';
    expect(component.hasActiveFilters).toBe(true);
  });

  // ---------- Summary / Aggregation ----------

  it('should compute summary from all data initially', () => {
    // 6 total rows
    expect(component.totalTransactions).toBe(6);
    // paid rows: TX001 (100k), TX003 (75k), TX005 (120k) = 295k
    expect(component.paidTotalAmount).toBe(295000);
    // paid quantities: 2 + 3 + 4 = 9
    expect(component.paidTotalQuantity).toBe(9);
  });

  it('should find top paid category', () => {
    // Supplement: 100k + 120k = 220k, Home Care: 75k → Supplement wins
    expect(component.topPaidCategory).toBe('Supplement');
  });

  it('should group paid amount by city sorted descending', () => {
    // Jakarta paid: 100k + 75k = 175k (2 txns), Bandung paid: 120k (1 txn)
    expect(component.paidByCity.length).toBe(2);
    expect(component.paidByCity[0]).toEqual({ city: 'Jakarta', amount: 175000, count: 2 });
    expect(component.paidByCity[1]).toEqual({ city: 'Bandung', amount: 120000, count: 1 });
  });

  it('should update summary reactively when filters change', () => {
    component.selectedCity = 'Bandung';
    component.applyFilters();

    // Bandung rows: TX002 (pending), TX005 (paid)
    expect(component.totalTransactions).toBe(2);
    expect(component.paidTotalAmount).toBe(120000);
    expect(component.paidTotalQuantity).toBe(4);
    expect(component.topPaidCategory).toBe('Supplement');
    expect(component.paidByCity).toEqual([{ city: 'Bandung', amount: 120000, count: 1 }]);
  });

  it('should show dash for topPaidCategory when no paid rows exist', () => {
    component.selectedStatus = 'cancelled';
    component.applyFilters();
    expect(component.topPaidCategory).toBe('—');
    expect(component.paidTotalAmount).toBe(0);
    expect(component.paidByCity.length).toBe(0);
  });
});
