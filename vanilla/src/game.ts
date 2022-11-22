import { Main } from "./hkt";
import { Kind, URIS } from "fp-ts/HKT";
import { apS as apS_ } from "fp-ts/Apply";
import { chainFirst as chainFirst_ } from "fp-ts/Chain";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

function parse(s: string): O.Option<number> {
  const i = +s;
  return isNaN(i) || i % 1 !== 0 ? O.none : O.some(i);
}

export function main<F extends URIS>(F: Main<F>): Kind<F, void> {
  const chain =
    <A, B>(f: (a: A) => Kind<F, B>) =>
    (ma: Kind<F, A>): Kind<F, B> =>
      F.chain(ma, f);
  const Do: Kind<F, {}> = F.of({});
  const apS = apS_(F);
  const chainFirst = chainFirst_(F);

  const ask = (question: string): Kind<F, string> =>
    pipe(
      F.putStrLn(question),
      chain(() => F.getStrLn)
    );

  const shouldContinue = (name: string): Kind<F, boolean> => {
    return pipe(
      ask(`Do you want to continue, ${name} (y/n)?`),
      chain((answer) => {
        switch (answer.toLowerCase()) {
          case "y":
            return F.of<boolean>(true);
          case "n":
            return F.of<boolean>(false);
          default:
            return shouldContinue(name);
        }
      })
    );
  };

  const gameLoop = (name: string): Kind<F, void> => {
    return pipe(
      Do,
      apS("secret", F.nextInt(5)),
      apS("guess", ask(`Dear ${name}, please guess a number from 1 to 5`)),
      chain(({ secret, guess }) =>
        pipe(
          parse(guess),
          O.fold(
            () => F.putStrLn("You did not enter an integer!"),
            (x) =>
              x === secret
                ? F.putStrLn(`You guessed right, ${name}!`)
                : F.putStrLn(
                    `You guessed wrong, ${name}! The number was: ${secret}`
                  )
          )
        )
      ),
      chain(() => shouldContinue(name)),
      chain((b) => (b ? gameLoop(name) : F.of<void>(undefined)))
    );
  };

  return pipe(
    ask("What is your name?"),
    chainFirst((name) => F.putStrLn(`Hello, ${name} welcome to the game!`)),
    chain(gameLoop)
  );
}
