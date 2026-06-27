import * as THREE from "three";
const modules = import.meta.glob("./assets/textures/*.{jpg,png}", {
  eager: true,
  import: "default",
});
const urls = Object.values(modules) as string[];

const loader = new THREE.TextureLoader();
export const woodTextures = urls.map((url) => {
  const texture = loader.load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
});
