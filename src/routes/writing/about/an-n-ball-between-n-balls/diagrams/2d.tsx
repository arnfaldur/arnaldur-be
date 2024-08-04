import { onMount } from "solid-js";
import * as THREE from "three";


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
    group.scale.z = 1/1000000;

    scene.add(group);

    function animate() {
      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);
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
      </fieldset>
    </div>
  );
}
