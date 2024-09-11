import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const sphereDetail = 12;

export const boundingBoxColor = 5403965;
export const outerBallColor = 4346763;
export const centerBallColor = 8861753;

export function segmentSlider(segments: number, value: number) {
    return Array(segments)
        .fill(0)
        .map((_, i) =>
            easeInOutQuad(THREE.MathUtils.clamp(value * segments - i, 0, 1))
        );
}

export function setupScene(canvas: HTMLCanvasElement) {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
    });
    renderer.setSize(canvas.width, canvas.height);
    let aspectRatio = canvas.width / canvas.height;

    const scene = new THREE.Scene();
    const cH = 2.5; // camera height
    let cW = cH * aspectRatio; // camera width
    const camera = new THREE.OrthographicCamera(-cW, cW, cH, -cH, 0.1, 1000);

    window.addEventListener("resize", () => {
        if (canvas.parentElement === null) return;
        canvas.setAttribute(
            "width",
            getComputedStyle(canvas.parentElement).width
        );
        renderer.setSize(canvas.width, canvas.height);
        aspectRatio = canvas.width / canvas.height;
        cW = cH * aspectRatio;
        camera.left = -cW;
        camera.right = cW;
        camera.updateProjectionMatrix();
    });

    camera.position.z = 10;
    const controls = new OrbitControls(camera, canvas);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    function animate() {
        controls.update();
        renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);

    return { scene, controls, renderer, camera, directionalLight };
}

export function createBall(
    materialParameters: THREE.MeshStandardMaterialParameters | undefined
) {
    const geometry = new THREE.IcosahedronGeometry(1, sphereDetail);
    const material = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        ...materialParameters,
    });
    return new THREE.Mesh(geometry, material);
}
export function createBox(materialParameters?: THREE.LineBasicMaterialParameters) {
    const points = [
        new THREE.Vector3(-2, -2, -2),
        new THREE.Vector3(-2, -2, 2),
        new THREE.Vector3(-2, -2, -2),
        new THREE.Vector3(-2, 2, -2),
        new THREE.Vector3(-2, -2, -2),
        new THREE.Vector3(2, -2, -2),

        new THREE.Vector3(-2, 2, 2),
        new THREE.Vector3(2, 2, 2),
        new THREE.Vector3(-2, 2, 2),
        new THREE.Vector3(-2, -2, 2),
        new THREE.Vector3(-2, 2, 2),
        new THREE.Vector3(-2, 2, -2),

        new THREE.Vector3(2, -2, 2),
        new THREE.Vector3(-2, -2, 2),
        new THREE.Vector3(2, -2, 2),
        new THREE.Vector3(2, 2, 2),
        new THREE.Vector3(2, -2, 2),
        new THREE.Vector3(2, -2, -2),

        new THREE.Vector3(2, 2, -2),
        new THREE.Vector3(-2, 2, -2),
        new THREE.Vector3(2, 2, -2),
        new THREE.Vector3(2, -2, -2),
        new THREE.Vector3(2, 2, -2),
        new THREE.Vector3(2, 2, 2),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial(materialParameters);
    const box = new THREE.LineSegments(geometry, material);
    return box;
}
export function createSquare() {
    const points = [
        new THREE.Vector3(-2, -2, 0),
        new THREE.Vector3(-2, 2, 0),
        new THREE.Vector3(2, 2, 0),
        new THREE.Vector3(2, -2, 0),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 5403965,
    });
    const square = new THREE.LineLoop(geometry, material);
    return square;
}
export function createLine(color) {
    const points = [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color,
    });
    const line = new THREE.Line(geometry, material);
    return line;
}
export function createContactPoint() {
    const r = 0.05;
    const points = [
        new THREE.Vector3(-r, 0, 0),
        new THREE.Vector3(r, 0, 0),
        new THREE.Vector3(0, -r, 0),
        new THREE.Vector3(0, r, 0),
        new THREE.Vector3(0, 0, -r),
        new THREE.Vector3(0, 0, r),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 14267742 });
    material.depthTest = false;
    const contactPoint = new THREE.LineSegments(geometry, material);
    contactPoint.renderOrder = 999;
    return contactPoint;
}

export function easeInOutQuad(x: number): number {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}
export function easeInOutSine(x: number): number {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}
