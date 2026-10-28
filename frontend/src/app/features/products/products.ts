import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Product, ProductPayload, ProductService } from '../../core/services/product';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, FormsModule],
  selector: 'app-products',
  styleUrl: './products.scss',
  templateUrl: './products.html',
})
export class Products {
private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  products: Product[] = [];
  selectedProduct: Product | null = null;

  loading = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';
  editingProductId: string | null = null;

  readonly productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    price: [0, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: (response) => {
        this.loading = false;
        this.products = response.products;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to load products.'
        );
        this.changeDetector.markForCheck();
      },
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid || this.submitting) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.getRawValue();

    const payload: ProductPayload = {
      name: formValue.name.trim(),
      price: Number(formValue.price),
      description: formValue.description.trim(),
    };

    if (!payload.name || !payload.description) {
      this.errorMessage = 'Name and description cannot be blank.';
      return;
    }

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      this.errorMessage = 'Enter a valid non-negative price.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request$ = this.editingProductId
      ? this.productService.updateProduct(this.editingProductId, payload)
      : this.productService.createProduct(payload);

    request$.subscribe({
      next: (response) => {
        this.successMessage = this.editingProductId
          ? 'Product updated successfully.'
          : 'Product added successfully.';

        this.submitting = false;
        this.resetForm();
        this.loadProducts();

        if (response.product) {
          this.selectedProduct = response.product;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to save the product.'
        );
      },
    });
  }

  viewProduct(product: Product): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.productService.getProductById(product._id).subscribe({
      next: (response) => {
        this.selectedProduct = response.product;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to load product details.'
        );
      },
    });
  }

  editProduct(product: Product): void {
    this.editingProductId = product._id;
    this.selectedProduct = product;
    this.errorMessage = '';
    this.successMessage = '';

    this.productForm.setValue({
      name: product.name,
      price: product.price,
      description: product.description,
    });
  }

  deleteProduct(product: Product): void {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.productService.deleteProduct(product._id).subscribe({
      next: () => {
        this.successMessage = 'Product deleted successfully.';

        if (this.selectedProduct?._id === product._id) {
          this.selectedProduct = null;
        }

        if (this.editingProductId === product._id) {
          this.resetForm();
        }

        this.loadProducts();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to delete the product.'
        );
      },
    });
  }

  cancelEdit(): void {
    this.resetForm();
    this.errorMessage = '';
    this.successMessage = '';
  }

  private resetForm(): void {
    this.editingProductId = null;
    this.productForm.reset({
      name: '',
      price: 0,
      description: '',
    });
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {
    if (error.status === 0) {
      return 'Cannot connect to the backend. Check that it is running.';
    }

    if (error.status === 401) {
      return 'Your session is invalid or expired. Please sign in again.';
    }

    if (error.status === 400) {
      return error.error?.message || 'Please check the submitted product details.';
    }

    if (error.status === 404) {
      return error.error?.message || 'The requested product was not found.';
    }

    return error.error?.message || fallback;
  }
}
