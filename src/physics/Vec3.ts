/**
 * A minimal 3-vector. Methods mutate in place and return `this` for chaining,
 * matching THREE.Vector3's convention and avoiding a heap allocation per op.
 * Use clone() when you explicitly need a separate copy.
 */
export class Vec3 {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x: number, y: number, z: number): this {
    this.x = x; this.y = y; this.z = z;
    return this;
  }

  copyFrom(v: Vec3): this {
    this.x = v.x; this.y = v.y; this.z = v.z;
    return this;
  }

  clone(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  add(v: Vec3): this {
    this.x += v.x; this.y += v.y; this.z += v.z;
    return this;
  }

  sub(v: Vec3): this {
    this.x -= v.x; this.y -= v.y; this.z -= v.z;
    return this;
  }

  scale(s: number): this {
    this.x *= s; this.y *= s; this.z *= s;
    return this;
  }

  /** this += v * s  — the workhorse for integration: v.addScaledVector(a, dt). */
  addScaledVector(v: Vec3, s: number): this {
    this.x += v.x * s; this.y += v.y * s; this.z += v.z * s;
    return this;
  }

  dot(v: Vec3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /** Cross product, written into this. */
  cross(v: Vec3): this {
    const { x, y, z } = this;
    this.x = y * v.z - z * v.y;
    this.y = z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;
    return this;
  }

  squaredLength(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  length(): number {
    return Math.sqrt(this.squaredLength());
  }

  normalize(): this {
    const len = this.length();
    if (len > 0) this.scale(1 / len);
    return this;
  }
}
