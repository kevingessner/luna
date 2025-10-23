import * as THREE from 'three';

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
  earthLight.position.setFromSpherical(_latLonToSpherical(1, lat, lon+180));
}

const globeRadius = 1;
var width = 1024, height = 1024; // TODO from the body

// scene and renderer

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setSize(width, height);
renderer.setPixelRatio(2);
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 4;
renderer.setClearColor(16711680, 0);
//renderer.outputColorSpace = THREE.SRGBColorSpace ;
document.querySelector('#render').appendChild(renderer.domElement);

//document.querySelector('#debug').innerText = JSON.stringify(renderer.capabilities);
const gl = renderer.getContext();
const dbg = gl.getExtension("WEBGL_debug_renderer_info");
document.querySelector('#debug').innerText = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);

const scene = new THREE.Scene();

// const environment = new RoomEnvironment();
// const pmremGenerator = new THREE.PMREMGenerator( renderer );

// const envMap = pmremGenerator.fromScene( environment ).texture;
// scene.environment = envMap;
// scene.environmentIntensity = 0.1;

const frustumSize = globeRadius*2;
const camera = new THREE.OrthographicCamera(frustumSize / - 2, frustumSize / 2, frustumSize / 2, frustumSize / - 2, 0, 1000);

function render() {
    renderer.render( scene, camera );
}

// scene elements

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(sunLight);
const earthLight = new THREE.DirectionalLight(0xffffff, 0.05);
scene.add(earthLight);

setSubEarth(0,0);
setSubSun(0,-90);


const loader = new THREE.TextureLoader();

const geometry = new THREE.SphereGeometry(globeRadius, 90, 45); 
const map = loader.load('../webgl/textures/moon_lroc_color_poles_4k.png', (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    moonMaterial.needsUpdate = true;
    render();
});
const moonMaterial = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    map: map,
    normalMap: loader.load('../webgl/textures/moon_ldem_normal.png', render),
    normalScale: new THREE.Vector2(-.7,.7),
    roughness: 1,
    metalness: 0,
    reflectivity: 0
});
const globe = new THREE.Mesh( geometry, moonMaterial );
scene.add(globe);
render();


export {camera, globe, scene, setSubEarth, setSubSun, render};
window.moon = {setSubEarth, setSubSun, render, renderer, scene};
