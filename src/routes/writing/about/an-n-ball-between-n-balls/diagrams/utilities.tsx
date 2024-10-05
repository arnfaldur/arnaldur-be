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

let outerRequestRender = () => {};
export function updateCameraZoom(
    camera: THREE.OrthographicCamera,
    zoom: number
) {
    const aspectRatio = camera.right / camera.top;
    camera.top = zoom;
    camera.bottom = -zoom;
    const cW = zoom * aspectRatio; // camera width
    camera.left = -cW;
    camera.right = cW;
    camera.updateProjectionMatrix();
    outerRequestRender();
}
export function updateCameraAspect(
    camera: THREE.OrthographicCamera,
    aspectRatio: number
) {
    const cW = camera.top * aspectRatio; // camera width
    camera.left = -cW;
    camera.right = cW;
    camera.updateProjectionMatrix();
    outerRequestRender();
}
export function setupScene(canvas: HTMLCanvasElement) {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
    });
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();

    const cH = 3.0; // camera height
    const camera = new THREE.OrthographicCamera(-0, 0, cH, -cH, 0.1, 10000);

    function resizeRenderer(renderer: THREE.WebGLRenderer) {
        const canvas = renderer?.domElement;
        if (canvas?.parentElement === null) return;
        canvas.setAttribute(
            "width",
            getComputedStyle(canvas.parentElement).width
        );
        renderer.setSize(canvas.width , canvas.height / window.devicePixelRatio);
        const aspectRatio = canvas.width / canvas.height;
        updateCameraAspect(camera, aspectRatio);
        // it's kinda unneccesary to call this but it might not be called
        // at early init time in updateCameraAspect and the cost is low so might as well
        requestRender();
    }
    window.addEventListener("resize", () => resizeRenderer(renderer));

    camera.position.z = 1000;
    const controls = new OrbitControls(camera, canvas);
    controls.addEventListener("change", requestRender);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    let renderRequested = false;
    function render(renderer: THREE.WebGLRenderer) {
        renderer.clear();
        renderer.render(scene, camera);
        renderRequested = false;
    }
    function requestRender() {
        if (!renderRequested) {
            renderRequested = true;
            requestAnimationFrame(() => render(renderer));
        }
    }
    outerRequestRender = requestRender;

    return {
        scene,
        renderer,
        camera,
        controls,
        directionalLight,
        render,
        requestRender,
        resizeRenderer,
    };
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
export function createBox(
    materialParameters?: THREE.LineBasicMaterialParameters
) {
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
export function createPoint(color) {
    const points = [new THREE.Vector3(0, 0, 0)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.PointsMaterial({
        color,
    });
    const point = new THREE.Points(geometry, material);
    return point;
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
