import { createEffect, createSignal, batch } from "solid-js";
import * as THREE from "three";

import {
    createBox,
    createBall,
    setupScene,
    outerBallColor,
    centerBallColor,
    boundingBoxColor,
    segmentSlider,
    updateCameraZoom,
} from "./utilities";
import { Slider, Checkbox } from "./components";
import { asin, atan, cos, sec, sin, tan } from "./math";

const [diagonalization, setDiagonalization] = createSignal(0);

let diagonalizationSlider: HTMLInputElement;

let setSideView = () => {};

export function SideView() {
    return <button onClick={setSideView}>side</button>;
}

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
    camera.position.set(-600, 500, 1000);
    controls.update();

    const farBallGroupCount = 7 + 0;
    let cameraZoomMemory = 0;

    setSideView = () => {
        setDiagonalization(1);
        diagonalizationSlider.value = "1";
        camera.position.set(0, 0, 1000);
        controls.update();
        requestRender();
    };

    const allGroup = new THREE.Group();

    // Add containing box
    const box = createBox({
        color: boundingBoxColor,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
    });
    allGroup.add(box);

    const leftBallGroup = new THREE.Group();
    leftBallGroup.position.x = 0;
    const rightBallGroup = new THREE.Group();
    rightBallGroup.position.x = 2;

    const farBallGroups = Array.from(
        { length: farBallGroupCount },
        (x, i) => i
    ).map((x, i) => {
        const group = new THREE.Group();
        group.position.x = 2 * Math.sqrt(i + 2);
        return group;
    });
    // const far4DBallGroup = new THREE.Group();
    // far4DBallGroup.position.x = 2 * Math.SQRT2;
    // const far5DBallGroup = new THREE.Group();
    // far5DBallGroup.position.x = 2 * Math.sqrt(3);
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
            for (let i = 0; i < farBallGroupCount; i++) {
                const farBall = createBall({ color: outerBallColor });
                farBall.position.set(0, y, z);
                farBall.scale.setScalar(0);
                farBallGroups[i].add(farBall);
            }
        });
    });
    allGroup.add(leftBallGroup);
    allGroup.add(rightBallGroup);
    for (let i = 0; i < farBallGroupCount; i++) {
        allGroup.add(farBallGroups[i]);
    }

    // Draw the center ball
    const centerBall = createBall({
        color: centerBallColor,
    });
    centerBall.scale.setScalar(Math.sqrt(3) - 1);
    allGroup.add(centerBall);

    scene.add(allGroup);

    // Center ball transforms
    createEffect(() => {
        const animRaw = Number.parseFloat(diagonalization());
        // animation controllers
        const anims = segmentSlider(farBallGroupCount, animRaw);
        const rads = Array.from({ length: farBallGroupCount }, (x, i) => i + 1)
            .map((x) => atan(1 / Math.sqrt(x)))
            .map((x, i) => [anims[i] * x, (1 - anims[i]) * x]);

        const [[rads3t4]] = rads;

        const secProd = rads.reduce((acc, x) => acc * sec(x[0]), 1);

        cameraZoomMemory = Math.max(cameraZoomMemory, animRaw);
        updateCameraZoom(camera, 2.5 + cameraZoomMemory * 1.5);

        box.position.x = secProd;
        box.scale.x = secProd;

        allGroup.position.x = -secProd;

        rightBallGroup.position.x = 2 / sec(rads3t4);
        const rightBallSize = cos(asin((2 * tan(rads3t4)) / sec(rads3t4)));
        rightBallGroup.children.forEach((ball) => {
            ball.scale.setScalar(rightBallSize);
        });
        farBallGroups.slice(0, -1).forEach((farBallGroup, i) => {
            farBallGroup.position.x =
                2 * Math.sqrt(i + 2) * cos(rads[i][1]) * cos(rads[i + 1][0]);
            const farBallSize =
                cos(
                    asin(
                        2 * Math.sqrt(i + 2) * tan(rads[i][1]) * cos(rads[i][1])
                    )
                ) *
                cos(
                    asin(
                        2 *
                            Math.sqrt(i + 2) *
                            tan(rads[i + 1][0]) *
                            cos(rads[i + 1][0])
                    )
                );
            farBallGroup.children.forEach((ball) => {
                ball.visible = !!farBallSize;
                ball.scale.setScalar(farBallSize);
            });
        });
        {
            // Last farBallGroup needs special treatment
            // similar to rightBallGroup but inverse
            const farBallGroup = farBallGroups[farBallGroupCount - 1];
            const i = farBallGroupCount - 1;

            farBallGroup.position.x = 2 * Math.sqrt(i + 2) * cos(rads[i][1]);
            const farBallSize = cos(
                asin(2 * Math.sqrt(i + 2) * tan(rads[i][1]) * cos(rads[i][1]))
            );
            farBallGroup.children.forEach((ball) => {
                ball.scale.setScalar(farBallSize);
            });
        }

        centerBall.position.x = secProd;
        const cens = rads.map((x, i) => Math.sqrt(i + 1) * tan(x[0]));
        const centerBallScale =
            Math.sqrt(cens.reduce((acc, x) => acc + x * x, 3)) - 1;

        centerBall.scale.setScalar(centerBallScale);
        requestRender();
    });
    render(renderer);
    resizeRenderer(renderer);
};
