import './style.css';
import * as THREE from 'three';
import { createScene } from './scene';

const { renderer, scene, camera, controls } = createScene();

// --- Scene content ---------------------------------------------------------
// For now, a single static sphere. Later, each such mesh will be paired with
// a rigid body in your physics engine, and its transform driven from there.
const cube = new THREE.Mesh(
  new THREE.SphereGeometry(0.5),
  new THREE.MeshStandardMaterial({ color: 0x4ea1ff })
);
cube.position.set(0, 1, 0);
cube.castShadow = true;
scene.add(cube);

// --- Main loop -------------------------------------------------------------
function animate() {
  // 1. PHYSICS STEP (later): advance the simulation by one timestep, then copy
  //    each body's state into its mesh. This is the entire physics<->renderer
  //    interface — just transforms crossing the boundary:
  //
  //        world.step(dt);
  //        cube.position.copy(body.position);
  //        cube.quaternion.copy(body.orientation);

  // 2. RENDER
  controls.update();              // needed while damping is enabled
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
