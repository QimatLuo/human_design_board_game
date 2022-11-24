/* eslint functional/no-return-void: "off" */
/* eslint functional/functional-parameters: "off" */
/* eslint functional/no-expression-statement: "off" */

import { main } from "./game";
import { Console, Program, Random } from "./hkt";
import { dropLeft, append } from "fp-ts/ReadonlyArray";
import * as S from "fp-ts/State";
import { pipe } from "fp-ts/function";


interface TestDataType {
  readonly putStrLn: (s: string) => readonly [undefined, TestDataType];
  readonly getStrLn: () => readonly [string, TestDataType];
  readonly nextInt: (n: number) => readonly [number, TestDataType];
}

function TestData(
  input: ReadonlyArray<string>,
  output: ReadonlyArray<string>,
  nums: ReadonlyArray<number>
):TestDataType {
  return {
    putStrLn(message: string) {
      return [
        undefined,
        TestData(input, pipe(output, append(message)), nums),
      ] as const;
    },
    getStrLn() {
      return [input[0], TestData(dropLeft(1)(input), output, nums)] as const;
    },
    nextInt() {
      return [nums[0], TestData(input, output, dropLeft(1)(nums))] as const;
    },
  } as const;
}

const URI = "Test";

type URI = typeof URI;

declare module "fp-ts/HKT" {
  interface URItoKind<A> {
    readonly Test: Test<A>;
  }
}

type Test<A> = (s: TestDataType) => readonly [A, TestDataType]

const of =
  <A>(a: A): Test<A> =>
  (data) =>
    [a, data];

const programTest: Program<URI> = {
  ...S.Monad,
  URI,
  finish: of,
};

const consoleTest: Console<URI> = {
  putStrLn: (message) => (data) => data.putStrLn(message),
  getStrLn: (data) => data.getStrLn(),
};

const randomTest: Random<URI> = {
  nextInt: (upper) => (data) => {
    return data.nextInt(upper);
  },
};

const mainTestTask = main({
  ...programTest,
  ...consoleTest,
  ...randomTest,
});

const testExample = TestData(["Giulio", "1", "n"], [], [1]);

console.log(mainTestTask(testExample));
