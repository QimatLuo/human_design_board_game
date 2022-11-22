import { Console, Program, Random } from "./hkt";
import { log } from "fp-ts/Console";
import { randomInt } from "fp-ts/Random";
import * as T from "fp-ts/Task";
import { flow } from "fp-ts/function";
import { createInterface } from "readline";

export const programTask: Program<T.URI> = {
  ...T.Monad,
  finish: T.of,
};

const getStrLn: T.Task<string> = () =>
  new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("> ", (answer) => {
      rl.close();
      resolve(answer);
    });
  });

const putStrLn = flow(log, T.fromIO);

export const consoleTask: Console<T.URI> = {
  putStrLn,
  getStrLn,
};

export const randomTask: Random<T.URI> = {
  nextInt: (upper) => T.fromIO(randomInt(1, upper)),
};
