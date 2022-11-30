import { askBetween, askNonEmpty, askYesNo } from "./ask";
import { putStrLn, reload } from "./side-effects";
import { curry2 } from "fp-ts-std/Function";
import { constant as c, flow, pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import * as I from "fp-ts/Identity";
import { randomInt } from "fp-ts/Random";
import * as T from "fp-ts/Task";

//
// helpers
//

// get a random int between 1 and 5
const random = T.fromIO(randomInt(1, 5));

//
// game
//

function gameLoop(name: readonly string[]): T.Task<void> {
  return pipe(
    T.Do,
    T.apS("secret", random),
    T.apS("guess", askBetween(`Dear ${name}, please guess a number.`, 1, 5, 1)),
    T.chain(({ secret, guess }) =>
      guess === secret
        ? putStrLn(`You guessed right, ${name}!`)
        : putStrLn(`You guessed wrong, ${name}! The number was: ${secret}`)
    ),
    T.chain(c(askYesNo(`Do you want to continue, ${name}?`, "y"))),
    T.chain((b) => (b ? gameLoop(name) : T.of(undefined)))
  );
}

const main: T.Task<void> = pipe(
  askBetween("How many players?", 3, 6, 3),
  T.chain(
    flow(
      curry2(A.makeBy<T.Task<string>>),
      I.ap((x) => askNonEmpty(`Name of Player ${x + 1}:`)),
      T.sequenceSeqArray
    )
  ),
  T.chain(gameLoop)
);

main().finally(reload); // eslint-disable-line functional/no-expression-statement
