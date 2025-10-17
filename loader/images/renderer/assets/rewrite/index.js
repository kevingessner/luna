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
  //this.earthLight.position.setFromSpherical(pos);
}
function setSubSun(lat, lon) {
  // move the sunLight so it is above the "sub solar" point on the moon
  sunLight.position.setFromSpherical(_latLonToSpherical(1, lat, lon));
  earthLight.position.setFromSpherical(_latLonToSpherical(1, lat, lon+180));
}

const globeRadius = 1;
var width = 1024, height = 1024; // TODO from the body

// scene and renderer

const renderer = new THREE.WebGLRenderer({
	antialias: false,
	alpha: true,
	precision: "highp"
});
renderer.setSize(width, height);
renderer.setPixelRatio(1);
renderer.toneMapping = THREE.LinearToneMapping;
document.querySelector('#render').appendChild(renderer.domElement);
const scene = new THREE.Scene();

const frustumSize = globeRadius*2;
const camera = new THREE.OrthographicCamera(frustumSize / - 2, frustumSize / 2, frustumSize / 2, frustumSize / - 2, 0, 1000);


// const composer = new THREE.EffectComposer(renderer);
// composer.setSize(width, height);
// composer.addPass(new THREE.RenderPass(scene, camera));

// const shaderPass = new THREE.ShaderPass(THREE.CopyShader);
// shaderPass.renderToScreen = true;
// composer.addPass(shaderPass);


// scene elements

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(sunLight);
const earthLight = new THREE.DirectionalLight(0xffffff, 0.05);
scene.add(earthLight);
	  
setSubEarth(0,0);
setSubSun(0,-90);


function render() {
	renderer.render( scene, camera );
}

const loader = new THREE.TextureLoader();

const geometry = new THREE.SphereGeometry(globeRadius); 
const meshMaterial = new THREE.MeshPhongMaterial( { color: 0x156289, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true } )
const moonMaterial = new THREE.MeshStandardMaterial({
	color: '#ffffff',
	map: loader.load('../webgl/textures/moon_lroc_color_poles_4k.png', render),
	normalMap: loader.load('../webgl/textures/moon_ldem_normal.png', render),
	normalScale: new THREE.Vector2(-1,-1),
	roughness: 1,
	metalness: 0,
});
const globe = new THREE.Mesh( geometry, moonMaterial );
scene.add(globe);
render();


export {camera, globe, scene, setSubEarth, setSubSun, render};
window.moon = {setSubEarth, setSubSun, render};