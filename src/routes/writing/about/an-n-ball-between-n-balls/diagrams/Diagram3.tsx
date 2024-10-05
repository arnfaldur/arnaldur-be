import { createEffect, createSignal, onMount } from "solid-js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import {
    createBox,
    createBall,
    createLine,
    segmentSlider,
    createPoint,
    outerBallColor,
    centerBallColor,
    boundingBoxColor,
} from "./utilities";
import { Slider } from "./components";
import { asin, atan, cos, sec, tan } from "./math";

const splitFraction = 19 / 20;

const [diagonalization, setDiagonalization] = createSignal(0);

let diagonalizationSlider: HTMLInputElement;
let cameraRef: THREE.OrthographicCamera | undefined;
let cameraUpdatedEvent = new Event("cameraUpdated");

function setCamera(x: number, y: number, z: number) {
    if (cameraRef) {
        cameraRef.position.set(x * 100, y * 100, z * 100);
        document.dispatchEvent(cameraUpdatedEvent);
    }
}

export function Diagram3() {
    const initCanvas = (canvas: HTMLCanvasElement) => {
        onMount(() => {
            diagram3D3(canvas, diagonalization);
        });
    };
    return (
        <>
            <canvas ref={initCanvas} height="400" />
            <fieldset>
                <legend>Diagonalize intersection</legend>
                <Slider
                    ref={diagonalizationSlider}
                    setValue={setDiagonalization}
                />
            </fieldset>
            <fieldset>
                <legend>Camera angle</legend>
                <button onClick={() => setCamera(0, 0, 10)}>side</button>
                <button onClick={() => setCamera(-10, 10, 0)}>diagonal</button>
                <button onClick={() => setCamera(-0.0001, 10, 0)}>top</button>
                <button onClick={() => setCamera(-6, 5, 10)}>
                    perspective
                </button>
            </fieldset>
        </>
    );
}

const diagram3D3 = (canvas: HTMLCanvasElement, diagonalization: Function) => {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
    });
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();

    const mcH = 2.5; // main camera world height
    const icH = mcH * (1 - splitFraction); // isolate camera world height

    const camera = new THREE.OrthographicCamera(0, 0, mcH, -mcH, 0.1, 10000);
    cameraRef = camera;
    const isolateCam = new THREE.OrthographicCamera(
        0,
        0,
        icH,
        -icH,
        0.1,
        10000
    );

    function resizeRenderer(renderer: THREE.WebGLRenderer) {
        const canvas = renderer?.domElement;
        if (canvas?.parentElement === null) return;
        canvas.setAttribute(
            "width",
            getComputedStyle(canvas.parentElement).width
        );
        renderer.setSize(canvas.width, canvas.height / window.devicePixelRatio);
        const aspectRatio = canvas.width / canvas.height;
        updateCameraAspect(aspectRatio);
        requestRender();
    }
    function updateCameraAspect(aspectRatio: number) {
        const mcW = (camera.top * aspectRatio) / splitFraction; // main camera width
        camera.left = -mcW;
        camera.right = mcW;
        camera.updateProjectionMatrix();

        const icW = (isolateCam.top * aspectRatio) / (1 - splitFraction);
        isolateCam.left = -icW;
        isolateCam.right = icW;
        isolateCam.updateProjectionMatrix();
    }

    window.addEventListener("resize", () => resizeRenderer(renderer));

    camera.position.z = 1000;

    const controls = new OrbitControls(camera, canvas);
    controls.addEventListener("change", requestRender);
    document.addEventListener(cameraUpdatedEvent.type, controls.update);

    isolateCam.position.z = 1000;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    directionalLight.position.set(1, 1, 1);

    const threeDObjects: THREE.Object3D[] = [];

    // Add containing box
    const box = createBox({
        color: boundingBoxColor,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
    });
    threeDObjects.push(box);
    scene.add(box);

    const outerBallGroup = new THREE.Group();

    // Add the outer spheres
    [-1, 1].forEach((z) => {
        [-1, 1].forEach((y) => {
            [-1, 1].forEach((x) => {
                const outerBall = createBall({
                    color: outerBallColor,
                    transparent: true,
                    opacity: 0.1,
                    depthWrite: false,
                });
                outerBall.position.set(y, x, z);
                outerBallGroup.add(outerBall);
            });
        });
    });
    threeDObjects.push(outerBallGroup);
    scene.add(outerBallGroup);

    const lineGroup = new THREE.Group();
    lineGroup.position.set(-1, -1, 1);

    // Add the center ball
    const centerBallGroup = new THREE.Group();
    const centerBall = createBall({
        color: centerBallColor,
        transparent: true,
        opacity: 0.1,
    });
    threeDObjects.push(centerBall);
    centerBallGroup.add(centerBall);
    // Add the center line
    const centerLine = createLine(centerBallColor);
    centerBallGroup.add(centerLine);

    lineGroup.add(centerBallGroup);

    // Near lower left
    const line1 = createLine(outerBallColor);
    lineGroup.add(line1);

    // Near lower right
    const line2 = createLine(outerBallColor);
    line2.position.x = 2;
    lineGroup.add(line2);

    // Near upper right
    const line3 = createLine(outerBallColor);
    line3.position.x = 2;
    line3.scale.setScalar(0);
    lineGroup.add(line3);

    // Far upper right
    const line4 = createLine(outerBallColor);
    line4.position.x = 2;
    line4.scale.setScalar(0);
    lineGroup.add(line4);

    const boxPoint1 = createPoint({ color: boundingBoxColor });
    boxPoint1.position.x = -1;
    lineGroup.add(boxPoint1);

    const boxPoint2 = createPoint({ color: boundingBoxColor });
    boxPoint2.position.x = 3;
    lineGroup.add(boxPoint2);

    lineGroup.add(isolateCam);

    scene.add(lineGroup);

    createEffect(() => {
        // animation controllers
        const [
            anim1t2, // animation 1D to 2D progress
            anim2t3, // animation 2D to 3D progress
        ] = segmentSlider(2, Number.parseFloat(diagonalization()));

        const rads1t2 = anim1t2 * atan(1);
        const rads1t2i = (1 - anim1t2) * atan(1);
        const rads2t3 = anim2t3 * atan(Math.SQRT1_2); // diagonal
        const rads2t3i = (1 - anim2t3) * atan(Math.SQRT1_2); // diagonal

        lineGroup.rotation.set(0, 0, rads1t2);
        lineGroup.rotateOnAxis(new THREE.Vector3(0, 1, 0), rads2t3);

        boxPoint1.position.x = -1 * sec(rads1t2) * sec(rads2t3);
        boxPoint2.position.x = 3 * sec(rads1t2) * sec(rads2t3);

        line2.position.x = 2 / sec(rads1t2);
        line2.scale.setScalar(cos(asin((2 * tan(rads1t2)) / sec(rads1t2))));

        line3.position.x = (2 * Math.SQRT2) / sec(rads1t2i) / sec(rads2t3);
        line3.scale.setScalar(
            cos(asin((2 * Math.SQRT2 * tan(rads1t2i)) / sec(rads1t2i))) *
                cos(asin((2 * Math.SQRT2 * tan(rads2t3)) / sec(rads2t3)))
        );

        line4.position.x = (2 * Math.sqrt(3)) / sec(rads2t3i);
        line4.scale.setScalar(
            cos(asin((2 * Math.sqrt(3) * tan(rads2t3i)) / sec(rads2t3i)))
        );

        centerBallGroup.position.x = sec(rads1t2) * sec(rads2t3);
        isolateCam.position.x = sec(rads1t2) * sec(rads2t3);

        const cen12 = tan(rads1t2); // Center ball 1D to 2D
        const cen23 = Math.SQRT2 * tan(rads2t3); // Center ball 2D to 3D progress
        const centerBallScale =
            Math.sqrt(cen12 * cen12 + cen23 * cen23 + 1) - 1;
        centerBallGroup.scale.setScalar(centerBallScale);
        requestRender();
    });

    let renderRequested = false;
    function render(renderer: THREE.WebGLRenderer) {
        threeDObjects.forEach((obj) => {
            obj.visible = true;
        });

        renderer.setViewport(
            0,
            canvas.height * (1 - splitFraction) / window.devicePixelRatio,
            canvas.width / window.devicePixelRatio,
            canvas.height * splitFraction / window.devicePixelRatio
        );
        renderer.clear();
        renderer.render(scene, camera);

        threeDObjects.forEach((obj) => {
            obj.visible = false;
        });

        [0, 1].forEach((offset) => {
            renderer.setViewport(
                0,
                offset / window.devicePixelRatio,
                canvas.width / window.devicePixelRatio,
                canvas.height * (1 - splitFraction) / window.devicePixelRatio
            );
            renderer.render(scene, isolateCam);
        });
        renderRequested = false;
    }
    function requestRender() {
        if (!renderRequested) {
            renderRequested = true;
            requestAnimationFrame(() => render(renderer));
        }
    }
    render(renderer); // required to make initial frame transparent
    resizeRenderer(renderer);
};
