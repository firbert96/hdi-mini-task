import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PurchaseTableComponent } from './components/purchase-table/purchase-table.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, PurchaseTableComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
