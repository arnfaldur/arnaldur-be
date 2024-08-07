import { clientOnly } from "@solidjs/start";
import { createEffect, createSignal, batch } from "solid-js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import {
  createBox,
  createBall,
  createContactPoint,
  easeInOutQuad,
  createSquare,
} from "./utilities";

const green = "52753d";
const red = "873839";
const purple = "644475";
const gray = "595959";
const blue = "42538b";
const cyan = "328486";
const orange = "e09166";
const brightYellow = "d9b55e";

export const sphereDetail = 10;

export function Diagram3D1() {
  const [transitionValue, setTransitionValue] = createSignal(0);

  const initCanvas = (canvas: HTMLCanvasElement) => {
    if (canvas.parentElement === null) return;
    canvas.setAttribute("width", getComputedStyle(canvas.parentElement).width);
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

// export const Diagram3D2 = clientOnly(() =>
//   Promise.resolve({ default: Diagram3D2inner }),
// );
export const Diagram3D2 = Diagram3D2inner;

function Diagram3D2inner() {
  const [transitionValue, setTransitionValue] = createSignal(0);
  const [contacts, setContacts] = createSignal(false);
  const [disect, setDisect] = createSignal(false);

  const initCanvas = (canvas: HTMLCanvasElement) => {
    if (canvas.parentElement === null) return;
    canvas.setAttribute("width", getComputedStyle(canvas.parentElement).width);
    diag3d2(canvas, transitionValue, contacts, disect);
  };

  return (
    <>
      <canvas ref={initCanvas} height="400" />
      <fieldset>
        <legend>Add 3rd dimension</legend>
        <Slider setValue={setTransitionValue} />
      </fieldset>
      <Checkbox setValue={setContacts}>Show contact points</Checkbox>
      <Checkbox setValue={setDisect}>Disect balls</Checkbox>
    </>
  );
}

export const Diagram3D3 = Diagram3D3inner;

function Diagram3D3inner() {
  const [centerSphere, setCenterSphere] = createSignal(0);
  const [diagonalization, setDiagonalization] = createSignal(0);
  const [linkSliders, setLinkSliders] = createSignal(false);
  const [isolateIntersection, setIsolateIntersection] = createSignal(false);

  const initCanvas = (canvas: HTMLCanvasElement) => {
    if (canvas.parentElement === null) return;
    canvas.setAttribute("width", getComputedStyle(canvas.parentElement).width);
    diag3d3(canvas, centerSphere, diagonalization, isolateIntersection);
  };

  let centerSphereSlider: HTMLInputElement;
  let diagonalizationSlider: HTMLInputElement;
  const updateCenterSphere = (value: number) =>
    batch(() => {
      setCenterSphere(value);
      if (linkSliders()) {
        const transformed = (Math.atan(value) * 4) / Math.PI;
        setDiagonalization(transformed);
        diagonalizationSlider.value = transformed.toString();
      }
    });
  const updateDiagonalization = (value) =>
    batch(() => {
      setDiagonalization(value);
      if (linkSliders()) {
        const transformed = Math.tan((value * Math.PI) / 4);
        setCenterSphere(transformed);
        centerSphereSlider.value = transformed.toString();
      }
    });
  return (
    <>
      <canvas ref={initCanvas} height="400" />
      <fieldset>
        <legend>Migrate center ball</legend>
        <Slider ref={centerSphereSlider} setValue={updateCenterSphere} />
      </fieldset>
      <fieldset>
        <legend>Rotate intersecting plane</legend>
        <Slider ref={diagonalizationSlider} setValue={updateDiagonalization} />
      </fieldset>
      <Checkbox setValue={setLinkSliders}>Link sliders</Checkbox>
      <Checkbox setValue={setIsolateIntersection}>Isolate plane</Checkbox>
    </>
  );
}

const Checkbox = (props) => (
  <label
    style={{
      scale: "1.25",
      width: "calc(100% / 1.25)",
      margin: "0 auto 0.75rem auto",
    }}
  >
    <input
      ref={(el) => props.setValue(el.checked)}
      type="checkbox"
      onInput={(e) => props.setValue(e.target.checked)}
    />
    {props.children}
  </label>
);

const Slider = (props) => (
  <input
    ref={(el) => {
      props.setValue(el.value);
      if (props.ref) {
        props.ref(el);
      }
    }}
    type="range"
    value={0}
    max={1}
    step="any"
    onInput={(e) => props.setValue(e.target.value)}
    style={{
      scale: "1.5",
      width: "calc(100% / 1.5)",
      margin: "0 auto 0.75rem auto",
    }}
  />
);

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
    });
  }
};

const diag3d2 = (
  canvas: HTMLCanvasElement,
  transitionValue: Function,
  contacts: Function,
  disect: Function,
) => {
  const { scene, directionalLight, camera, renderer } = setupScene(canvas);
  let cameraShiftMemory = 0;

  const clippingPlane = new THREE.Plane(new THREE.Vector3(1, -1, 0), 0);

  // Add containing box
  const box = createBox();
  scene.add(box);

  const firstBallGroup = new THREE.Group();

  // Add the outer spheres
  [-1, 1].forEach((y) => {
    [-1, 1].forEach((x) => {
      const outerBall = createBall({
        color: 0x42538b,
        clippingPlanes: [clippingPlane],
      });
      outerBall.position.set(y, x, 0);
      firstBallGroup.add(outerBall);
    });
  });
  scene.add(firstBallGroup);

  const secondBallGroup = firstBallGroup.clone();
  secondBallGroup.position.z = -1;
  scene.add(secondBallGroup);

  // Draw the center circle
  const centerBallGroup = new THREE.Group();
  const centerBall = createBall({
    color: 0x873839,
    clippingPlanes: [clippingPlane],
  });
  centerBall.scale.setScalar(Math.SQRT2 - 1);
  centerBallGroup.add(centerBall);

  scene.add(centerBallGroup);

  // Draw contact points

  const firstContactPointGroup = new THREE.Group();
  [-1, 1].forEach((y) => {
    [-1, 1].forEach((x) => {
      const contactPoint = createContactPoint();
      contactPoint.position.set(
        y * (1 - Math.SQRT2 / 2),
        x * (1 - Math.SQRT2 / 2),
        0,
      );
      firstContactPointGroup.add(contactPoint);
    });
  });
  scene.add(firstContactPointGroup);
  const secondContactPointGroup = new THREE.Group();
  [-1, 1].forEach((y) => {
    [-1, 1].forEach((x) => {
      const contactPoint = createContactPoint();
      const lateralScale = 1 - Math.sqrt(3) / 3;
      contactPoint.position.set(
        y * lateralScale,
        x * lateralScale,
        Math.sqrt(3) / 3 - 1,
      );
      secondContactPointGroup.add(contactPoint);
    });
  });
  secondContactPointGroup.visible = false;
  scene.add(secondContactPointGroup);

  createEffect(() => {
    // animation controllers
    const animA = easeInOutQuad(
      THREE.MathUtils.clamp(transitionValue() * 3 - 0, 0, 1),
    );
    const animB = easeInOutQuad(
      THREE.MathUtils.clamp(transitionValue() * 3 - 1, 0, 1),
    );
    const animC = easeInOutQuad(
      THREE.MathUtils.clamp(transitionValue() * 3 - 2, 0, 1),
    );
    const cameraShift = Math.max(0, animA - cameraShiftMemory);
    cameraShiftMemory = Math.max(cameraShiftMemory, animA);
    // First phase
    box.position.z = -animA + animB;
    box.scale.z = animA;
    centerBallGroup.scale.z = Math.max(1 / 10000, animA);
    firstBallGroup.scale.z = Math.max(1 / 10000, animA);
    directionalLight.position.set(Math.pow(animA, 2), Math.pow(animA, 2), 1);
    camera.position.x -= cameraShift * 6;
    camera.position.y += cameraShift * 4;
    // Second phase
    firstBallGroup.position.z = animB;
    // Math.SQRT2 / Math.cos(Math.atan(animB / Math.SQRT2)) - 1 simplifies to:
    const centerBallScale = Math.sqrt(animB * animB + 2) - 1;
    centerBall.scale.setScalar(centerBallScale);
    // Third phase
    secondBallGroup.children.map((sphere) => {
      sphere.scale.setScalar(animC);
    });
    // Contact points
    const sphereAngle = Math.atan(animB / Math.SQRT2);
    firstContactPointGroup.children.map((contactPoint, i) => {
      const y = [-1, -1, 1, 1][i];
      const x = [-1, 1, -1, 1][i];
      const lateralScale =
        ((Math.cos(sphereAngle) * Math.SQRT2) / 2) * centerBallScale;
      contactPoint.position.set(
        y * lateralScale,
        x * lateralScale,
        Math.sin(sphereAngle) * centerBallScale,
      );
    });
  });
  createEffect(() => {
    firstContactPointGroup.visible = contacts();
  });
  createEffect(() => {
    secondContactPointGroup.visible = transitionValue() >= 1 && contacts();
  });
  createEffect(() => {
    renderer.localClippingEnabled = disect();
  });
};

const diag3d3 = (
  canvas: HTMLCanvasElement,
  centerTransition: Function,
  diagonalization: Function,
  isolateIntersection: Function,
) => {
  const { scene, directionalLight, camera, controls, renderer } =
    setupScene(canvas);
  directionalLight.position.set(1, 1, 1);

  // Add containing box
  const box = createBox();
  scene.add(box);

  const outerBallGroup = new THREE.Group();

  // Add the outer spheres
  [-1, 1].forEach((z) => {
    [-1, 1].forEach((y) => {
      [-1, 1].forEach((x) => {
        const outerBall = createBall({
          color: 0x42538b,
          transparent: true,
          opacity: 0.25,
        });
        outerBall.position.set(y, x, z);
        outerBallGroup.add(outerBall);
      });
    });
  });
  scene.add(outerBallGroup);

  // Draw the center ball
  const centerBallGroup = new THREE.Group();
  const centerBall = createBall({
    color: 0x873839,
    transparent: true,
    opacity: 0.25,
  });
  centerBall.scale.setScalar(Math.sqrt(3) - 1);
  centerBallGroup.add(centerBall);

  scene.add(centerBallGroup);

  const intersectingPlane = new THREE.Group();

  const square = createSquare();
  square.position.z = 1;
  square.visible = true;
  intersectingPlane.add(square);

  const outerCircleGroup = new THREE.Group();
  const firstCircleGroup = new THREE.Group();
  [-1, 1].forEach((y) => {
    const geometry = new THREE.CircleGeometry(1, sphereDetail * 6);
    const material = new THREE.MeshStandardMaterial({
      color: 0x42538b,
      side: THREE.DoubleSide,
    });
    const outerCircle = new THREE.Mesh(geometry, material);
    outerCircle.position.set(-1, y, 1);
    firstCircleGroup.add(outerCircle);
  });
  outerCircleGroup.add(firstCircleGroup);

  const secondCircleGroup = firstCircleGroup.clone();
  secondCircleGroup.children.forEach((outerCircle) => {
    outerCircle.position.x = 1;
  });
  outerCircleGroup.add(secondCircleGroup);

  const thirdCircleGroup = firstCircleGroup.clone();
  thirdCircleGroup.children.forEach((outerCircle) => {
    outerCircle.position.x = 1;
    outerCircle.scale.setScalar(0);
  });
  outerCircleGroup.add(thirdCircleGroup);
  intersectingPlane.add(outerCircleGroup);

  // Draw the center circle
  const centerCircleGroup = new THREE.Group();
  const geometry = new THREE.CircleGeometry(1, sphereDetail * 6);
  const material = new THREE.MeshStandardMaterial({
    color: 0x873839,
    side: THREE.DoubleSide,
  });
  const centerCircle = new THREE.Mesh(geometry, material);
  centerCircle.position.z = 1;
  centerCircle.scale.setScalar(Math.sqrt(2) - 1);
  centerCircleGroup.add(centerCircle);

  intersectingPlane.add(centerCircleGroup);
  scene.add(intersectingPlane);

  createEffect(() => {
    const animDiag = diagonalization();
    const rads1 = (animDiag * Math.PI) / 4;

    square.rotation.y = rads1;
    square.position.z = 1 - animDiag;
    // square.scale.x = Math.sqrt(1 + Math.pow(animDiag, 2));
    square.scale.x = 1 / Math.cos(rads1);

    // pivot rotating circles
    firstCircleGroup.children.forEach((circle) => {
      circle.rotation.y = rads1;
    });
    // orthogonal disappearing circles
    const secTrigScale1 = 2 * Math.cos(rads1);
    secondCircleGroup.children.forEach((circle) => {
      circle.rotation.y = rads1;
      circle.position.z = 1 - Math.sin(rads1) * secTrigScale1;
      circle.position.x = Math.cos(rads1) * secTrigScale1 - 1;
      circle.scale.setScalar(
        Math.cos(Math.asin(Math.tan(rads1) * secTrigScale1)),
      );
    });

    // diagonal appearing circles
    const rads2 = ((1 - animDiag) * Math.PI) / 4;
    const secTrigScale2 = 2 * Math.SQRT2 * Math.cos(rads2);
    thirdCircleGroup.children.forEach((circle) => {
      circle.rotation.y = rads1;
      circle.position.z = 1 - Math.sin(rads1) * secTrigScale2;
      circle.position.x = Math.cos(rads1) * secTrigScale2 - 1;
      circle.scale.setScalar(
        Math.cos(Math.asin(Math.tan(rads2) * secTrigScale2)),
      );
    });
  });
  createEffect(() => {
    const animCenter = centerTransition();
    // center ball
    const centerBallScale = Math.sqrt(animCenter * animCenter + 2) - 1;
    centerBall.scale.setScalar(centerBallScale);
    centerBall.position.z = 1 - animCenter;
  });
  createEffect(() => {
    const animDiag = diagonalization();
    const animCenter = centerTransition();
    const rads1 = (animDiag * Math.PI) / 4;

    // center circle
    centerCircle.rotation.y = rads1;
    const rads3 = (animDiag * Math.PI) / 4 - Math.atan(animCenter);
    const secTrigScale3 =
      Math.sqrt(1 + Math.pow(animCenter, 2)) * Math.cos(rads3);
    centerCircle.position.z = 1 - Math.sin(rads1) * secTrigScale3;
    centerCircle.position.x = Math.cos(rads1) * secTrigScale3 - 1;
    const centerBallScale = Math.sqrt(animCenter * animCenter + 2) - 1;
    centerCircle.scale.setScalar(
      Math.cos(Math.asin((Math.tan(rads3) * secTrigScale3) / centerBallScale)) *
        centerBallScale,
    );
  });
  createEffect(() => {
    const animDiag = diagonalization();
    const rads1 = (animDiag * Math.PI) / 4;

    if (isolateIntersection()) {
      camera.position.set(Math.tan(rads1) * 10, 0, 10);
      controls.update();
      intersectingPlane.position.z = animDiag - 1;
    }
  });
  createEffect(() => {
    box.visible = !isolateIntersection();
    outerBallGroup.visible = !isolateIntersection();
    centerBallGroup.visible = !isolateIntersection();
    if (!isolateIntersection()) {
      camera.position.set(-6, 4, 10);
      controls.update();
      intersectingPlane.position.z = 0;
    }
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
    if (canvas.parentElement === null) return;
    canvas.setAttribute("width", getComputedStyle(canvas.parentElement).width);
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
