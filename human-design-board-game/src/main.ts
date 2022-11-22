import { main } from "./game";
import { consoleTask, programTask, randomTask } from "./instances";
import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
`;

main({
  ...programTask,
  ...consoleTask,
  ...randomTask,
})();
