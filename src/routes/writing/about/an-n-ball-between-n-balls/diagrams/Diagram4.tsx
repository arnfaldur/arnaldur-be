import { createEffect, createSignal, batch } from "solid-js";
import * as THREE from "three";

import {
    createBox,
    createBall,
    createSquare,
    setupScene,
    sphereDetail,
    outerBallColor,
    centerBallColor,
    boundingBoxColor,
    segmentSlider,
} from "./utilities";
import { Slider, Checkbox } from "./components";
import { asin, atan, cos, sec, sin, tan } from "./math";

const [centerSphere, setCenterSphere] = createSignal(0);
const [diagonalization, setDiagonalization] = createSignal(0);
const [linkSliders, setLinkSliders] = createSignal(false);
const [isolatePlane, setIsolatePlane] = createSignal(false);

let diagonalizationSlider: HTMLInputElement;

export function Diagram4() {
    const initCanvas = (canvas: HTMLCanvasElement) => {
        if (canvas.parentElement === null) return;
        canvas.setAttribute(
            "width",
            getComputedStyle(canvas.parentElement).width
        );
        diagram3D4(canvas, diagonalization);
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

const diagram3D4 = (canvas: HTMLCanvasElement, diagonalization: Function) => {
    const {
        scene,
        directionalLight,
        camera,
        controls,
        renderer,
        render,
        requestRender,
        resizeRenderer,
    } = setupScene(canvas);
    directionalLight.position.set(1, 1, 1);
    camera.position.set(-6, 5, 10);
    controls.update();

    // Add containing box
    const box = createBox({
        color: boundingBoxColor,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
    });
    scene.add(box);

    const leftBallGroup = new THREE.Group();
    leftBallGroup.position.x = -1;
    const rightBallGroup = new THREE.Group();
    rightBallGroup.position.x = 1;
    const farBallGroup = new THREE.Group();
    farBallGroup.position.x = Math.SQRT2;
    [-1, 1].forEach((z) => {
        [-1, 1].forEach((y) => {
            // add the left spheres
            const leftBall = createBall({
                color: outerBallColor,
            });
            leftBall.position.set(0, y, z);
            leftBallGroup.add(leftBall);
            // add the right spheres
            const rightBall = createBall({
                color: outerBallColor,
            });
            rightBall.position.set(0, y, z);
            rightBallGroup.add(rightBall);
            // add the far (appearing) spheres
            const farBall = createBall({
                color: outerBallColor,
            });
            farBall.position.set(0, y, z);
            farBall.scale.setScalar(0);
            farBallGroup.add(farBall);
        });
    });
    scene.add(leftBallGroup);
    scene.add(rightBallGroup);
    scene.add(farBallGroup);

    // Draw the center ball
    const centerBallGroup = new THREE.Group();
    const centerBall = createBall({
        color: centerBallColor,
    });
    centerBall.scale.setScalar(Math.sqrt(3) - 1);
    centerBallGroup.add(centerBall);

    scene.add(centerBallGroup);

    // Center ball transforms
    createEffect(() => {
        // animation controllers
        const [
            anim3t4, // animation 1D to 2D progress
            anim4t5, // animation 2D to 3D progress
        ] = segmentSlider(2, Number.parseFloat(diagonalization()));
        const rads3t4 = anim3t4 * atan(1);
        const rads3t4i = (1 - anim3t4) * atan(1);
        const rads4t5 = anim4t5 * atan(Math.SQRT1_2);
        const rads4t5i = (1 - anim4t5) * atan(Math.SQRT1_2);

        box.scale.x = sec(rads3t4);

        leftBallGroup.position.x = -sec(rads3t4);

        rightBallGroup.position.x = 2 / sec(rads3t4) - sec(rads3t4);
        const rightBallSize = cos(asin((2 * tan(rads3t4)) / sec(rads3t4)));
        rightBallGroup.children.forEach((ball) => {
            ball.scale.setScalar(rightBallSize);
        });

        farBallGroup.position.x = Math.SQRT2 * 2 / sec(rads3t4i) - sec(rads3t4);
        const farBallSize = cos(
            asin((2 * Math.SQRT2 * tan(rads3t4i)) / sec(rads3t4i))
        );
        farBallGroup.children.forEach((ball) => {
            ball.scale.setScalar(farBallSize);
        });

        const cen12 = tan(rads3t4);
        const centerBallScale = Math.sqrt(cen12 * cen12 + 3) - 1;
        centerBall.scale.setScalar(centerBallScale);
        requestRender();
    });
    render(renderer);
    resizeRenderer(renderer);
};
