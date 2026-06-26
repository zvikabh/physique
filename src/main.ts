import './style.css';
import * as THREE from 'three';
import { createScene } from './scene';
import { Vec3 } from './physics/Vec3';

const { renderer, scene, camera, controls } = createScene();

// --- Scene content ---------------------------------------------------------
// For now, a single static sphere. Later, each such mesh will be paired with
// a rigid body in your physics engine, and its transform driven from there.
const radius = 0.5
const cube = new THREE.Mesh(
  new THREE.SphereGeometry(radius),
  new THREE.MeshStandardMaterial({ color: 0x4ea1ff })
);
cube.position.set(0, 1, 0);
cube.castShadow = true;
scene.add(cube);

const position = new Vec3(0, 2, 0);
const velocity = new Vec3(0, 0, 0);
const grav_accel = new Vec3(0, -9.81, 0);
const dt = 0.01;

// --- Main loop -------------------------------------------------------------
function animate() {
  // 1. PHYSICS STEP
  // Integrate velocity before position to better preserve energy.
  velocity.addScaledVector(grav_accel, dt);
  position.addScaledVector(velocity, dt);
  // Bounce
  if (position.y - radius < 0) {
    //const amountThroughFloor = radius - position.y;
    //position.y = radius + amountThroughFloor;
    position.y = radius;
    velocity.y = -velocity.y * 0.92;
  }
  cube.position.set(position.x, position.y, position.z);

  // 2. RENDER
  controls.update();              // needed while damping is enabled
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
