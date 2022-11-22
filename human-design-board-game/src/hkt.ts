import { Kind, URIS } from "fp-ts/HKT";
import { Monad1 } from "fp-ts/Monad";

export interface Console<F extends URIS> {
  readonly putStrLn: (message: string) => Kind<F, void>;
  readonly getStrLn: Kind<F, string>;
}

export interface Main<F extends URIS>
  extends Program<F>,
    Console<F>,
    Random<F> {}

export interface Program<F extends URIS> extends Monad1<F> {
  readonly finish: <A>(a: A) => Kind<F, A>;
}

export interface Random<F extends URIS> {
  readonly nextInt: (upper: number) => Kind<F, number>;
}
