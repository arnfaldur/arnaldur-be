import { Setter, createEffect, createSignal, onMount } from "solid-js";
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

export function Diagram3D1() {
  const [transitionValue, setTransitionValue] = createSignal(0);

  const initCanvas = (canvas) => {
    canvas.setAttribute("width", getComputedStyle(canvas.parentNode).width);
    diag3d1(canvas, transitionValue);
  };

  return (
    <>
      <canvas ref={initCanvas} height="400" />
      <fieldset>
        <legend>Add 3rd dimension</legend>
        <Slider setValue={setTransitionValue} />
      </fieldset>
    </>
  );
}

export function Diagram3D2() {
  const [transitionValue, setTransitionValue] = createSignal(0);

  const initCanvas = (canvas) => {
    canvas.setAttribute("width", getComputedStyle(canvas.parentNode).width);
    diag3d2(canvas, transitionValue);
  };

  return (
    <>
      <canvas ref={initCanvas} height="400" />
      <fieldset>
        <legend>Add 3rd dimension</legend>
        <Slider setValue={setTransitionValue} />
      </fieldset>
    </>
  );
}

const Slider = (props) => {
  return (
    <input
      ref={(el) => props.setValue(el.value)}
      type="range"
      value={0}
      max={1}
      step="any"
      onInput={(e) => props.setValue(e.target.value)}
      style={{
        scale: "1.5",
        width: "66%",
        margin: "0 auto 0.75rem auto",
      }}
    />
  );
};

const diag3d1 = (canvas: HTMLCanvasElement, transitionValue: Function) => {
  const { scene, directionalLight } = setupScene(canvas);
  {
    const group = new THREE.Group();

    // Draw containing box
    const box = createBox();
    // box.scale.z = 0;
    group.add(box);

    // Draw the four circles
    [-1, 1].forEach((y) => {
      [-1, 1].forEach((x) => {
        [-1, 1].forEach((z) => {
          const geometry = new THREE.IcosahedronGeometry(1, sphereDetail);
          const material = new THREE.MeshStandardMaterial({ color: 0x42538b });
          const outerBall = new THREE.Mesh(geometry, material);
          outerBall.position.set(y, x, z);
          group.add(outerBall);
        });
      });
    });

    // Draw the center circle
    const geometry = new THREE.IcosahedronGeometry(1, sphereDetail);
    const material = new THREE.MeshStandardMaterial({ color: 0x873839 });
    const centerBall = new THREE.Mesh(geometry, material);
    centerBall.scale.setScalar(Math.SQRT2 - 1);
    group.add(centerBall);

    scene.add(group);

    createEffect(() => {
      group.scale.set(1, 1, Math.max(1 / 10000, transitionValue()));
      directionalLight.position.set(
        Math.pow(transitionValue(), 2),
        Math.pow(transitionValue(), 2),
        1,
      );
      centerBall.scale.setScalar(
        (Math.SQRT2 - 1) * (1 - transitionValue()) +
          (Math.sqrt(3) - 1) * transitionValue(),
      );
      // centerBall.scale.setScalar(
      //   Math.SQRT2 / Math.cos(Math.atan(transitionValue() / Math.SQRT2)) - 1,
      // );
    });
  }
};

const diag3d2 = (canvas: HTMLCanvasElement, transitionValue: Function) => {
  const { scene } = setupScene(canvas);

  const firstBallGroup = new THREE.Group();

  // Add containing box
  const box = createBox();
  scene.add(box);

  // Add the outer spheres
  [-1, 1].forEach((y) => {
    [-1, 1].forEach((x) => {
      const geometry = new THREE.IcosahedronGeometry(1, sphereDetail);
      const material = new THREE.MeshStandardMaterial({ color: 0x42538b });
      const outerBall = new THREE.Mesh(geometry, material);
      outerBall.position.set(y, x, 0);
      firstBallGroup.add(outerBall);
    });
  });
  scene.add(firstBallGroup);

  const secondBallGroup = new THREE.Group();
  [-1, 1].forEach((y) => {
    [-1, 1].forEach((x) => {
      const geometry = new THREE.IcosahedronGeometry(1, sphereDetail);
      const material = new THREE.MeshStandardMaterial({ color: 0x42538b });
      const outerBall = new THREE.Mesh(geometry, material);
      outerBall.position.set(y, x, 0);
      secondBallGroup.add(outerBall);
    });
  });
  secondBallGroup.position.z = -1;
  scene.add(secondBallGroup);

  // Draw the center circle
  const centerBallGroup = new THREE.Group();
  const geometry = new THREE.IcosahedronGeometry(1, sphereDetail);
  const material = new THREE.MeshStandardMaterial({ color: 0x873839 });
  const centerBall = new THREE.Mesh(geometry, material);
  centerBall.scale.setScalar(Math.SQRT2 - 1);
  centerBallGroup.add(centerBall);

  scene.add(centerBallGroup);

  // Draw contact points

  const contactPointGroup = new THREE.Group();
  [-1, 1].forEach((y) => {
    [-1, 1].forEach((x) => {
      const contactPoint = createContactPoint();
      contactPoint.position.set(y, x, -2);
      contactPointGroup.add(contactPoint);
    });
  });
  scene.add(contactPointGroup);

  createEffect(() => {
    const animA = easeInOutQuad(
      THREE.MathUtils.clamp(transitionValue() * 3 - 0, 0, 1),
    );
    const animB = easeInOutQuad(
      THREE.MathUtils.clamp(transitionValue() * 3 - 1, 0, 1),
    );
    const animC = easeInOutQuad(
      THREE.MathUtils.clamp(transitionValue() * 3 - 2, 0, 1),
    );
    box.position.z = -animA + animB;
    box.scale.z = animA;
    centerBallGroup.scale.z = Math.max(1 / 10000, animA);
    firstBallGroup.scale.z = Math.max(1 / 10000, animA);
    firstBallGroup.position.z = animB;
    centerBall.scale.setScalar(
      Math.SQRT2 / Math.cos(Math.atan(animB / Math.SQRT2)) - 1,
    );
    secondBallGroup.children.map((sphere) => {
      sphere.scale.setScalar(animC);
    });
  });
};

function setupScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setSize(canvas.width, canvas.height);
  let aspectRatio = canvas.width / canvas.height;

  const scene = new THREE.Scene();
  const cH = 2.5; // camera height
  let cW = cH * aspectRatio; // camera width
  const camera = new THREE.OrthographicCamera(-cW, cW, cH, -cH, 0.1, 1000);

  window.addEventListener("resize", () => {
    canvas.setAttribute("width", getComputedStyle(canvas.parentNode).width);
    renderer.setSize(canvas.width, canvas.height);
    aspectRatio = canvas.width / canvas.height;
    cW = cH * aspectRatio;
    camera.left = -cW;
    camera.right = cW;
    camera.updateProjectionMatrix();
  });

  camera.position.z = 10;
  const controls = new OrbitControls(camera, canvas);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0;

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  directionalLight.position.set(0, 0, 1);
  scene.add(directionalLight);

  function animate() {
    controls.update();
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);

  return { scene, controls, renderer, camera, directionalLight };
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

function createContactPoint() {
  const r = 0.05;
  const points = [
    new THREE.Vector3(-r, 0, 0),
    new THREE.Vector3(r, 0, 0),
    new THREE.Vector3(0, -r, 0),
    new THREE.Vector3(0, r, 0),
    new THREE.Vector3(0, 0, -r),
    new THREE.Vector3(0, 0, r),
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xd9b55e });
  material.depthTest = false;
  const contactPoint = new THREE.LineSegments(geometry, material);
  contactPoint.renderOrder = 999;
  return contactPoint;
}

function easeInOutQuad(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}
function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}
