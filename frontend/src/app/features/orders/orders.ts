import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Order, OrderPayload, OrderService } from '../../core/services/order';
import { Product, ProductService } from '../../core/services/product';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  imports: [FormsModule,RouterLink, CurrencyPipe, DatePipe],
  selector: 'app-orders',
  styleUrl: './orders.scss',
  templateUrl: './orders.html',
})
export class Orders {
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  products: Product[] = [];
  orders: Order[] = [];

  selectedProductIds: string[] = [];
  editingOrderId: string | null = null;
  selectedOrder: Order | null = null;

  loadingProducts = false;
  loadingOrders = false;
  submitting = false;

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadProducts();
    this.loadOrders();
  }

  loadProducts(): void {
    this.loadingProducts = true;

    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products = response.products;
        this.loadingProducts = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.loadingProducts = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to load products.'
        );
        this.changeDetector.markForCheck();
      },
    });
  }

  loadOrders(): void {
    this.loadingOrders = true;

    this.orderService.getOrders().subscribe({
      next: (response) => {
        this.orders = response.orders;
        this.loadingOrders = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.loadingOrders = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to load orders.'
        );
        this.changeDetector.markForCheck();
      },
    });
  }

  toggleProduct(productId: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedProductIds.includes(productId)) {
        this.selectedProductIds = [
          ...this.selectedProductIds,
          productId,
        ];
      }
      return;
    }

    this.selectedProductIds = this.selectedProductIds.filter(
      (id) => id !== productId
    );
  }

  isProductSelected(productId: string): boolean {
    return this.selectedProductIds.includes(productId);
  }

  get selectedProducts(): Product[] {
    return this.products.filter((product) =>
      this.selectedProductIds.includes(product._id)
    );
  }

  get estimatedTotal(): number {
    return this.selectedProducts.reduce(
      (sum, product) => sum + product.price,
      0
    );
  }

  saveOrder(): void {
    if (this.submitting) {
      return;
    }

    if (this.selectedProductIds.length === 0) {
      this.errorMessage = 'Select at least one product.';
      this.successMessage = '';
      return;
    }

    const payload: OrderPayload = {
      productIds: [...this.selectedProductIds],
    };

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request$ = this.editingOrderId
      ? this.orderService.updateOrder(this.editingOrderId, payload)
      : this.orderService.createOrder(payload);

    request$.subscribe({
      next: (response) => {
        this.submitting = false;

        this.successMessage = this.editingOrderId
          ? 'Order updated successfully.'
          : 'Order created successfully.';

        this.selectedOrder = response.order;
        this.resetEditor();
        this.loadOrders();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to save the order.'
        );
      },
    });
  }

  viewOrder(order: Order): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.orderService.getOrderById(order.orderId).subscribe({
      next: (response) => {
        this.selectedOrder = response.order;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to load order details.'
        );
      },
    });
  }

  editOrder(order: Order): void {
    this.editingOrderId = order.orderId;
    this.selectedOrder = order;
    this.selectedProductIds = [...order.productIds];

    this.errorMessage = '';
    this.successMessage = '';
  }

  deleteOrder(order: Order): void {
    const confirmed = window.confirm(
      `Delete order ${order.orderId}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.orderService.deleteOrder(order.orderId).subscribe({
      next: () => {
        this.successMessage = 'Order deleted successfully.';

        if (this.selectedOrder?.orderId === order.orderId) {
          this.selectedOrder = null;
        }

        if (this.editingOrderId === order.orderId) {
          this.resetEditor();
        }

        this.loadOrders();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to delete the order.'
        );
      },
    });
  }

  cancelEdit(): void {
    this.resetEditor();
    this.errorMessage = '';
    this.successMessage = '';
  }

  private resetEditor(): void {
    this.editingOrderId = null;
    this.selectedProductIds = [];
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {
    if (error.status === 0) {
      return 'Cannot connect to the backend. Check that it is running.';
    }

    if (error.status === 400) {
      return error.error?.message || 'Please check the selected products.';
    }

    if (error.status === 401) {
      return 'Your session is invalid or expired. Please sign in again.';
    }

    if (error.status === 404) {
      return error.error?.message || 'The requested order was not found.';
    }

    return error.error?.message || fallback;
  }
}
