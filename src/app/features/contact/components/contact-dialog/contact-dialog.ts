import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ContactService } from '../../../../core/services/contact.service';

@Component({
  selector: 'app-contact-dialog',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDialog {
  private readonly contactService = inject(ContactService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  /** Property ID to attach the contact to. */
  readonly propertyId = input.required<number>();

  /** Two-way binding for dialog visibility. */
  readonly visible = model(false);

  /** Emitted on successful submission. */
  readonly submitted = output<void>();

  /** Emitted on submission error. */
  readonly submitError = output<string>();

  readonly submitting = signal(false);

  readonly contactForm = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
      confirmPhone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required, Validators.email]],
    },
    {
      validators: [
        ContactDialog.matchValidator('phone', 'confirmPhone', 'phoneMismatch'),
        ContactDialog.matchValidator('email', 'confirmEmail', 'emailMismatch'),
      ],
    },
  );

  /** Cross-field validator factory: checks that two controls have the same value. */
  private static matchValidator(
    sourceKey: string,
    confirmKey: string,
    errorName: string,
  ) {
    return (group: AbstractControl): ValidationErrors | null => {
      const source = group.get(sourceKey);
      const confirm = group.get(confirmKey);
      if (!source || !confirm) return null;

      if (source.value !== confirm.value) {
        confirm.setErrors({ ...confirm.errors, [errorName]: true });
        return { [errorName]: true };
      }

      // Clear only the mismatch error if it was the sole error
      if (confirm.errors?.[errorName]) {
        const remaining = { ...confirm.errors };
        delete remaining[errorName];
        confirm.setErrors(Object.keys(remaining).length ? remaining : null);
      }
      return null;
    };
  }

  onDialogShow(): void {
    this.contactForm.reset();
  }

  submit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const { name, phone, email } = this.contactForm.value;
    this.submitting.set(true);

    this.contactService
      .addBuyerContact(this.propertyId(), { name: name!, phone: phone!, email: email! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.visible.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Sent!',
            detail: 'Your contact info has been submitted successfully.',
          });
          this.submitted.emit();
        },
        error: (err: Error) => {
          this.submitting.set(false);
          const message = err?.message || 'Failed to submit. Please try again.';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: message,
          });
          this.submitError.emit(message);
        },
      });
  }
}
