import * as THREE from "three";
import { Vec3 } from "./Vec3";

function getRandomHexColor(): string {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
}

export class Sphere {
  x: Vec3;
  v: Vec3;
  radius: number;
  mass: number;
  elasticity: number; // between 0 (fully plastic) and 1 (fully elastic)
  mesh: THREE.Mesh;
  SigmaF = new Vec3(0, 0, 0);

  constructor(
    x: Vec3,
    radius: number,
    mass: number,
    elasticity: number,
    colorOrTexture?: number | THREE.Texture,
    v?: Vec3,
  ) {
    this.x = x;
    this.radius = radius;
    this.mass = mass;
    this.elasticity = elasticity;
    this.v = v || new Vec3(0, 0, 0);
    const material = (() => {
      if (!colorOrTexture) {
        return new THREE.MeshStandardMaterial({ color: getRandomHexColor() });
      } else if (typeof colorOrTexture === "number") {
        return new THREE.MeshStandardMaterial({ color: colorOrTexture });
      } else {
        return new THREE.MeshStandardMaterial({ map: colorOrTexture });
      }
    })();
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(this.radius), material);
    this.updateMesh();
    this.mesh.castShadow = true;
  }

  timeIntegrate(dt: number): this {
    // Integrate velocity before position to better preserve energy.
    this.v.addScaledVector(this.SigmaF, dt / this.mass);
    this.x.addScaledVector(this.v, dt);
    return this;
  }

  // Used only in handleCollisionWith
  // (to avoid reallocating the vector each time the function is called)
  private _normalVec = new Vec3(0, 0, 0);
  handleCollisionWith(other: Sphere): this {
    const dist2 = this._normalVec.copyFrom(this.x).sub(other.x).squaredLength();
    if (dist2 > (this.radius + other.radius) ** 2) {
      return this; // No collision
    }

    // Collision handling logic: See /docs/Ball_to_ball_collision.pdf
    // normalDir = $\hat{n}$: Unit vector in the direction of impulse.
    const normalDir = this._normalVec.clone().normalize();

    // Move the balls so that they no longer penetrate
    // (numerical fix due to non-infinitesimal timestep)
    const penetration = this.radius + other.radius - this._normalVec.length();
    if (penetration > 0.001) {
      this.x.addScaledVector(
        normalDir,
        (penetration * other.mass) / (this.mass + other.mass),
      );
      other.x.addScaledVector(
        normalDir,
        (-penetration * this.mass) / (this.mass + other.mass),
      );
    }

    // $v_n = v_{A,\hat{n}} - v_{B,\hat{n}}$
    const v_n = this.v.clone().sub(other.v).dot(normalDir);
    if (v_n >= 0) {
      return this; // Ball are already moving away from one another.
    }
    const elasticity = (this.elasticity + other.elasticity) / 2;
    const delta_v =
      ((-(1 + elasticity) * other.mass) / (this.mass + other.mass)) * v_n;
    this.v.addScaledVector(normalDir, delta_v);
    other.v.addScaledVector(normalDir, (-this.mass / other.mass) * delta_v);

    return this;
  }

  handleBounce(): this {
    const wallPos = 2;

    // Bounce off floor
    if (this.x.y - this.radius < -0.001 * this.radius) {
      this.x.y = this.radius;
      if (this.v.y < 0) {
        this.v.y *= -this.elasticity;
      }
    }

    if (this.x.x + this.radius > wallPos + 0.001 * this.radius) {
      this.x.x = wallPos - this.radius;
      if (this.v.x > 0) {
        this.v.x *= -this.elasticity;
      }
    }
    if (this.x.x - this.radius < -wallPos - 0.001 * this.radius) {
      this.x.x = -wallPos + this.radius;
      if (this.v.x < 0) {
        this.v.x *= -this.elasticity;
      }
    }
    if (this.x.z + this.radius > wallPos + 0.001 * this.radius) {
      this.x.z = wallPos - this.radius;
      if (this.v.z > 0) {
        this.v.z *= -this.elasticity;
      }
    }
    if (this.x.z - this.radius < -wallPos - 0.001 * this.radius) {
      this.x.z = -wallPos + this.radius;
      if (this.v.z < 0) {
        this.v.z *= -this.elasticity;
      }
    }
    return this;
  }

  updateMesh(): this {
    this.mesh.position.set(this.x.x, this.x.y, this.x.z);
    return this;
  }
}
