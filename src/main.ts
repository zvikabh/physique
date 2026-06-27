import "./style.css";
import { createScene } from "./scene";
import { Vec3 } from "./physics/Vec3";
import { Sphere } from "./physics/Sphere";

const { renderer, scene, camera, controls } = createScene();

// Time settings
const simulationTimeRatio = 0.3;  // Simulation runs 0.3x realtime (slow motion)
const dt = 0.01;  // Physics timestep
let lastTime = performance.now() / 1000 * simulationTimeRatio;  // Timestamp at last render
// Maximum simulation time to run between renders.
// If physics takes longer than this, we will slow down the simulation rather than
// show down the frame rate.
const maxTimeToSimulate = 0.25;
let leftoverTimeToSimulate = 0;

// World
const gravAccel = new Vec3(0, -9.81, 0);
const numSpheres = 10;
const spheres: Sphere[] = [];
for (let i = 0; i < numSpheres; ++i) {
  const pos = new Vec3(
    Math.random() * 4 - 2,
    Math.random() * 2 + 2,
    Math.random() * 4 - 2,
  );
  spheres.push(
    new Sphere(pos, Math.random() * 0.5 + 0.05, Math.random(), 0.98),
  );
}
spheres.forEach((sphere) =>
  sphere.SigmaF.copyFrom(gravAccel).scale(sphere.mass),
);
spheres.forEach((sphere) => scene.add(sphere.mesh));

function physicsStep() {
  spheres.forEach((sphere) => sphere.timeIntegrate(dt));
  for (let rep = 0; rep < 4; ++rep) {
    for (let i = 0; i < spheres.length; ++i) {
      for (let j = i + 1; j < spheres.length; ++j) {
        spheres[i].handleCollisionWith(spheres[j]);
      }
    }
    spheres.forEach((sphere) => sphere.handleBounce());
  }
}

function animate(timeMs: number) {
  const curTime = timeMs / 1000 * simulationTimeRatio;
  leftoverTimeToSimulate += Math.min(curTime - lastTime, maxTimeToSimulate);
  lastTime = curTime;
  while (leftoverTimeToSimulate >= dt) {
    physicsStep();
    leftoverTimeToSimulate -= dt;
  }

  // 2. Update renderer meshs
  spheres.forEach((sphere) => sphere.updateMesh());

  // 3. Render
  controls.update(); // needed while damping is enabled
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
