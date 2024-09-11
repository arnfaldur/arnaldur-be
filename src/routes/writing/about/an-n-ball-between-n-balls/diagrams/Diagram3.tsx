import { createEffect, createSignal, batch } from "solid-js";
import * as THREE from "three";

import {
    createBox,
    createBall,
    createSquare,
    setupScene,
    sphereDetail,
    createLine,
    easeInOutQuad,
    segmentSlider,
} from "./utilities";
import { Slider, Checkbox } from "./components";
import { asin, atan, cos, sec, sin, tan } from "./math";

const outerBallColor = 4346763;
const centerBallColor = 8861753;

const [diagonalization, setDiagonalization] = createSignal(0);

let diagonalizationSlider: HTMLInputElement;
let camera: THREE.OrthographicCamera | undefined;

function setCamera(x, y, z, up) {
    if (camera) {
        camera.up = up ?? THREE.Object3D.DEFAULT_UP;
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
                <button onClick={() => setCamera(0, 0, 10, null)}>side</button>
                <button onClick={() => setCamera(-10, 10, 0, null)}>
                    diagonal
                </button>
                <button
                    onClick={() =>
                        /* setCamera(-0, 10, 0, new THREE.Vector3(1, 0, 0)) */
                        setCamera(-0.0001, 10, 0, null)
                    }
                >
                    top
                </button>
                <button onClick={() => setCamera(-6, 5, 10, null)}>
                    perspective
                </button>
            </fieldset>
        </>
    );
}

const diagram3D3 = (canvas: HTMLCanvasElement, diagonalization: Function) => {
    const {
        scene,
        directionalLight,
        camera: cam,
        controls,
        renderer,
    } = setupScene(canvas);
    camera = cam;
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
                    color: outerBallColor,
                    transparent: true,
                    opacity: 0.1,
                });
                outerBall.position.set(y, x, z);
                outerBallGroup.add(outerBall);
            });
        });
    });
    scene.add(outerBallGroup);

    // Add the center ball
    const centerBallGroup = new THREE.Group();
    const centerBall = createBall({
        color: centerBallColor,
        transparent: true,
        opacity: 0.1,
    });
    centerBallGroup.add(centerBall);
    // Add the center line
    const centerLine = createLine(centerBallColor);
    centerBallGroup.add(centerLine);

    scene.add(centerBallGroup);

    // Near lower left
    const outerLineFirst = createLine(outerBallColor);
    outerLineFirst.position.set(-1, -1, 1);
    // outerLineFirst.scale.setScalar(4);
    scene.add(outerLineFirst);

    // Near lower right
    const outerLineSecond = createLine(outerBallColor);
    outerLineSecond.position.set(1, -1, 1);
    scene.add(outerLineSecond);

    // Near upper right
    const outerLineThird = createLine(outerBallColor);
    outerLineThird.position.set(1, -1, 1);
    outerLineThird.scale.setScalar(0);
    scene.add(outerLineThird);

    // Far upper right
    const outerLineFourth = createLine(outerBallColor);
    outerLineFourth.position.set(1, -1, 1);
    outerLineFourth.scale.setScalar(0);
    scene.add(outerLineFourth);

    createEffect(() => {
        // animation controllers
        let [
            anim1t2, // animation 1D to 2D progress
            anim2t3, // animation 2D to 3D progress
        ] = segmentSlider(2, Number.parseFloat(diagonalization()));
        // anim2t3 *= 2;
        const rads1t2 = anim1t2 * Math.atan(1);
        const rads2t3 = anim2t3 * Math.atan(1);
        const rads1t2i = (1 - anim1t2) * Math.atan(1);
        const rads2t3i = (1 - anim2t3) * Math.atan(1);
        const rads2t3d = anim2t3 * Math.atan(Math.SQRT1_2); // diagonal

        outerLineFirst.rotation.z = anim1t2 * Math.atan(cos(rads2t3));
        outerLineFirst.rotation.y = rads2t3;

        centerLine.rotation.z = anim1t2 * Math.atan(cos(rads2t3));
        centerLine.rotation.y = rads2t3;

        if (true) {
            outerLineFourth.position.set(0, 0, 0);
            outerLineFourth.position.add(outerLineFirst.position);
            outerLineFourth.scale.setScalar(1);
            outerLineFourth.rotation.set(0, 0, rads1t2);
            outerLineFourth.rotateOnAxis(
                new THREE.Vector3(0, 1, 0),
                rads2t3d
            );

        }

        outerLineSecond.rotation.y = rads2t3;
        outerLineSecond.rotation.z = anim1t2 * atan(cos(rads2t3));
        outerLineSecond.position.x = (2 * cos(rads1t2)) / sec(rads1t2) - 1;
        outerLineSecond.position.y = (2 * sin(rads1t2)) / sec(rads1t2) - 1;
        outerLineSecond.scale.setScalar(
            cos(asin((2 * tan(rads1t2)) / sec(rads1t2)))
        );

        outerLineThird.rotation.y = rads2t3;
        outerLineThird.rotation.z = anim1t2 * atan(cos(rads2t3));
        outerLineThird.position.x =
            (2 * Math.SQRT2 * cos(rads1t2)) / sec(rads1t2i) - 1;
        outerLineThird.position.y =
            (2 * Math.SQRT2 * sin(rads1t2)) / sec(rads1t2i) - 1;
        // outerLineThird.position.z =
        //     1 - 2 * Math.cos(rads2t3i) * Math.sin(rads2t3);
        outerLineThird.position.z = 1 - 2 * sin(rads2t3);
        outerLineThird.position.x += 2 * cos(rads2t3) - 2;
        outerLineThird.position.y += 2 * cos(rads2t3) - 2;
        outerLineThird.scale.setScalar(
            cos(asin((2 * Math.SQRT2 * tan(rads1t2i)) / sec(rads1t2i))) *
                cos(asin((2 * Math.SQRT2 * tan(rads2t3d)) / sec(rads2t3d)))
        );

        if (false) {
            outerLineFourth.rotation.y = rads2t3;
            outerLineFourth.rotation.z = anim1t2 * atan(cos(rads2t3));
            outerLineFourth.position.x =
                (2 * Math.SQRT2 * cos(rads1t2)) / sec(rads1t2i) - 1;
            outerLineFourth.position.y =
                (2 * Math.SQRT2 * sin(rads1t2)) / sec(rads1t2i) - 1;
            outerLineFourth.position.z = 1 - 2 * sin(rads2t3);
        }

        // center ball
        const cen12 = Math.tan(rads1t2); // Center ball 1D to 2D
        const cen23 = Math.tan(rads2t3); // Center ball 2D to 3D progress
        const centerBallScale =
            Math.sqrt(cen12 * cen12 + cen23 * cen23 + 1) - 1;
        centerBallGroup.scale.setScalar(centerBallScale);
        // centerBallGroup.scale.setScalar(0.1);
        centerBallGroup.position.y = -1 + cen12;
        centerBallGroup.position.z = 1 - cen23;
    });
};
