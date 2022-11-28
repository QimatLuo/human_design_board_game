/* eslint functional/no-return-void:0, functional/no-expression-statement:0, functional/immutable-data:0, functional/functional-parameters:0, functional/no-return-void:0, @typescript-eslint/prefer-readonly-parameter-types:0 */

import { warn } from "fp-ts/Console";
import * as IOO from "fp-ts/IOOption";
import * as T from "fp-ts/Task";
import { flow, pipe } from "fp-ts/function";

export const getStrLn: T.Task<string> = () =>
  new Promise((resolve) => {
    pipe(
      IOO.Do,
      IOO.bind("form", () => IOO.fromNullable(document.querySelector("form"))),
      IOO.bind("input", () =>
        IOO.fromNullable(document.querySelector("input"))
      ),
      IOO.match(warn(`<form> not found.`), ({ form, input }) => {
        const cb = (e: SubmitEvent) => {
          e.preventDefault();
          e.stopPropagation();
          resolve(input.value);
          input.value = "";
          form?.removeEventListener("submit", cb);
        };
        form?.addEventListener("submit", cb);
      })
    )();
  });

export const putStrLn = flow(
  (x: string) =>
    pipe(
      IOO.Do,
      IOO.bind("ol", () => IOO.fromNullable(document.querySelector("ol"))),
      IOO.bind("li", () => IOO.fromNullable(document.createElement("li"))),
      IOO.match(warn(`<ol> not found.`), ({ ol, li }) => {
        li.innerText = x;
        ol?.append(li);
      })
    ),
  T.fromIO
);

export const reload = () => location.reload();
