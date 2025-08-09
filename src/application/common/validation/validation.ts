// Simple validation utility similar to Java's Validation class.

export class Validation {
  static notEmpty(value: string, message: string): void {
    if (!value || value.trim().length === 0) throw new Error(message);
  }
  static positive(value: number, message: string): void {
    if (value <= 0) throw new Error(message);
  }
  static nonNegative(value: number, message: string): void {
    if (value < 0) throw new Error(message);
  }
}
