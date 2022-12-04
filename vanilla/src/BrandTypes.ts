import * as t from "io-ts";
import { between } from "fp-ts/Ord";
import * as n from "fp-ts/number";

interface Int3_6Brand {
  readonly Int3_6: unique symbol;
}
export const Int3_6 = t.brand(
  t.number,
  (s: unknown): s is t.Branded<number, Int3_6Brand> =>
    between(n.Ord)(3, 6)(Number(s)),
  "Int3_6"
);
export type Int3_6 = t.TypeOf<typeof Int3_6>;

interface YorNBrand {
  readonly YorN: unique symbol;
}
export const YorN = t.brand(
  t.string,
  (s: unknown): s is t.Branded<string, YorNBrand> => /(y|n)/.test(`${s}`),
  "YorN"
);
export type YorN = t.TypeOf<typeof YorN>;
