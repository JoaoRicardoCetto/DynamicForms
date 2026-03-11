import { CompiledFormSpec } from './types';

interface ValidationError {
  field: string;
  code: string;
  message: string;
  expected?: unknown;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validates submission data against compiled FormSpec
 */
export function validateSubmission(data: Record<string, unknown>, spec: CompiledFormSpec): ValidationResult {
  const errors: ValidationError[] = [];

  for (const section of spec.sections) {
    for (const field of section.fields) {
      const value = data[field.name];

      for (const v of field.validations) {
        switch (v.type) {
          case 'required':
            if (value === undefined || value === null || value === '') {
              errors.push({ field: field.name, code: 'required', message: v.message });
            }
            break;
          case 'minLength':
            if (typeof value === 'string' && value.length < Number(v.value)) {
              errors.push({ field: field.name, code: 'minLength', message: v.message, expected: v.value });
            }
            break;
          case 'maxLength':
            if (typeof value === 'string' && value.length > Number(v.value)) {
              errors.push({ field: field.name, code: 'maxLength', message: v.message, expected: v.value });
            }
            break;
          case 'min':
            if (typeof value === 'number' && value < Number(v.value)) {
              errors.push({ field: field.name, code: 'min', message: v.message, expected: v.value });
            }
            break;
          case 'max':
            if (typeof value === 'number' && value > Number(v.value)) {
              errors.push({ field: field.name, code: 'max', message: v.message, expected: v.value });
            }
            break;
          case 'pattern':
            if (typeof value === 'string' && v.value && !new RegExp(String(v.value)).test(value)) {
              errors.push({ field: field.name, code: 'pattern', message: v.message, expected: v.value });
            }
            break;
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
