import * as THREE from 'three';

const params = new URL(window.location).searchParams;

const globeRadius = 1;
var size = Math.min(window.innerHeight, window.innerWidth)-2;

// scene and renderer

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setSize(size, size);
renderer.setPixelRatio(1);
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 4;
renderer.setClearColor(16711680, 0);
renderer.localClippingEnabled = true;
document.querySelector('#render').appendChild(renderer.domElement);

if (params.has('debug')) {
    document.querySelector('#debug').innerText = JSON.stringify(renderer.capabilities);
    const gl = renderer.getContext();
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    document.querySelector('#debug').innerText += gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
}

const scene = new THREE.Scene();


const frustumSize = globeRadius*2;
const camera = new THREE.OrthographicCamera(frustumSize / - 2, frustumSize / 2, frustumSize / 2, frustumSize / - 2, 0, 1000);

function render() {
    renderer.render( scene, camera );
}

// scene elements

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(sunLight);
const earthLight = new THREE.DirectionalLight(0xfffffff, 0.05);
scene.add(earthLight);

const loader = new THREE.TextureLoader();

const geometry = new THREE.SphereGeometry(globeRadius, 90, 45);
const map = loader.load('../webgl/textures/moon_lroc_color_poles_4k.png', (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    moonMaterialFront.needsUpdate = true;
    moonMaterialBack.needsUpdate = true;
    render();
});
const clippingPlane = () => new THREE.Plane(sunLight.position.clone(), -0.001);
const moonMaterialFront = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    map: map,
    normalMap: loader.load('../webgl/textures/moon_ldem_normal.png', render),
    normalScale: new THREE.Vector2(-.7,.7),
    roughness: 1,
    metalness: 0,
    reflectivity: 0,
    clippingPlanes: [clippingPlane()],
    side: THREE.DoubleSide
});
const moonMaterialBack = moonMaterialFront.clone();
moonMaterialBack.setValues({
    color: '#ffffff',
    normalScale: new THREE.Vector2(-.15,.15),
    clippingPlanes: [clippingPlane().negate()]
});
const globeFront = new THREE.Mesh( geometry, moonMaterialFront );
const globeBack = new THREE.Mesh( geometry, moonMaterialBack );
scene.add(globeFront);
scene.add(globeBack);


function deg2rad(deg) {
    return deg * Math.PI / 180.0;
}

function _latLonToSpherical(rad, lat, lon) {
  const phi = Math.PI/2 - deg2rad(lat);
  const theta = deg2rad(90 + lon);
  return new THREE.Spherical(rad, phi, theta);
}

function setSubEarth(lat, lon) {
  // move the camera so it is looking at the "sub earth" point on the moon
  const pos = _latLonToSpherical(1, lat, lon)
  camera.position.setFromSpherical(pos);
  camera.lookAt(0,0,0);
}
function setSubSun(lat, lon) {
  // move the sunLight so it is above the "sub solar" point on the moon
  sunLight.position.setFromSpherical(_latLonToSpherical(10, lat, lon));
  // move the earthLight to the opposide side for some contrasty glow
  earthLight.position.setFromSpherical(_latLonToSpherical(1, -lat, lon+180));
  moonMaterialFront.clippingPlanes = [clippingPlane()];
  moonMaterialBack.clippingPlanes = [clippingPlane().negate()];
}

const subEarthLat = parseInt(params.get('subearth_lat') || '0');
const subEarthLon = parseInt(params.get('subearth_lon') || '0');
const subSolarLat = parseInt(params.get('subsolar_lat') || '0');
const subSolarLon = parseInt(params.get('subsolar_lon') || '-90');
setSubEarth(subEarthLat, subEarthLon);
setSubSun(subSolarLat, subSolarLon);
render();


export {scene, setSubEarth, setSubSun, render, renderer};
window.moon = {setSubEarth, setSubSun, render, renderer, scene};
