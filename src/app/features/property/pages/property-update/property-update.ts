import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ButtonModule } from 'primeng/button';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

import { PropertyService } from '../../../../core/services/property.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { IPropertyDetail, IUpdatePropertyPayload } from '../../models/IProperty';

@Component({
  selector: 'app-property-update',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    ButtonModule,
    FileUploadModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    DialogModule,
    TranslatePipe,
  ],
  templateUrl: './property-update.html',
  styleUrl: './property-update.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyUpdate implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly propertyService = inject(PropertyService);
  private readonly translationService = inject(TranslationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private readonly messageService = inject(MessageService);

  readonly propertyId = signal<number | null>(null);
  readonly propertyDetail = signal<IPropertyDetail | null>(null);
  readonly loadingProperty = signal(false);
  readonly submitting = signal(false);
  readonly saveConfirmDialogVisible = signal(false);
  readonly imageSelectionTouched = signal(false);

  readonly updateForm = this.fb.group({
    propertyType: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    finishingType: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    negotiable: this.fb.control<boolean | null>(null, { validators: [Validators.required] }),
    price: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    area: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    rooms: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    bathrooms: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    country: this.fb.nonNullable.control('', { validators: [Validators.maxLength(100)] }),
    governorate: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    city: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    district: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    street: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    buildingNumber: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    floorNumber: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    apartmentNumber: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  readonly negotiableOptions = computed(() => {
    this.translationService.currentLang();
    return [
      { label: this.translate.instant('PROPERTY_UPDATE.NEGOTIABLE_NOT_SET'), value: null },
      { label: this.translate.instant('PROPERTY_UPDATE.NEGOTIABLE_YES'), value: true },
      { label: this.translate.instant('PROPERTY_UPDATE.NEGOTIABLE_NO'), value: false },
    ];
  });

  readonly propertyTypeOptions = computed(() => {
    this.translationService.currentLang();
    return [
      { label: this.translate.instant('PROPERTY_UPDATE.PROPERTY_TYPES.APARTMENT'), value: 1 },
      { label: this.translate.instant('PROPERTY_UPDATE.PROPERTY_TYPES.VILLA'), value: 2 },
      { label: this.translate.instant('PROPERTY_UPDATE.PROPERTY_TYPES.STUDIO'), value: 3 },
      { label: this.translate.instant('PROPERTY_UPDATE.PROPERTY_TYPES.CHALET'), value: 4 },
      { label: this.translate.instant('PROPERTY_UPDATE.PROPERTY_TYPES.DUPLEX'), value: 5 },
      { label: this.translate.instant('PROPERTY_UPDATE.PROPERTY_TYPES.TOWNHOUSE'), value: 6 },
    ];
  });

  readonly finishingTypeOptions = computed(() => {
    this.translationService.currentLang();
    return [
      {
        label: this.translate.instant('PROPERTY_UPDATE.FINISHING_TYPES.WITHOUT_FINISHING'),
        value: 1,
      },
      { label: this.translate.instant('PROPERTY_UPDATE.FINISHING_TYPES.SEMI_FINISHED'), value: 2 },
      { label: this.translate.instant('PROPERTY_UPDATE.FINISHING_TYPES.FULLY_FINISHED'), value: 3 },
      { label: this.translate.instant('PROPERTY_UPDATE.FINISHING_TYPES.SUPER_LUX'), value: 4 },
    ];
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('PROPERTY_UPDATE.ERROR'),
        detail: this.translate.instant('PROPERTY_UPDATE.INVALID_ID'),
      });
      return;
    }

    this.propertyId.set(id);
    this.loadCurrentProperty(id);
  }

  openSaveConfirm(uploader: FileUpload): void {
    const selectedFiles = this.getSelectedFiles(uploader);

    if (this.updateForm.invalid || selectedFiles.length === 0) {
      this.updateForm.markAllAsTouched();
      this.imageSelectionTouched.set(true);
      return;
    }

    this.saveConfirmDialogVisible.set(true);
  }

  cancelSaveConfirm(): void {
    this.saveConfirmDialogVisible.set(false);
  }

  confirmSaveAndGoHome(uploader: FileUpload): void {
    if (this.submitting()) return;
    this.saveConfirmDialogVisible.set(false);

    const selectedFiles = this.getSelectedFiles(uploader);

    const id = this.propertyId();
    if (id === null) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('PROPERTY_UPDATE.ERROR'),
        detail: this.translate.instant('PROPERTY_UPDATE.INVALID_ID'),
      });
      return;
    }

    this.submitting.set(true);

    this.propertyService
      .updateProperty(id, this.mapToPayload(selectedFiles))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('PROPERTY_UPDATE.SUCCESS_TITLE'),
            detail: this.translate.instant('PROPERTY_UPDATE.SUCCESS'),
            life: 3000,
          });
          this.router.navigateByUrl('/');
        },
        error: () => {
          this.submitting.set(false);
        },
      });
  }

  clearForm(uploader?: FileUpload): void {
    this.updateForm.reset({
      propertyType: null,
      finishingType: null,
      negotiable: null,
      price: null,
      area: null,
      rooms: null,
      bathrooms: null,
      country: '',
      governorate: '',
      city: '',
      district: '',
      street: '',
      buildingNumber: null,
      floorNumber: null,
      apartmentNumber: null,
    });

    uploader?.clear();

    this.imageSelectionTouched.set(false);
  }

  isControlInvalid(controlName: string, errorName?: string): boolean {
    const control = this.updateForm.get(controlName);
    if (!control || !control.touched) return false;
    return errorName ? control.hasError(errorName) : control.invalid;
  }

  onImagesSelect(): void {
    this.imageSelectionTouched.set(true);
  }

  onImagesClear(): void {
    this.imageSelectionTouched.set(true);
  }

  isImageRequiredInvalid(uploader?: FileUpload): boolean {
    return this.imageSelectionTouched() && this.getSelectedFiles(uploader).length === 0;
  }

  propertyImageUrl(property: IPropertyDetail): string {
    const firstImageFileName = property.imageURLs?.find(Boolean);
    if (firstImageFileName) {
      return this.propertyService.buildPropertyImageUrl(firstImageFileName);
    }
    return '/images/properties/luxury-apartment.png';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    if (img.dataset['fallbackApplied'] === 'true') return;
    img.dataset['fallbackApplied'] = 'true';
    img.src = '/images/properties/luxury-apartment.png';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  }

  private loadCurrentProperty(id: number): void {
    this.loadingProperty.set(true);

    this.propertyService
      .getPropertyById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (property) => {
          this.propertyDetail.set(property);
          this.patchFromProperty(property);
          this.loadingProperty.set(false);
        },
        error: () => {
          this.loadingProperty.set(false);
        },
      });
  }

  private patchFromProperty(property: IPropertyDetail): void {
    this.updateForm.patchValue({
      propertyType: this.tryParseNumericValue(property.propertyType),
      finishingType: this.tryParseNumericValue(property.finishingType),
      price: property.price,
      area: property.area,
      rooms: property.rooms,
      bathrooms: property.bathrooms,
      country: property.country ?? '',
      governorate: property.governorate ?? '',
      city: property.city ?? '',
      district: property.district ?? '',
      street: property.street ?? '',
      buildingNumber: property.buildingNumber,
      floorNumber: property.floorNumber,
      apartmentNumber: property.apartmentNumber,
    });
  }

  private mapToPayload(imageFiles: File[]): IUpdatePropertyPayload {
    const value = this.updateForm.getRawValue();

    return {
      propertyType: value.propertyType,
      finishingType: value.finishingType,
      negotiable: value.negotiable,
      price: value.price,
      area: value.area,
      rooms: value.rooms,
      bathrooms: value.bathrooms,
      country: this.normalizeText(value.country),
      governorate: this.normalizeText(value.governorate),
      city: this.normalizeText(value.city),
      district: this.normalizeText(value.district),
      street: this.normalizeText(value.street),
      buildingNumber: value.buildingNumber,
      floorNumber: value.floorNumber,
      apartmentNumber: value.apartmentNumber,
      imageFiles,
    };
  }

  private getSelectedFiles(uploader?: FileUpload): File[] {
    const files = uploader?.files;
    if (!files || !Array.isArray(files)) return [];

    return files.filter((file): file is File => file instanceof File);
  }

  private normalizeText(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  private tryParseNumericValue(value: string): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
