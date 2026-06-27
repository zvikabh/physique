import './style.css';
import { createScene } from './scene';
import { Vec3 } from './physics/Vec3';
import { Sphere } from './physics/Sphere';

const { renderer, scene, camera, controls } = createScene();

// World
const grav_accel = new Vec3(0, -9.81, 0);
const dt = 0.01;
const sphere = new Sphere(new Vec3(0, 2, 0), 0.5, 1, 0.92);
const SigmaF = grav_accel.clone().scale(sphere.mass);
scene.add(sphere.mesh);

// --- Main loop -------------------------------------------------------------
function animate() {
  // 1. Physics step
  sphere.timeIntegrate(SigmaF, dt);

  // 2. Update renderer meshs
  sphere.updateMesh();

  // 3. Render
  controls.update();              // needed while damping is enabled
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
