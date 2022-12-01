import { askBetween, askNonEmpty, askYesNo } from "./ask";
import { reload } from "./side-effects";
import { curry2 } from "fp-ts-std/Function";
import { flow, pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import * as I from "fp-ts/Identity";
import * as RA from "fp-ts/ReadonlyArray";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as SRTE from "fp-ts/StateReaderTaskEither";
import * as TE from "fp-ts/TaskEither";

function gameLoop(
  name: readonly string[]
): SRTE.StateReaderTaskEither<GameState, DefaultValue, Error, void> {
  return pipe(
    name,
    RA.map(
      flow(
        (x) => askYesNo(`Player ${x} do something.`),
        SRTE.fromTaskEither<Error, boolean, GameState, DefaultValue>,
        SRTE.chainStateK((x) => (s) => [x, { turns: s.turns + 1 }])
      )
    ),
    SRTE.sequenceArray,
    SRTE.chain((b) => (b ? gameLoop(name) : SRTE.of(undefined)))
  );
}

interface DefaultValue {
  readonly players: number;
}

interface GameState {
  readonly turns: number;
}

const askNumberOfPlayers: RTE.ReaderTaskEither<DefaultValue, Error, number> = (
  d
) => askBetween("How many players?", 3, 6, d.players);

const setEachPlayersName: (
  n: number
) => TE.TaskEither<Error, readonly string[]> = flow(
  curry2(A.makeBy<TE.TaskEither<Error, string>>),
  I.ap((x) => askNonEmpty(`Name of Player ${x + 1}:`)),
  TE.sequenceSeqArray
);

const main = pipe(
  SRTE.fromReaderTaskEither<DefaultValue, Error, number, GameState>(
    askNumberOfPlayers
  ),
  SRTE.chainTaskEitherK(setEachPlayersName),
  SRTE.chain(gameLoop)
);

const deps = {
  players: 3,
};
const gameState: GameState = {
  turns: 0,
};
main(gameState)(deps)().finally(reload); // eslint-disable-line functional/no-expression-statement
