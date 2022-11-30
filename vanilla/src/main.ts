import { getStrLn, putStrLn, reload } from "./side-effects";
import { curry2, guard } from "fp-ts-std/Function";
import * as s from "fp-ts/string";
import { constant as c, flow, pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { randomInt } from "fp-ts/Random";
import * as T from "fp-ts/Task";

//
// helpers
//

// ask something and get the answer
function ask(question: string, defaultInput?: string): T.Task<string> {
  return pipe(putStrLn(question, defaultInput), T.fromIO, T.chain(c(getStrLn)));
}

// get a random int between 1 and 5
const random = T.fromIO(randomInt(1, 5));

// parse a string to an integer
function parse(s: string): O.Option<number> {
  const i = +s;
  return isNaN(i) || i % 1 !== 0 ? O.none : O.some(i);
}

//
// game
//

function shouldContinue(name: string): T.Task<boolean> {
  const eq = curry2(s.Eq.equals);
  return pipe(
    ask(`Do you want to continue, ${name} (y/n)?`),
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
    T.apS("guess", ask(`Dear ${name}, please guess a number from 1 to 5`)),
    T.chain(({ secret, guess }) =>
      pipe(
        parse(guess),
        O.fold(flow(c("You did not enter an integer!"), putStrLn), (x) =>
          x === secret
            ? putStrLn(`You guessed right, ${name}!`)
            : putStrLn(`You guessed wrong, ${name}! The number was: ${secret}`)
        )
      )
    ),
    T.chain(flow(c(name), shouldContinue)),
    T.chain((b) => (b ? gameLoop(name) : T.of(undefined)))
  );
}

const main: T.Task<void> = pipe(
  ask("What is your name?"),
  T.chainFirst((name) => putStrLn(`Hello, ${name} welcome to the game!`)),
  T.chain(gameLoop)
);

main().finally(reload); // eslint-disable-line functional/no-expression-statement
