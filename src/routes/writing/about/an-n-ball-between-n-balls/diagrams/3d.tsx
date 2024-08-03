import { createEffect, createSignal, onMount } from "solid-js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

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

const sphereDetail = 10;

export default function Diagram3D() {
  const diagramSize = 400;
  let canvas: HTMLCanvasElement;
  let inputRef: HTMLInputElement;
  const [transitionValue, setTransitionValue] = createSignal(1 / 1000000);

  // Wait for the DOM to be fully loaded before drawing on the canvas
  onMount(() => {
    if (!canvas.getContext) {
      return;
    }
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 1000);
    camera.position.z = 10;
    const controls = new OrbitControls(camera, canvas);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    const group = new THREE.Group();

    // Draw containing box
    {
      const points = [
        new THREE.Vector3(-2, 2, 0),
        new THREE.Vector3(2, 2, 0),
        new THREE.Vector3(2, -2, 0),
        new THREE.Vector3(-2, -2, 0),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x52753d });
      const line = new THREE.LineLoop(geometry, material);
      scene.add(line);
    }

    // Draw the four circles
    [-1, 1].forEach((y) => {
      [-1, 1].forEach((x) => {
        const geometry = new THREE.IcosahedronGeometry(1, sphereDetail);
        const material = new THREE.MeshStandardMaterial({ color: 0x42538b });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(y, x, 0);
        group.add(sphere);
      });
    });

    // Draw the center circle
    const geometry = new THREE.IcosahedronGeometry(
      Math.sqrt(2) - 1,
      sphereDetail,
    );
    const material = new THREE.MeshStandardMaterial({ color: 0x873839 });
    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);

    scene.add(group);

    function animate() {
      controls.update();
      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);

    createEffect(() => {
      group.scale.set(1, 1, Math.max(1 / 1000000, transitionValue()));
      directionalLight.position.set(
        Math.pow(transitionValue(), 2),
        Math.pow(transitionValue(), 2),
        1,
      );
    });
    // // Read the radio button to trigger the above effect
    setTransitionValue(inputRef?.value);
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
        <legend>3D packing</legend>
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
          <legend>Add 3rd dimension</legend>
          <label
            style={{
              "justify-self": "center",
              "margin-bottom": "0.5em",
              scale: "1.5",
              "user-select": "none",
            }}
          >
            <input
              ref={inputRef}
              type="range"
              value={0}
              min={0}
              max={1}
              step={1 / 1024}
              onInput={(e) => setTransitionValue(e.target.value)}
            />
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
