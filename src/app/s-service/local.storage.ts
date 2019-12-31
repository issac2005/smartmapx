export class DataStorage {

  private info = {};

  constructor() {
  }

  /**
   * 存储数据
   * @param key
   * @param value
   */
  public set(key: string, value: any): void {
    this.info[key] = value;
  }

  /**
   * 得到数据
   * @param key
   */
  public get(key: string): string {
    return this.info[key] || false;
  }

  /**
   * 删除
   * @param key
   */
  public remove(key: string): any {
    delete this.info[key];
  }
}


/**
 * @deprecated  即将废弃,慎用(请直接引入local.storage.ts文件,调用方法)
 */
export class LocalStorage {

  public localStorage: any;

  constructor() {
    if (!localStorage) {
      throw new Error('Current browser does not support Local Storage');
    }
    this.localStorage = localStorage;
  }

  public set(key: string, value: string): void {
    this.localStorage[key] = value;
  }

  public get(key: string): string {
    return this.localStorage[key] || false;
  }

  public setObject(key: string, value: any): void {
    this.localStorage[key] = JSON.stringify(value);
  }

  public getObject(key: string): any {
    return JSON.parse(this.localStorage[key] || '{}');
  }

  public remove(key: string): any {
    this.localStorage.removeItem(key);
  }
}
