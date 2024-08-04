import { createEffect, createSignal, onMount } from "solid-js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const green = "52753d";
const red = "873839";
const purple = "644475";
const gray = "595959";
const blue = "42538b";
const cyan = "328486";
const orange = "e09166";
const brightYellow = "d9b55e";

const sphereDetail = 10;

export default function Diagram3D2() {
  const diagramSize = 400;
  let canvas: HTMLCanvasElement;
  let inputRef: HTMLInputElement;
  let input2Ref: HTMLInputElement;
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
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const sphereGeometry = new THREE.IcosahedronGeometry(1, sphereDetail);

    const ballGroup = new THREE.Group();

    // Draw containing box
    const box = createBox();
    scene.add(box);

    // Draw the four circles
    [-1, 1].forEach((y) => {
      [-1, 1].forEach((x) => {
        const geometry = new THREE.IcosahedronGeometry(1, sphereDetail);
        const material = new THREE.MeshStandardMaterial({ color: 0x42538b });
        const outerBall = new THREE.Mesh(geometry, material);
        outerBall.position.set(y, x, 1);
        ballGroup.add(outerBall);
      });
    });

    // Draw the center circle
    const geometry = new THREE.IcosahedronGeometry(1, sphereDetail);
    const material = new THREE.MeshStandardMaterial({ color: 0x873839 });
    const centerBall = new THREE.Mesh(geometry, material);
    centerBall.scale.setScalar(Math.SQRT2 - 1);
    scene.add(centerBall);

    scene.add(ballGroup);

    function animate() {
      controls.update();
      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);

    createEffect(() => {
      centerBall.position.z = 1 - transitionValue();
      centerBall.scale.setScalar(
        Math.SQRT2 / Math.cos(Math.atan(transitionValue() / Math.SQRT2)) - 1,
      );
    });
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
          <legend>Shift to 3D center</legend>
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
              ref={input2Ref}
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

function createBox() {
  const points = [
    new THREE.Vector3(-2, -2, -2),
    new THREE.Vector3(-2, -2, 2),
    new THREE.Vector3(-2, -2, -2),
    new THREE.Vector3(-2, 2, -2),
    new THREE.Vector3(-2, -2, -2),
    new THREE.Vector3(2, -2, -2),

    new THREE.Vector3(-2, 2, 2),
    new THREE.Vector3(2, 2, 2),
    new THREE.Vector3(-2, 2, 2),
    new THREE.Vector3(-2, -2, 2),
    new THREE.Vector3(-2, 2, 2),
    new THREE.Vector3(-2, 2, -2),

    new THREE.Vector3(2, -2, 2),
    new THREE.Vector3(-2, -2, 2),
    new THREE.Vector3(2, -2, 2),
    new THREE.Vector3(2, 2, 2),
    new THREE.Vector3(2, -2, 2),
    new THREE.Vector3(2, -2, -2),

    new THREE.Vector3(2, 2, -2),
    new THREE.Vector3(-2, 2, -2),
    new THREE.Vector3(2, 2, -2),
    new THREE.Vector3(2, -2, -2),
    new THREE.Vector3(2, 2, -2),
    new THREE.Vector3(2, 2, 2),
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x52753d });
  const box = new THREE.LineSegments(geometry, material);
  return box;
}
