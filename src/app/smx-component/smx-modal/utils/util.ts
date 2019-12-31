
export function toInteger(value: any): number {
  return parseInt(`${value}`, 10);
}

export function toString(value: any): string {
  return (value !== undefined && value !== null) ? `${value}` : '';
}


/**
 * 判断
 * @param value
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isNumber(value: any): value is number {
  return !isNaN(toInteger(value));
}

export function isInteger(value: any): value is number {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

export function isDefined(value: any): boolean {
  return value !== undefined && value !== null;
}


export function isEmpty(value: any): boolean {
  return value == null || typeof value === 'string' && value.length === 0;
}


export function isNotEmpty(value: any): boolean {
  return !this.isEmpty(value);
}


export function isArray(value: any): boolean {
  return Array.isArray(value);
}


export function isObject(value: any): boolean {
  return typeof value === 'object' && !this.isArray(value);
}



