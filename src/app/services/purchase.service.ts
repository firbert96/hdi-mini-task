import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Purchase } from '../models/purchase.model';
import rawData from '../../../public/dataset.json';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  getPurchases(): Observable<Purchase[]> {
    return of(rawData as Purchase[]);
  }
}
