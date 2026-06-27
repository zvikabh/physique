import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Everything the render loop needs handed back to it. As the project grows,
 * this is the stable "renderer half" — it knows nothing about physics.
 */
export interface SceneContext {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
}

export function createScene(): SceneContext {
  // --- Renderer: makes the <canvas> and draws into it ---
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // --- Scene + camera ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111119);

  const camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(3, 2, 4);

  // --- Ground plane + grid ---
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4),
    new THREE.MeshStandardMaterial({ color: 0x3a3a44, side: THREE.DoubleSide })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(4, 4, 0x666688, 0x333344);
  grid.position.y = 0.01;
  scene.add(grid);

  // Walls + grids at the bounce boundaries
  const wallPos = 2; // matches Sphere.handleBounce()
  const wallSize = 4; // spans the 4x4 footprint, from y=0 up to y=4
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x6a6a88,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.2,
  });

  const addWall = (
    position: THREE.Vector3,
    rotationY: number,
    gridRotationAxis: "x" | "z",
  ) => {
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(wallSize, wallSize),
      wallMaterial,
    );
    wall.position.copy(position);
    wall.rotation.y = rotationY;
    scene.add(wall);

    const wallGrid = new THREE.GridHelper(wallSize, wallSize, 0x666688, 0x333344);
    wallGrid.position.copy(position);
    (wallGrid.material as THREE.Material).transparent = true;
    (wallGrid.material as THREE.Material).opacity = 0.5;
    // GridHelper lies flat in the x-z plane; stand it up to face the wall normal.
    if (gridRotationAxis === "x") {
      wallGrid.rotation.x = Math.PI / 2; // wall facing ±z
    } else {
      wallGrid.rotation.z = Math.PI / 2; // wall facing ±x
    }
    scene.add(wallGrid);

    // Hide this grid whenever its wall faces the camera, so the near walls
    // don't clutter the view (the wall plane itself stays see-through too).
    // Driven from the always-rendered wall mesh, since an invisible grid would
    // never get its own onBeforeRender called again.
    const outwardNormal = new THREE.Vector3(position.x, 0, position.z).normalize();
    const wallToCamera = new THREE.Vector3();
    wall.onBeforeRender = (_renderer, _scene, camera) => {
      wallToCamera.copy(camera.position).sub(position);
      wallGrid.visible = outwardNormal.dot(wallToCamera) <= 0;
    };
  };

  const wallCenterY = wallSize / 2;
  addWall(new THREE.Vector3(wallPos, wallCenterY, 0), Math.PI / 2, "z"); // +x
  addWall(new THREE.Vector3(-wallPos, wallCenterY, 0), Math.PI / 2, "z"); // -x
  addWall(new THREE.Vector3(0, wallCenterY, wallPos), 0, "x"); // +z
  addWall(new THREE.Vector3(0, wallCenterY, -wallPos), 0, "x"); // -z

  // --- Lights ---
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 30;
  keyLight.shadow.camera.left = -8;
  keyLight.shadow.camera.right = 8;
  keyLight.shadow.camera.top = 8;
  keyLight.shadow.camera.bottom = -8;
  scene.add(keyLight);

  // --- Camera controls ---
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;

  // --- Keep things correct on window resize ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { renderer, scene, camera, controls };
}