/* eslint functional/no-return-void: "off" */
/* eslint functional/functional-parameters: "off" */
/* eslint functional/no-expression-statement: "off" */

import { main } from "./game";
import { consoleTask, programTask, randomTask } from "./instances";
import "./style.css";
import "./test";

document
  .querySelector<HTMLFormElement>("form")
  ?.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

main({
  ...programTask,
  ...consoleTask,
  ...randomTask,
})().then(() => location.reload()).catch(e => {
  console.log(e)
  alert('Something went wrong')
});
