/* eslint functional/no-return-void: "off" */
/* eslint functional/functional-parameters: "off" */
/* eslint functional/no-expression-statement: "off" */

import { Console, Program, Random } from "./hkt";
import { randomInt } from "fp-ts/Random";
import * as T from "fp-ts/Task";
import { flow } from "fp-ts/function";

export const programTask: Program<T.URI> = {
  ...T.Monad,
  finish: T.of,
};

const getStrLn: T.Task<string> = () =>
  new Promise((resolve, reject) => {
    const form = document.querySelector<HTMLFormElement>("form");
    const input = document.querySelector<HTMLInputElement>("input");
    const cb = () => {
      if (input) {
        resolve(input.value);
        input.value = ""; // eslint-disable-line functional/immutable-data
      } else {
        reject();
      }
      form?.removeEventListener("submit", cb);
    };
    form?.addEventListener("submit", cb);
  });

const putStrLn = flow(
  (x:string) => () => {
    const ol = document.querySelector<HTMLOListElement>("ol");
    const li = document.createElement("li");
    li.innerText = `${x}`; // eslint-disable-line functional/immutable-data
    ol?.append(li);
  },
  T.fromIO
);

export const consoleTask: Console<T.URI> = {
  putStrLn,
  getStrLn,
};

export const randomTask: Random<T.URI> = {
  nextInt: (upper) => T.fromIO(randomInt(1, upper)),
};
