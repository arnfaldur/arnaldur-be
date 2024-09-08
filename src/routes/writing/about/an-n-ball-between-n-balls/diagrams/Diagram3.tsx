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
} from "./utilities";
import { Slider, Checkbox } from "./components";
import { cosine, secant, sine, tangent } from "./math";

const outerBallColor = 4346763;
const centerBallColor = 8861753;

export const Diagram3 = Diagram3inner;

const [diagonalization, setDiagonalization] = createSignal(0);

let diagonalizationSlider: HTMLInputElement;

function Diagram3inner() {
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
        </>
    );
}

const diagram3D3 = (canvas: HTMLCanvasElement, diagonalization: Function) => {
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
                    color: outerBallColor,
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
        color: centerBallColor,
        transparent: true,
        opacity: 0.25,
    });
    centerBall.scale.setScalar(Math.sqrt(3) - 1);
    centerBallGroup.add(centerBall);

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
        // animation 1D to 2D progress
        const anim1t2 = easeInOutQuad(
            THREE.MathUtils.clamp(diagonalization() * 2 - 0, 0, 1)
        );
        const rads1t2 = anim1t2 * Math.atan(1);
        // animation 2D to 3D progress
        const anim2t3 = easeInOutQuad(
            THREE.MathUtils.clamp(diagonalization() * 2 - 1, 0, 1)
        );
        const rads2t3 = anim2t3 * Math.atan(1);
        // 1D to 2D
        outerLineFirst.rotation.z = anim1t2 * Math.atan(cosine(rads2t3));
        outerLineFirst.rotation.y = rads2t3;

        const secTrigScale1t2 = 2 * Math.cos(rads1t2);
        outerLineSecond.rotation.z = rads1t2;
        outerLineSecond.position.y = -1 + Math.sin(rads1t2) * secTrigScale1t2;
        outerLineSecond.position.x = Math.cos(rads1t2) * secTrigScale1t2 - 1;
        outerLineSecond.scale.setScalar(
            Math.cos(Math.asin(Math.tan(rads1t2) * secTrigScale1t2))
        );

        const rads1t2Inv = ((1 - anim1t2) * Math.PI) / 4;
        const secTrigScaleA2 = 2 * Math.SQRT2 * Math.cos(rads1t2Inv);

        outerLineThird.rotation.z = rads1t2;
        outerLineThird.position.y = -1 + Math.sin(rads1t2) * secTrigScaleA2;
        outerLineThird.position.x = Math.cos(rads1t2) * secTrigScaleA2 - 1;
        outerLineThird.scale.setScalar(
            Math.cos(Math.asin(Math.tan(rads1t2Inv) * secTrigScaleA2))
        );

        // center ball
        const cen12 = Math.tan(rads1t2); // Center ball 1D to 2D progress
        const cen23 = Math.tan(rads2t3); // Center ball 2D to 3D progress
        const centerBallScale =
            Math.sqrt(cen12 * cen12 + cen23 * cen23 + 1) - 1;
        centerBall.scale.setScalar(centerBallScale);
        centerBall.scale.setScalar(0.1);
        centerBall.position.y = -1 + cen12;
        centerBall.position.z = 1 - cen23;

        // 2D to 3D

        // // center ball
        // const centerBallScale = Math.sqrt(animB * animB + 2) - 1;
        // centerBall.scale.setScalar(centerBallScale);
        // centerBall.position.z = 1 - animB;
    });
};
