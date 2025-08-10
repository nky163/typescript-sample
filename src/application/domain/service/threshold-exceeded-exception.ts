import type { Money } from '../model/money';

export class ThresholdExceededException extends Error {
  constructor(threshold: Money, actual: Money) {
    super(
      `Maximum threshold for transferring money exceeded: tried to transfer ${actual.toString()} but threshold is ${threshold.toString()}!`,
    );
  }
}
