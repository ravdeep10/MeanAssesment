import { Service } from '@angular/core';

import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Order {
  _id: string;
  orderId: string;
  userId: number;
  productIds: string[];
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderListResponse {
  count: number;
  orders: Order[];
}

export interface OrderResponse {
  message?: string;
  order: Order;
}

export interface OrderPayload {
  productIds: string[];
}
@Service()
export class OrderService {
private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.serverUrl}/orders`;

  getOrders(): Observable<OrderListResponse> {
    return this.http.get<OrderListResponse>(this.apiUrl);
  }

  getOrderById(orderId: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(
      `${this.apiUrl}/${encodeURIComponent(orderId)}`
    );
  }

  createOrder(payload: OrderPayload): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, payload);
  }

  updateOrder(
    orderId: string,
    payload: OrderPayload
  ): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(
      `${this.apiUrl}/${encodeURIComponent(orderId)}`,
      payload
    );
  }

  deleteOrder(orderId: string): Observable<{ message?: string }> {
    return this.http.delete<{ message?: string }>(
      `${this.apiUrl}/${encodeURIComponent(orderId)}`
    );
  }
}
