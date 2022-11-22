import { main } from "./game";
import { consoleTask, programTask, randomTask } from "./instances";
import "./style.css";

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
})().then(() => location.reload());
