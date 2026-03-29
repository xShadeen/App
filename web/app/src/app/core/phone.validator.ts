import { AbstractControl, ValidationErrors } from '@angular/forms';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const PHONE_REGEX = /^\+\d+$/;

export function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (!value) return null;

  // ✅ regex check (szybki)
  if (!PHONE_REGEX.test(value)) {
    return { invalidFormat: true };
  }

  const phoneNumber = parsePhoneNumberFromString(value);

  if (!phoneNumber || !phoneNumber.isValid()) {
    return { invalidPhone: true };
  }

  return null;
}
