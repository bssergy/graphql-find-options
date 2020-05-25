export class WhereContainer {
  private static data = new Map<Record<string, any>, Map<string, Function>>();

  public static setArgFunc(target: Record<string, any>, key: string, func: Function) {
    let targetValue = this.data.get(target);
    if (!targetValue) {
      targetValue = new Map();
      this.data.set(target, targetValue);
    }
    targetValue.set(key, func);
  }

  public static getArgFunc(target: Function, key: string): Function {
    const targetValue = this.data.get(target);
    if (targetValue) {
      return targetValue.get(key);
    }
    return null;
  }
}
