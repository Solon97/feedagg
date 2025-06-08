// Validation utilities
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidUUID(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  static sanitizeString(input: string): string {
    return input.trim().replace(/\s+/g, " ");
  }

  static isValidPassword(password: string): boolean {
    return password.length >= 6;
  }
}

// Date utilities
export class DateUtils {
  static formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  static formatDateTime(date: Date): string {
    return date.toISOString();
  }

  static parseDate(dateString: string): Date {
    return new Date(dateString);
  }

  static isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static diffInDays(date1: Date, date2: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((date1.getTime() - date2.getTime()) / msPerDay);
  }
}

// String utilities
export class StringUtils {
  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + "...";
  }

  static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  static capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  static extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  }
}

// Array utilities
export class ArrayUtils {
  static removeDuplicates<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static sortBy<T>(
    array: T[],
    key: keyof T,
    order: "asc" | "desc" = "asc"
  ): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  }
}

// Object utilities
export class ObjectUtils {
  static isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
  }

  static pick<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach((key) => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }

  static omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    keys.forEach((key) => {
      delete result[key];
    });
    return result;
  }
}

// Async utilities
export class AsyncUtils {
  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Operation timed out")), ms)
      ),
    ]);
  }

  static retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number,
    delayMs: number = 1000
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      let lastError: Error;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const result = await fn();
          resolve(result);
          return;
        } catch (error) {
          lastError =
            error instanceof Error ? error : new Error("Unknown error");

          if (attempt === maxAttempts) {
            reject(lastError);
            return;
          }

          await this.delay(delayMs * attempt);
        }
      }
    });
  }
}
