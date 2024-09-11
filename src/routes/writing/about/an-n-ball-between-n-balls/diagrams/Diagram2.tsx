import { createEffect, createSignal, batch } from "solid-js";
import * as THREE from "three";

import {
    createBox,
    createBall,
    createSquare,
    setupScene,
    sphereDetail,
} from "./utilities";
import { Slider, Checkbox } from "./components";
import { asin, atan, cos, sec, sin, tan } from "./math";

export const Diagram2 = Diagram2inner;

const [centerSphere, setCenterSphere] = createSignal(0);
const [diagonalization, setDiagonalization] = createSignal(0);
const [linkSliders, setLinkSliders] = createSignal(false);
const [isolatePlane, setIsolatePlane] = createSignal(false);

let centerSphereSlider: HTMLInputElement;
let diagonalizationSlider: HTMLInputElement;
let linkSlidersCheckbox: HTMLInputElement;
let isolatePlaneCheckbox: HTMLInputElement;
const updateCenterSphere = (value: number) =>
    batch(() => {
        setCenterSphere(value);
        if (linkSliders()) {
            const transformed = Math.atan(value) / Math.atan(1);
            setDiagonalization(transformed);
            diagonalizationSlider.value = transformed.toString();
        }
    });
const updateDiagonalization = (value: number) =>
    batch(() => {
        setDiagonalization(value);
        if (linkSliders()) {
            const transformed = Math.tan(value * Math.atan(1));
            setCenterSphere(transformed);
            centerSphereSlider.value = transformed.toString();
        }
    });

function setFormer() {
    batch(() => {
        setCenterSphere(0);
        centerSphereSlider.value = "0";
        setDiagonalization(0);
        diagonalizationSlider.value = "0";
        setLinkSliders(true);
        linkSlidersCheckbox.checked = true;
        setIsolatePlane(true);
        isolatePlaneCheckbox.checked = true;
    });
}
function setLatter() {
    batch(() => {
        setCenterSphere(1);
        centerSphereSlider.value = "1";
        setDiagonalization(1);
        diagonalizationSlider.value = "1";
        setLinkSliders(true);
        linkSlidersCheckbox.checked = true;
        setIsolatePlane(true);
        isolatePlaneCheckbox.checked = true;
    });
}

export function Former() {
    return <button onClick={setFormer}>former</button>;
}

export function Latter() {
    return <button onClick={setLatter}>latter</button>;
}

function Diagram2inner() {
    const initCanvas = (canvas: HTMLCanvasElement) => {
        if (canvas.parentElement === null) return;
        canvas.setAttribute(
            "width",
            getComputedStyle(canvas.parentElement).width
        );
        diagram3D2(canvas, centerSphere, diagonalization, isolatePlane);
    };

    return (
        <>
            <canvas ref={initCanvas} height="400" />
            <fieldset>
                <legend>Migrate center ball</legend>
                <Slider
                    ref={centerSphereSlider}
                    setValue={updateCenterSphere}
                />
            </fieldset>
            <fieldset>
                <legend>Rotate intersecting plane</legend>
                <Slider
                    ref={diagonalizationSlider}
                    setValue={updateDiagonalization}
                />
            </fieldset>
            <Checkbox ref={linkSlidersCheckbox} setValue={setLinkSliders}>
                Link sliders
            </Checkbox>
            <Checkbox ref={isolatePlaneCheckbox} setValue={setIsolatePlane}>
                Isolate plane
            </Checkbox>
        </>
    );
}

const diagram3D2 = (
    canvas: HTMLCanvasElement,
    centerTransition: Function,
    diagonalization: Function,
    isolatePlane: Function
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
                    color: 4346763,
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
        color: 8861753,
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
            color: 4346763,
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
        color: 8861753,
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
        square.position.z = 1 - Math.tan(rads1);
        square.scale.x = 1 / Math.cos(rads1);

        // pivot rotating circles
        firstCircleGroup.children.forEach((circle) => {
            circle.rotation.y = rads1;
        });
        // orthogonal disappearing circles
        secondCircleGroup.children.forEach((circle) => {
            circle.rotation.y = rads1;
            circle.position.x = (2 * cos(rads1)) / sec(rads1) - 1;
            circle.position.z = 1 - (2 * Math.sin(rads1)) / sec(rads1);
            circle.scale.setScalar(
                Math.cos(Math.asin((2 * Math.tan(rads1)) / sec(rads1)))
            );
        });

        // diagonal appearing circles
        const rads1Inv = ((1 - animDiag) * Math.PI) / 4;
        const secTrigScale2 = 2 * Math.SQRT2 * Math.cos(rads1Inv);
        thirdCircleGroup.children.forEach((circle) => {
            circle.rotation.y = rads1;
            circle.position.x =
                (2 * Math.SQRT2 * cos(rads1)) / sec(rads1Inv) - 1;
            circle.position.z =
                1 - (2 * Math.SQRT2 * sin(rads1)) / sec(rads1Inv);
            circle.scale.setScalar(
                cos(asin((2 * Math.SQRT2 * tan(rads1Inv)) / sec(rads1Inv)))
            );
        });
    });
    // Center ball transforms
    createEffect(() => {
        const animCenter = centerTransition();
        // center ball
        const centerBallScale = Math.sqrt(animCenter * animCenter + 2) - 1;
        centerBall.scale.setScalar(centerBallScale);
        centerBall.position.z = 1 - animCenter;
    });
    // Center circle transforms
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
            Math.cos(
                Math.asin((Math.tan(rads3) * secTrigScale3) / centerBallScale)
            ) * centerBallScale
        );
    });
    // isolate plane perspective
    createEffect(() => {
        const animDiag = diagonalization();
        const rads1 = (animDiag * Math.PI) / 4;

        if (isolatePlane()) {
            camera.position.set(Math.tan(rads1) * 10, 0, 10);
            controls.update();
            directionalLight.position.set(Math.tan(rads1), 0, 1);
            intersectingPlane.position.z = animDiag - 1;
        }
    });
    // isolate plane disabled
    createEffect(() => {
        box.visible = !isolatePlane();
        outerBallGroup.visible = !isolatePlane();
        centerBallGroup.visible = !isolatePlane();
        if (!isolatePlane()) {
            camera.position.set(6, 6, 10);
            controls.update();
            directionalLight.position.set(1, 1, 1);
            intersectingPlane.position.z = 0;
        }
    });
};
