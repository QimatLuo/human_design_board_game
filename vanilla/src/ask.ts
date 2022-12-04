import { Int3_6, YorN } from "./BrandTypes";
import { getStrLn, putStrLn, showErrors } from "./side-effects";
import { curry2, curry4 } from "fp-ts-std/Function";
import * as I from "fp-ts/Identity";
import * as O from "fp-ts/Option";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import { constant as c, flow, pipe } from "fp-ts/function";
import * as s from "fp-ts/string";
import { NonEmptyString } from "io-ts-types";

function ask(question: string, defaultInput?: string): T.Task<string> {
  return pipe(putStrLn(question, defaultInput), T.fromIO, T.chain(c(getStrLn)));
}

export function askBetween(
  question: string,
  min: number,
  max: number,
  defaultInput: number
): TE.TaskEither<never, Int3_6> {
  const loop = flow(
    c(curry4(askBetween)),
    I.ap(question),
    I.ap(min),
    I.ap(max),
    I.ap(defaultInput)
  );
  return pipe(
    ask(`${question} (${min}-${max})`, `${defaultInput}`),
    T.map(Int3_6.decode),
    TE.orElse(flow(showErrors, TE.fromIO, TE.chain(loop)))
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
    T.map(YorN.decode),
    TE.map(flow(O.fromPredicate(eq("y")), O.match(c(false), c(true)))),
    TE.orElse(flow(showErrors, TE.fromIO, TE.chain(loop)))
  );
}

export function askNonEmpty(
  question: string,
  defaultInput?: string
): TE.TaskEither<never, NonEmptyString> {
  const loop = flow(c(curry2(askNonEmpty)), I.ap(question), I.ap(defaultInput));
  return pipe(
    ask(question, defaultInput),
    T.map(NonEmptyString.decode),
    TE.orElse(flow(showErrors, TE.fromIO, TE.chain(loop)))
  );
}
