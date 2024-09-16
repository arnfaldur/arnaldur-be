import { createEffect, createSignal, batch } from "solid-js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import {
    createBox,
    createBall,
    createSquare,
    sphereDetail,
    createLine,
    easeInOutQuad,
    segmentSlider,
    createPoint,
    outerBallColor,
    centerBallColor,
    boundingBoxColor,
} from "./utilities";
import { Slider, Checkbox } from "./components";
import { asin, atan, cos, sec, sin, tan } from "./math";

const [diagonalization, setDiagonalization] = createSignal(0);

let diagonalizationSlider: HTMLInputElement;
let camera: THREE.OrthographicCamera | undefined;

function setCamera(x: number, y: number, z: number) {
    if (camera) {
        camera.position.set(x, y, z);
    }
}

export function Diagram3() {
    const initCanvas = (canvas: HTMLCanvasElement) => {
        if (canvas.parentElement === null) return;
        canvas.setAttribute(
            "width",
            getComputedStyle(canvas.parentElement).width
        );
        diagram3D3(canvas, diagonalization);
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
    renderer.setSize(canvas.width, canvas.height);
    renderer.autoClear = false;
    const splitFraction = 19 / 20;
    let aspectRatio = canvas.width / canvas.height;

    const scene = new THREE.Scene();

    const mcH = 2.5; // main camera height
    let mcW = (mcH * aspectRatio) / splitFraction; // main camera width

    const icH = 2.5; // isolate camera height
    let icW = mcH * aspectRatio / splitFraction; // isolate camera width

    const camera = new THREE.OrthographicCamera(
        -mcW,
        mcW,
        mcH,
        -mcH,
        0.1,
        1000
    );
    const isolateCam = new THREE.OrthographicCamera(
        -icW,
        icW,
        icH,
        -icH,
        0.1,
        1000
    );

    window.addEventListener("resize", () => {
        if (canvas.parentElement === null) return;
        canvas.setAttribute(
            "width",
            getComputedStyle(canvas.parentElement).width
        );
        renderer.setSize(canvas.width, canvas.height);
        aspectRatio = canvas.width / canvas.height;
        mcW = mcH * aspectRatio;
        camera.left = -mcW;
        camera.right = mcW;
        camera.updateProjectionMatrix();

        isolateCam.left = -icW;
        isolateCam.right = icW;
        isolateCam.updateProjectionMatrix();
    });

    camera.position.z = 10;
    const controls = new OrbitControls(camera, canvas);

    isolateCam.position.z = 10;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    directionalLight.position.set(1, 1, 1);

    const threeDObjects = [];

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

        const rads1t2 = anim1t2 * Math.atan(1);
        const rads1t2i = (1 - anim1t2) * Math.atan(1);
        const rads2t3 = anim2t3 * Math.atan(Math.SQRT1_2); // diagonal
        const rads2t3i = (1 - anim2t3) * Math.atan(Math.SQRT1_2); // diagonal

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
    });

    function animate() {
        controls.update();

        threeDObjects.forEach((obj) => {
            obj.visible = true;
        });

        renderer.setViewport(
            0,
            canvas.height * (1 - splitFraction),
            canvas.width,
            canvas.height * splitFraction
        );
        renderer.clear();
        renderer.render(scene, camera);

        threeDObjects.forEach((obj) => {
            obj.visible = false;
        });

        renderer.setViewport(
            0,
            0,
            canvas.width,
            canvas.height * (1 - splitFraction)
        );
        // renderer.clearDepth();
        renderer.render(scene, isolateCam);
        renderer.setViewport(
            0,
            1,
            canvas.width,
            canvas.height * (1 - splitFraction)
        );
        renderer.render(scene, isolateCam);
        renderer.setViewport(
            0,
            -1,
            canvas.width,
            canvas.height * (1 - splitFraction)
        );
        renderer.render(scene, isolateCam);
    }
    renderer.setAnimationLoop(animate);
};

function setupScene(canvas: HTMLCanvasElement) {
    return { scene, controls, renderer, camera, isolateCam, directionalLight };
}
