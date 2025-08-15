declare const opaqueSymbol: unique symbol;

/**
 * isValidメソッドを実装して、不変条件のチェックを行う
 *   エラーの場合は例外を投げる
 */
export abstract class ValueObject<TSymbol extends string, T> {
  readonly [opaqueSymbol]: TSymbol;

  public readonly value: T;

  constructor(value: T) {
    this.isValid(value);
    this.value = value;
  }

  protected abstract isValid(value: T): void;

  abstract isEqual(other: ValueObject<TSymbol, T>): boolean;
}
