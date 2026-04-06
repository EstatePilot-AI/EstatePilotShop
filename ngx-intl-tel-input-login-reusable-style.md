# Reusable `ngx-intl-tel-input` (Login Phone Field)

This guide documents the exact phone input setup used in `login.component.html`, with reusable styling so you can move it to another Angular project.

---

## 1) Install required packages

```bash
npm i ngx-intl-tel-input google-libphonenumber intl-tel-input
```

---

## 2) Add global CSS (required)

In `angular.json`, add this style (before your app styles):

```json
"styles": [
  "./node_modules/intl-tel-input/build/css/intlTelInput.css",
  "src/styles.scss"
]
```

---

## 3) Component template (HTML)

Use this inside your login form:

```html
<div class="phone-wrapper p-inputtext">
  <ngx-intl-tel-input
    inputId="phone"
    formControlName="phone"
    [preferredCountries]="[CountryISO.Egypt]"
    [enableAutoCountrySelect]="true"
    [enablePlaceholder]="true"
    [selectFirstCountry]="false"
    [selectedCountryISO]="CountryISO.Egypt"
    [onlyCountries]="onlyCountries"
    [phoneValidation]="true"
    [maxLength]="15">
  </ngx-intl-tel-input>
</div>
```

> In the current project, the variable name is `onlyCountires` (typo). For new projects, prefer `onlyCountries`.

---

## 4) Component TypeScript (Standalone example)

```ts
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxIntlTelInputModule, CountryISO } from 'ngx-intl-tel-input';

@Component({
  selector: 'app-login-phone',
  standalone: true,
  imports: [ReactiveFormsModule, NgxIntlTelInputModule],
  templateUrl: './login-phone.component.html',
  styleUrl: './login-phone.component.scss',
})
export class LoginPhoneComponent {
  CountryISO = CountryISO;

  // Replace with your allowed countries list
  onlyCountries = [CountryISO.Egypt];

  form = this.fb.group({
    phone: [null, [Validators.required]],
  });

  constructor(private fb: FormBuilder) {}

  submit(): void {
    if (this.form.invalid) return;

    const phone = this.form.value.phone;

    // Example payload shape (same idea used in login component)
    const payload = {
      phoneNumber: {
        phoneNumber: phone?.nationalNumber,
        dialCode: phone?.dialCode,
      },
    };

    console.log(payload);
  }
}
```

---

## 5) Reusable SCSS style

Create `phone-input.scss` (or copy into your component SCSS):

```scss
/* stylelint-disable selector-class-pattern */
.phone-wrapper {
  position: relative;
  width: 100%;
  direction: rtl;
}

.iti {
  width: 100%;
  direction: rtl;
  position: relative;
}

.iti__dropdown-content {
  position: absolute !important;
  right: 0 !important;
  left: auto !important;
  transform: none !important;
}

.iti__country-list {
  position: relative !important;
  right: auto !important;
  left: auto !important;
  width: 100% !important;
  max-height: 220px;
  overflow: hidden auto;
  box-sizing: border-box;
  text-align: right;
  z-index: 99999 !important;
  direction: ltr;
  background: #fefafa;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
  transform: none !important;
}

.iti__country {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.iti__selected-flag {
  direction: ltr;
}

.phone-wrapper input {
  background: transparent;
  outline: none;
  border: none;
  text-align: right;
  width: 100%;

  &::placeholder {
    color: #94a3b8;
  }
}

.iti input:focus {
  outline: none;
  box-shadow: none;
}

.phone-wrapper.p-inputtext {
  padding: 0.85rem;
  background: rgb(255 255 255 / 50%);
  border: 1px solid rgb(226 232 240 / 80%);
  border-radius: 12px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 5%);
  transition: all 0.3s ease;

  &:hover {
    background: rgb(255 255 255 / 80%);
    box-shadow: 0 4px 8px rgb(0 0 0 / 10%);
  }

  &:focus-within {
    outline: none;
    border-color: #b91c48;
    box-shadow: 0 0 0 3px rgb(185 28 72 / 10%);
  }
}

.country-readonly {
  .iti__arrow {
    display: none;
  }

  .iti__selected-flag {
    pointer-events: none;
    cursor: default;
  }
}
```

If you want this style shared globally, import it in your component SCSS:

```scss
@use 'src/app/shared/styles/phone-input' as *;
```

---

## 6) Validation block (optional, recommended)

```html
@if (form.get('phone')?.invalid && (form.get('phone')?.touched || form.get('phone')?.dirty)) {
  <div class="error">
    @if (form.get('phone')?.errors?.['required']) {
      <div>Phone is required</div>
    } @else if (form.get('phone')?.errors?.['validatePhoneNumber']) {
      <div>Invalid phone number</div>
    }
  </div>
}
```

---

## Notes

- Keep `phone` initialized as `null` when using `ngx-intl-tel-input` with reactive forms.
- The control value is an object, not a raw string. Use `nationalNumber`, `dialCode`, etc. when building API payload.
- For LTR projects, remove `direction: rtl` rules from the SCSS.
