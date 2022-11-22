import { Console, Program, Random } from "./hkt";
import { randomInt } from "fp-ts/Random";
import * as T from "fp-ts/Task";
import { flow } from "fp-ts/function";

export const programTask: Program<T.URI> = {
  ...T.Monad,
  finish: T.of,
};

const getStrLn: T.Task<string> = () =>
  new Promise((resolve) => {
    const form = document.querySelector<HTMLFormElement>("form");
    const input = document.querySelector<HTMLInputElement>("input");
    const cb = () => {
      resolve(input!.value);
      input!.value = "";
      form?.removeEventListener("submit", cb);
    };
    form?.addEventListener("submit", cb);
  });

const putStrLn = flow(
  (x) => () => {
    const ol = document.querySelector<HTMLOListElement>("ol");
    const li = document.createElement("li");
    li.innerText = `${x}`;
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
