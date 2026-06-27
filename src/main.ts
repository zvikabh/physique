import "./style.css";
import { createScene } from "./scene";
import { Vec3 } from "./physics/Vec3";
import { Sphere } from "./physics/Sphere";

const { renderer, scene, camera, controls } = createScene();

// World
const grav_accel = new Vec3(0, -9.81, 0);
const dt = 0.01;
const numSpheres = 10;
const spheres: Sphere[] = [];
for (let i = 0; i < numSpheres; ++i) {
  const pos = new Vec3(
    Math.random() * 4 - 2,
    Math.random() * 2 + 2,
    Math.random() * 4 - 2,
  );
  spheres.push(new Sphere(pos, Math.random() * 0.3 + 0.2, Math.random(), 0.98));
}
spheres.forEach((sphere) =>
  sphere.SigmaF.copyFrom(grav_accel).scale(sphere.mass),
);
spheres.forEach((sphere) => scene.add(sphere.mesh));

// --- Main loop -------------------------------------------------------------
function animate() {
  // 1. Physics step
  spheres.forEach((sphere) => sphere.timeIntegrate(dt));
  for (let i = 0; i < spheres.length; ++i) {
    for (let j = i + 1; j < spheres.length; ++j) {
      spheres[i].handleCollisionWith(spheres[j]);
    }
  }
  spheres.forEach((sphere) => sphere.handleBounce());

  // 2. Update renderer meshs
  spheres.forEach((sphere) => sphere.updateMesh());

  // 3. Render
  controls.update(); // needed while damping is enabled
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
