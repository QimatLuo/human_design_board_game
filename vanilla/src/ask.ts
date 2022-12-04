import { getStrLn, putStrLn } from "./side-effects";
import { curry2, curry4, guard } from "fp-ts-std/Function";
import * as I from "fp-ts/Identity";
import * as O from "fp-ts/Option";
import { between } from "fp-ts/Ord";
import * as P from "fp-ts/Predicate";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import { constant as c, flow, pipe } from "fp-ts/function";
import * as n from "fp-ts/number";
import * as s from "fp-ts/string";

function ask(question: string, defaultInput?: string): T.Task<string> {
  return pipe(putStrLn(question, defaultInput), T.fromIO, T.chain(c(getStrLn)));
}

export function askBetween(
  question: string,
  min: number,
  max: number,
  defaultInput: number
): TE.TaskEither<Error, number> {
  const loop = flow(
    c(curry4(askBetween)),
    I.ap(question),
    I.ap(min),
    I.ap(max),
    I.ap(defaultInput)
  );
  return pipe(
    ask(`${question} (${min}-${max})`, `${defaultInput}`),
    T.map(Number),
    T.chain(
      flow(
        O.fromPredicate(P.not(isNaN)),
        O.chain(O.fromPredicate(between(n.Ord)(min, max))),
        O.match(loop, TE.of)
      )
    )
  );
}

export function askYesNo(
  question: string,
  defaultInput?: string
): TE.TaskEither<Error, boolean> {
  const loop = flow(c(curry2(askYesNo)), I.ap(question), I.ap(defaultInput));
  const eq = curry2(s.Eq.equals);
  return pipe(
    ask(`${question} (y/n)`, defaultInput),
    T.map(s.toLowerCase),
    T.chain(
      guard<string, TE.TaskEither<Error, boolean>>([
        [eq("y"), c(TE.of(true))],
        [eq("n"), c(TE.of(false))],
      ])(loop)
    )
  );
}

export function askNonEmpty(
  question: string,
  defaultInput?: string
): TE.TaskEither<Error, string> {
  const loop = flow(c(curry2(askNonEmpty)), I.ap(question), I.ap(defaultInput));
  return pipe(
    ask(question, defaultInput),
    T.chain(flow(O.fromPredicate(P.not(s.isEmpty)), O.match(loop, TE.of)))
  );
}
