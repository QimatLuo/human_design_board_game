import { askBetween, askNonEmpty, askYesNo } from "./ask";
import { reload } from "./side-effects";
import { curry2 } from "fp-ts-std/Function";
import { flow, pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import * as I from "fp-ts/Identity";
import * as RA from "fp-ts/ReadonlyArray";
import * as RT from "fp-ts/ReaderTask";
import * as T from "fp-ts/Task";

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

const askNumberOfPlayers: RT.ReaderTask<DefaultValue, number> = (d) =>
  askBetween("How many players?", 3, 6, d.players);

const setEachPlayersName: (n: number) => T.Task<readonly string[]> = flow(
  curry2(A.makeBy<T.Task<string>>),
  I.ap((x) => askNonEmpty(`Name of Player ${x + 1}:`)),
  T.sequenceSeqArray
);

const main: RT.ReaderTask<DefaultValue, void> = pipe(
  askNumberOfPlayers,
  RT.chainTaskK(setEachPlayersName),
  RT.chainTaskK(gameLoop)
);

const deps = {
  players: 3,
};
main(deps)().finally(reload); // eslint-disable-line functional/no-expression-statement
