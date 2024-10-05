import * as THREE from "three";
import { onMount } from "solid-js";

import {
    createBox,
    createBall,
    setupScene,
    outerBallColor,
    centerBallColor,
    boundingBoxColor,
    updateCameraZoom,
} from "./utilities";

let setSideView = () => {};

export function SideView() {
    return <button onClick={setSideView}>side</button>;
}

export function Diagram5() {
    const initCanvas = (canvas: HTMLCanvasElement) => {
        onMount(() => {
            diagram3D5(canvas);
        });
    };

    return (
        <>
            <canvas ref={initCanvas} height="400" />
        </>
    );
}

const diagram3D5 = (canvas: HTMLCanvasElement) => {
    const {
        scene,
        directionalLight,
        camera,
        controls,
        renderer,
        render,
        resizeRenderer,
    } = setupScene(canvas);
    directionalLight.position.set(1, 1, 1);
    camera.position.set(-600, 500, 1000);
    updateCameraZoom(camera, 45);
    controls.update();

    const dimension = 1206;
    const diagonal = Math.sqrt(dimension - 2);

    const allGroup = new THREE.Group();
    allGroup.position.x = -diagonal;

    // Add containing box
    const box = createBox({
        color: boundingBoxColor,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
    });

    box.position.x = diagonal;
    box.scale.x = diagonal;
    allGroup.add(box);

    const leftBallGroup = new THREE.Group();
    leftBallGroup.position.x = 0;
    const rightBallGroup = new THREE.Group();
    rightBallGroup.position.x = 2 * diagonal;

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
        });
    });
    allGroup.add(leftBallGroup);
    allGroup.add(rightBallGroup);

    // Draw the center ball
    const centerBall = createBall({
        color: centerBallColor,
    });
    centerBall.position.x = diagonal;
    centerBall.scale.setScalar(Math.sqrt(dimension) - 1);
    allGroup.add(centerBall);

    scene.add(allGroup);

    render(renderer);
    resizeRenderer(renderer);
};
