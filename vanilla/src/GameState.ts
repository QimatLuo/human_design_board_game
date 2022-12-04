import { curry2 } from "fp-ts-std/Function";
import * as O from "fp-ts/Option";
import { modifyAt } from "fp-ts/Record";
import { constant as c, pipe } from "fp-ts/function";
import * as n from "fp-ts/number";

type Turns = number;

const add = curry2(n.MonoidSum.concat);

export interface GameState {
  readonly turns: Turns;
}

export function increaseTurns(s: GameState): GameState {
  return pipe(s, modifyAt("turns", add(1)), O.getOrElse(c(s)));
}
