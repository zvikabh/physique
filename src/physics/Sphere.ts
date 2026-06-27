import * as THREE from 'three';
import { Vec3 } from "./Vec3";

export class Sphere {
  x: Vec3;
  v: Vec3;
  radius: number;
  mass: number;
  elasticity: number;  // between 0 (fully plastic) and 1 (fully elastic)
  mesh: THREE.Mesh;
  
  constructor(x: Vec3, radius: number, mass: number, elasticity: number, v?: Vec3) {
    this.x = x;
    this.radius = radius;
    this.mass = mass;
    this.elasticity = elasticity;
    this.v = v || new Vec3(0, 0, 0);
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius),
      new THREE.MeshStandardMaterial({ color: 0x4ea1ff })
    );
    this.updateMesh();
    this.mesh.castShadow = true;
  }

  timeIntegrate(SigmaF: Vec3, dt: number): this {
  // Integrate velocity before position to better preserve energy.
    this.v.addScaledVector(SigmaF, dt / this.mass);
    this.x.addScaledVector(this.v, dt);

    // Bounce
    if (this.x.y - this.radius < -0.001 * this.radius) {
      this.x.y = this.radius;
      if (this.v.y < 0) {
        this.v.y *= -this.elasticity;
      }
    }

    return this;
  }

  updateMesh(): this {
    this.mesh.position.set(this.x.x, this.x.y, this.x.z);
    return this;
  }
}
