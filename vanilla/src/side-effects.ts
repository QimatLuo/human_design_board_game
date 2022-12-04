/* eslint functional/no-return-void:0, functional/no-expression-statement:0, functional/immutable-data:0, functional/functional-parameters:0, functional/no-return-void:0, @typescript-eslint/prefer-readonly-parameter-types:0 */

import { join } from "fp-ts-std/ReadonlyArray";
import { warn } from "fp-ts/Console";
import * as IOO from "fp-ts/IOOption";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import * as T from "fp-ts/Task";
import { flow, pipe } from "fp-ts/function";
import * as t from "io-ts";

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
  (x: string, defaultInput?: string) =>
    pipe(
      IOO.Do,
      IOO.bind("ol", () => IOO.fromNullable(document.querySelector("ol"))),
      IOO.bind("li", () => IOO.fromNullable(document.createElement("li"))),
      IOO.bind("input", () =>
        IOO.fromNullable(document.querySelector("input"))
      ),
      IOO.match(warn(`<ol> not found.`), ({ ol, li, input }) => {
        li.innerText = x;
        ol?.append(li);
        input.value = defaultInput || "";
      })
    ),
  T.fromIO
);

export function showErrors(es: t.Errors) {
  const msg = pipe(
    es,
    RA.map((x) =>
      pipe(
        O.fromNullable(x.message),
        O.getOrElse(() =>
          pipe(
            x.context,
            RA.map(
              (x) => `Invalid value ${x.actual} supplied to : ${x.type.name}`
            ),
            join(", ")
          )
        )
      )
    ),
    join(", ")
  );
  return pipe(
    IOO.Do,
    IOO.bind("li", () =>
      IOO.fromNullable(
        document.querySelector<HTMLLIElement>("ol > li:last-child")
      )
    ),
    IOO.match(
      () => alert(msg),
      ({ li }) => {
        const span = document.createElement("span");
        span.className = "error";
        span.innerText = msg;
        li.append(span);
      }
    )
  );
}

export const reload = () => location.reload();
