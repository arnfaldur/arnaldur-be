import * as THREE from "three";
import { sphereDetail } from "./3d";

export function createBall(
  materialParameters: THREE.MeshStandardMaterialParameters | undefined,
) {
  const geometry = new THREE.IcosahedronGeometry(1, sphereDetail);
  const material = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    ...materialParameters,
  });
  return new THREE.Mesh(geometry, material);
}
export function createBox() {
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
  const material = new THREE.LineBasicMaterial({
    color: 5403965,
  });
  const box = new THREE.LineSegments(geometry, material);
  return box;
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
