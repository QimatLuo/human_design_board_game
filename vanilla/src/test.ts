import { main } from "./game";
import { Console, Program, Random } from "./hkt";
import { dropLeft, append } from "fp-ts/ReadonlyArray";
import * as S from "fp-ts/State";
import { pipe } from "fp-ts/function";

class TestData {
  constructor(
    readonly input: ReadonlyArray<string>,
    readonly output: ReadonlyArray<string>,
    readonly nums: ReadonlyArray<number>
  ) {}
  putStrLn(message: string): [void, TestData] {
    return [
      undefined,
      new TestData(this.input, pipe(this.output, append(message)), this.nums),
    ];
  }
  getStrLn(): [string, TestData] {
    return [
      this.input[0],
      new TestData(dropLeft(1)(this.input), this.output, this.nums),
    ];
  }
  nextInt(_upper: number): [number, TestData] {
    return [
      this.nums[0],
      new TestData(this.input, this.output, dropLeft(1)(this.nums)),
    ];
  }
}

const URI = "Test";

type URI = typeof URI;

declare module "fp-ts/HKT" {
  interface URItoKind<A> {
    readonly Test: Test<A>;
  }
}

interface Test<A> extends S.State<TestData, A> {}

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

const testExample = new TestData(["Giulio", "1", "n"], [], [1]);

console.log(mainTestTask(testExample));
