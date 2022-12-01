import { askBetween, askNonEmpty, askYesNo } from "./ask";
import { reload } from "./side-effects";
import { curry2 } from "fp-ts-std/Function";
import { flow, pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import * as I from "fp-ts/Identity";
import * as RA from "fp-ts/ReadonlyArray";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as SRTE from "fp-ts/StateReaderTaskEither";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";

function gameLoop(name: readonly string[]): T.Task<void> {
  return pipe(
    name,
    RA.map((x) => askYesNo(`Player ${x} do something.`)),
    T.sequenceSeqArray,
    T.chain((b) => (b ? gameLoop(name) : T.of(undefined)))
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
  SRTE.fromReaderTaskEither(askNumberOfPlayers),
  SRTE.chainTaskEitherK(setEachPlayersName),
  SRTE.chainTaskK(gameLoop),
);

const deps = {
  players: 3,
};
const gameState: GameState = {
  turns: 0,
};
main(gameState)(deps)().finally(reload); // eslint-disable-line functional/no-expression-statement
