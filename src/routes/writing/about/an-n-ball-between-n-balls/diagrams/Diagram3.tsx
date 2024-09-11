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

    const lineGroup = new THREE.Group();
    lineGroup.position.set(-1, -1, 1);

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

        const cen12 = tan(rads1t2); // Center ball 1D to 2D
        const cen23 = Math.SQRT2 * tan(rads2t3); // Center ball 2D to 3D progress
        const centerBallScale =
            Math.sqrt(cen12 * cen12 + cen23 * cen23 + 1) - 1;
        centerBallGroup.scale.setScalar(centerBallScale);

    });
};
