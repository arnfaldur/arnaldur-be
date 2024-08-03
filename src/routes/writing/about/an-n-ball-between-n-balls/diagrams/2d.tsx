import { createEffect, createSignal, onMount } from "solid-js";

// \definecolor{green}{HTML}{52753d}
// \definecolor{red}{HTML}{873839}
// \definecolor{purple}{HTML}{644475}
// \definecolor{gray}{HTML}{595959}
// \definecolor{blue}{HTML}{42538b}
// \definecolor{cyan}{HTML}{328486}
// \definecolor{orange}{HTML}{e09166}
//

const green = "52753d";
const red = "873839";
const purple = "644475";
const gray = "595959";
const blue = "42538b";
const cyan = "328486";
const orange = "e09166";
const brightYellow = "d9b55e";

export default function Diagram2D() {
  const diagramSize = 400;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let showCheckboxRef: HTMLInputElement;
  const [showIntersections, setShowIntersections] = createSignal(true);
  // Wait for the DOM to be fully loaded before drawing on the canvas
  onMount(() => {
    if (!canvas.getContext) {
      return;
    }
    ctx = canvas.getContext("2d");
    if (ctx === null) {
      return;
    }
    // Draw diagram with/without intersections on radio signal changed
    createEffect(() => {
      if (showIntersections()) {
        drawWithIntersections(ctx);
      } else {
        drawWithoutIntersections(ctx);
      }
    });
    // Read the radio button to trigger the above effect
    setShowIntersections(!!showCheckboxRef?.checked);
  });
  return (
    <div>
      <fieldset
        style={{
          width: "min-content",
          "grid-gap": "1em",
          "grid-template-columns": "1fr 1fr",
          "grid-template-rows": "auto",
        }}
      >
        <legend>2D packing</legend>
        <canvas
          ref={canvas}
          id="myCanvas"
          width={diagramSize}
          height={diagramSize}
          style={{ "grid-column": "1 / -1", "justify-self": "center" }}
        />

        <fieldset
          class="accent"
          style={{ display: "flex", "justify-content": "space-around" }}
        >
          <legend>Contact points</legend>
          <label style={{ "justify-self": "center", "margin-bottom": "1em", scale: "1.5", "user-select": "none" }}>
            <input
              ref={showCheckboxRef}
              type="checkbox"
              onInput={(e) => setShowIntersections(e.target.checked)}
              checked
            />
            Show
          </label>
        </fieldset>
      </fieldset>
    </div>
  );
}

function drawWithoutIntersections(ctx: CanvasRenderingContext2D) {
  ctx.reset();
  const squareSize = ctx.canvas.height;
  const quart = squareSize / 4;

  // Draw the square
  ctx.strokeStyle = `#${green}`;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, squareSize, squareSize);

  // Set the radius for the circles
  const radius = quart;

  ctx.fillStyle = `#${blue}`;
  // ctx.fillStyle = `${getComputedStyle(ctx.canvas).getPropertyValue("--accent")}`;

  // Draw the four circles
  [1, 3].forEach((y) => {
    [1, 3].forEach((x) => {
      ctx.beginPath();
      ctx.arc(quart * x, quart * y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // Draw the inner circle
  ctx.fillStyle = `#${red}`;
  // ctx.fillStyle = `${getComputedStyle(ctx.canvas).getPropertyValue("--danger")}`;
  ctx.beginPath();
  ctx.arc(quart * 2, quart * 2, (Math.sqrt(2) - 1) * radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawWithIntersections(ctx: CanvasRenderingContext2D) {
  const squareSize = ctx.canvas.height;
  const quart = squareSize / 4;
  ctx.reset();
  drawWithoutIntersections(ctx);
  drawCross(quart, quart * 2, 5, ctx);
  drawCross(quart * 3, quart * 2, 5, ctx);
  drawCross(quart * 2, quart, 5, ctx);
  drawCross(quart * 2, quart * 3, 5, ctx);

  const innerRadius = ((Math.sqrt(2) - 1) * quart) / Math.sqrt(2);

  drawPlus(quart * 2 + innerRadius, quart * 2 + innerRadius, 5, ctx);
  drawPlus(quart * 2 + innerRadius, quart * 2 - innerRadius, 5, ctx);
  drawPlus(quart * 2 - innerRadius, quart * 2 + innerRadius, 5, ctx);
  drawPlus(quart * 2 - innerRadius, quart * 2 - innerRadius, 5, ctx);
}

function drawCross(x, y, size, ctx: CanvasRenderingContext2D) {
  size = size / Math.sqrt(2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = `#${brightYellow}`;
  ctx.beginPath();
  ctx.moveTo(x - size, y - size);
  ctx.lineTo(x + size, y + size);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size, y + size);
  ctx.lineTo(x + size, y - size);
  ctx.stroke();
}
function drawPlus(x, y, size, ctx: CanvasRenderingContext2D) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = `#${brightYellow}`;
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();
}
