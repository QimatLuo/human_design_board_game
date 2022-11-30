import { askBetween, askNonEmpty, askYesNo } from "./ask";
import { putStrLn, reload } from "./side-effects";
import { constant as c, pipe } from "fp-ts/function";
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
    T.chain(c(askYesNo(`Do you want to continue, ${name}?`, "y"))),
    T.chain((b) => (b ? gameLoop(name) : T.of(undefined)))
  );
}

const main: T.Task<void> = pipe(
  askNonEmpty("What is your name?", "Player"),
  T.chainFirst((name) => putStrLn(`Hello, ${name} welcome to the game!`)),
  T.chain(gameLoop)
);

main().finally(reload); // eslint-disable-line functional/no-expression-statement
