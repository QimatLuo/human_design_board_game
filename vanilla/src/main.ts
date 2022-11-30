import { getStrLn, putStrLn, reload } from "./side-effects";
import { curry2, curry4, guard } from "fp-ts-std/Function";
import * as n from "fp-ts/number";
import * as s from "fp-ts/string";
import { constant as c, flow, pipe } from "fp-ts/function";
import * as I from "fp-ts/Identity";
import * as O from "fp-ts/Option";
import { between } from "fp-ts/Ord";
import * as P from "fp-ts/Predicate";
import { randomInt } from "fp-ts/Random";
import * as T from "fp-ts/Task";

//
// helpers
//

// ask something and get the answer
function ask(question: string, defaultInput?: string): T.Task<string> {
  return pipe(putStrLn(question, defaultInput), T.fromIO, T.chain(c(getStrLn)));
}

function askBetween(
  question: string,
  min: number,
  max: number,
  defaultInput: number
): T.Task<number> {
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
        O.match(loop, T.of)
      )
    )
  );
}

function askYesNo(question: string, defaultInput?: string): T.Task<boolean> {
  const loop = flow(c(curry2(askYesNo)), I.ap(question), I.ap(defaultInput));
  const eq = curry2(s.Eq.equals);
  return pipe(
    ask(`${question} (y/n)`, defaultInput),
    T.chain(
      flow(
        s.toLowerCase,
        guard([
          [eq("y"), c(T.of(true))],
          [eq("n"), c(T.of(false))],
        ])(loop)
      )
    )
  );
}

function askNonEmpty(question: string, defaultInput?: string): T.Task<string> {
  const loop = flow(c(curry2(askNonEmpty)), I.ap(question), I.ap(defaultInput));
  return pipe(
    ask(question, defaultInput),
    T.chain(flow(O.fromPredicate(P.not(s.isEmpty)), O.match(loop, T.of)))
  );
}

// get a random int between 1 and 5
const random = T.fromIO(randomInt(1, 5));

//
// game
//

function shouldContinue(name: string): T.Task<boolean> {
  const eq = curry2(s.Eq.equals);
  return pipe(
    ask(`Do you want to continue, ${name} (y/n)?`, "y"),
    T.chain(
      flow(
        s.toLowerCase,
        guard([
          [eq("y"), c(T.of(true))],
          [eq("n"), c(T.of(false))],
        ])(flow(c(name), shouldContinue))
      )
    )
  );
}

function gameLoop(name: string): T.Task<void> {
  return pipe(
    T.Do,
    T.apS("secret", random),
    T.apS("guess", askBetween(`Dear ${name}, please guess a number.`, 1, 5, 1)),
    T.chain(({ secret, guess }) =>
      guess === secret
        ? putStrLn(`You guessed right, ${name}!`)
        : putStrLn(`You guessed wrong, ${name}! The number was: ${secret}`)
    ),
    T.chain(flow(c(name), shouldContinue)),
    T.chain((b) => (b ? gameLoop(name) : T.of(undefined)))
  );
}

const main: T.Task<void> = pipe(
  askNonEmpty("What is your name?", "Player"),
  T.chainFirst((name) => putStrLn(`Hello, ${name} welcome to the game!`)),
  T.chain(gameLoop)
);

main().finally(reload); // eslint-disable-line functional/no-expression-statement
