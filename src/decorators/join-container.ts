export class JoinContainer {
  private static data = new Map<string, Set<Record<string, any>>>();

  public static addJoin(target: Record<string, any>, key: string) {
    let values = this.data.get(key);
    if (!values) {
      values = new Set<Record<string, any>>();
    }

    values.add(target);
  }

  public static hasJoin(target: Function, key: string): boolean {
    const values = this.data.get(key);
    if (values) {
      return values.has(target);
    }
    return null;
  }
}
