import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListResponse {
  count: number;
  products: Product[];
}

export interface ProductResponse {
  message?: string;
  product: Product;
}

export interface ProductPayload {
  name: string;
  price: number;
  description: string;
}
@Service()
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/products';

  getProducts(): Observable<ProductListResponse> {
    return this.http.get<ProductListResponse>(this.apiUrl);
  }

  getProductById(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(
      `${this.apiUrl}/${encodeURIComponent(id)}`
    );
  }

  createProduct(payload: ProductPayload): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.apiUrl, payload);
  }

  updateProduct(
    id: string,
    payload: ProductPayload
  ): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(
      `${this.apiUrl}/${encodeURIComponent(id)}`,
      payload
    );
  }

  deleteProduct(id: string): Observable<{ message?: string }> {
    return this.http.delete<{ message?: string }>(
      `${this.apiUrl}/${encodeURIComponent(id)}`
    );
  }
}
