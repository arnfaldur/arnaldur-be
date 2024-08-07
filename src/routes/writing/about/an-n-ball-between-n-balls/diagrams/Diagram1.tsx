import { createSignal, createEffect } from "solid-js";
import * as THREE from "three";

import {
  createBox,
  createBall,
  createContactPoint,
  easeInOutQuad,
  setupScene,
} from "./utilities";
import { Slider, Checkbox } from "./components";

// export const Diagram3D2 = clientOnly(() =>
//   Promise.resolve({ default: Diagram3D2inner }),
// );
export const Diagram1 = Diagram1inner;

function Diagram1inner() {
  const [transitionValue, setTransitionValue] = createSignal(0);
  const [contacts, setContacts] = createSignal(false);
  const [disect, setDisect] = createSignal(false);

  const initCanvas = (canvas: HTMLCanvasElement) => {
    if (canvas.parentElement === null) return;
    canvas.setAttribute("width", getComputedStyle(canvas.parentElement).width);
    diagram3D1(canvas, transitionValue, contacts, disect);
  };

  return (
    <>
      <canvas ref={initCanvas} height="400" />
      <fieldset>
        <legend>Add 3rd dimension</legend>
        <Slider setValue={setTransitionValue} />
      </fieldset>
      <Checkbox setValue={setContacts}>Show contact points</Checkbox>
      <Checkbox setValue={setDisect}>Disect construction</Checkbox>
    </>
  );
}

const diagram3D1 = (
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
        color: 4346763,
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
    color: 8861753,
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
