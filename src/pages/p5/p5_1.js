import * as THREE from '../../../node_modules/three/build/three.module.js';
import * as dat from '../../../node_modules/dat.gui/build/dat.gui.module.js';

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = canvas.clientWidth * pixelRatio | 0;
  const height = canvas.clientHeight * pixelRatio | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

const matTypes = {
  "Basic": new THREE.MeshBasicMaterial({color: "cyan", emissive: "#002a2a"}),
  "Lambert": new THREE.MeshLambertMaterial({color: "cyan", emissive: "#002a2a"}),
  "Phong": new THREE.MeshPhongMaterial({color: "cyan", emissive: "#002a2a"}),
  "Toon": new THREE.MeshToonMaterial({color: "cyan", emissive: "#002a2a"}),
  "Standard": new THREE.MeshStandardMaterial({color: "cyan", emissive: "#002a2a"}),
  "Physical": new THREE.MeshPhysicalMaterial({color: "cyan", emissive: "#002a2a"}),
  "Depth": new THREE.MeshDepthMaterial(),
  "Normal": new THREE.MeshNormalMaterial(),
}

const sideTypes = {
  "Front": THREE.FrontSide,
  "Back": THREE.BackSide,
  "Double": THREE.DoubleSide
}

class parameterListHelper {
  
  constructor() {
    this.list = {init: {roughness: 1, metalness: 0, clearcoat: 0, clearcoatRoughness: 0},
    one: {roughness: 0,
      metalness: 1,
       clearcoat: 1,
        clearcoatRoughness: 0}, 
        two: {
         roughness: 0.75,
      metalness: 0.5,
       clearcoat: 0.6,
        clearcoatRoughness: 1
        }}
      this.actions = null;

      this._curr = 'init'

      this._action = null;
      this._val = this.list[this._curr]
    
  }

  set type(v) {
    this._curr = v;
      if (v in this.list) {
          this._val = this.list[this._curr];
      }
  }

  get type() {
      return this._curr;
  }

  crossFade(v) {
    console.log(this.actions[v]);
    console.log(v);
    const nextAction = this.actions[v];

    setWeight( nextAction, 1 );
    nextAction.time = 0;

    this._action.crossFadeTo(nextAction, 5);
    this._action = nextAction;
    this._curr = v;
  }

}

function setWeight( action, weight ) {

  action.enabled = true;
  action.setEffectiveTimeScale( 1 );
  action.setEffectiveWeight( weight );

}

class MaterialTypesHelper {
  constructor(mesh) {
    this._mesh = mesh;
    this.matTypes = matTypes;
    this.matType = "Physical";
    this._mesh.material = this.matTypes[this.matType];
  }
  get value() {
    return this.matType;
  }
  set value(v) {
    const params = this._mesh.material.parameters;
    this._mesh.material = this.matTypes[v];
    this._mesh.material.parameters = params;
    this.matType = v;
  }
  get mesh() {
    return this._mesh;
  }
}

class MaterialParametersHelper {
  constructor(materialTypesHelper) {
    this.helper = materialTypesHelper;
    this.matTypes = matTypes;

    this._shininess = 30;
    this._roughness = 0;
    this._metalness = 0;
    this._clearCoat = 0;
    this._clearCoatRoughness = 0;
    this._side = THREE.FrontSide;
    this._flatShading = false;

  }
  get shininess() {
    return this._shininess;
  }
  set shininess(v) {
    if (this.helper.value === "Phong") {
      this.helper.mesh.material.shininess = v;
      this._shininess = v;
    }
  }
  get roughness() {
    return this._roughness;
  }
  set roughness(v) {
    if (this.helper.value === "Standard" || this.helper.value === "Physical") {
      this.helper.mesh.material.roughness = v;
      this._roughness = v;
    }
  }
  get metalness() {
    return this._metalness;
  }
  set metalness(v) {
    if (this.helper.value === "Standard" || this.helper.value === "Physical") {
      this.helper.mesh.material.metalness = v;
      this._metalness = v;
    }
  }
  get clearCoat() {
    return this._clearCoat;
  }
  set clearCoat(v) {
    if (this.helper.value === "Physical") {
      this.helper.mesh.material.clearcoat = v;
      this._clearCoat = v;
    }
  }
  get clearCoatRoughness() {
    return this._clearCoatRoughness;
  }
  set clearCoatRoughness(v) {
    if (this.helper.value === "Physical") {
      this.helper.mesh.material.clearcoatRoughness = v;
      this._clearCoatRoughness = v;
    }
  }
  get side() {
    return this._side;
  }
  set side(v) {
    v = parseFloat(v);
    this.helper.mesh.material.side = v;
    this._side = v;
  }
  get flatShading() {
    return this._flatShading;
  }
  set flatShading(v) {
    this.helper.mesh.material.flatShading = v;
    this._flatShading = v;
  }

}

class SphereSegmentsHelper {
  constructor(obj) {
    this.obj = obj;
    this._segments = 3;
    this._philen = Math.PI * 2;
  }
  get segments() {
    return this._segments;
  }
  set segments(v) {
    this.obj.geometry = new THREE.SphereGeometry(1, v, v, 0, this._philen);
    this._segments = v;
  }
  get philen() {
    return this._philen;
  }
  set philen(v) {
    this.obj.geometry = new THREE.SphereGeometry(1, this._segments, this._segments, 0, v);
    this._philen = v;
  }
}

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
  const gui = new dat.GUI();
  renderer.setClearColor(0xAAAAAA);

  const fov = 40;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 0, 0);
  camera.lookAt(5, 0, 0);

  const scene = new THREE.Scene();
  
  const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);

  const sphereMesh = new THREE.Mesh(sphereGeometry, null);

  scene.add(sphereMesh);

  sphereMesh.position.x = 5;

  function updateMaterial() {
    sphereMesh.material.needsUpdate = true;
  }

  const userDefinedUniforms = ['roughness', 'metalness', 'clearcoat', 'clearcoatRoughness'];
  function setCloudUniforms(uniforms) {
    userDefinedUniforms.forEach((uniform) => {sphereMesh.material[uniform] = uniforms[uniform]});
    gui.updateDisplay();
}


  const matTypesHelper = new MaterialTypesHelper(sphereMesh);
  const matParamsHelper = new MaterialParametersHelper(matTypesHelper);
  //gui.add(matTypesHelper, "value", ["Basic", "Lambert", "Phong", "Toon", "Standard", "Physical", "Depth", "Normal"])
  gui.add(matTypesHelper, "value", ["Physical"])
    .name("Material type")
    .onChange(updateMaterial);

  gui.add(matParamsHelper, "side", sideTypes).name("Side type")
    .onChange(updateMaterial);
  
  const sphereSegHelper = new SphereSegmentsHelper(sphereMesh);
  gui.add(sphereSegHelper, "segments", 3, 64, 1)
    .name("Sphere segments");

  gui.add(sphereSegHelper, "philen", 0, Math.PI*2)
    .name("Sphere cut");

  gui.add(matParamsHelper, "flatShading").onChange(updateMaterial);
  //gui.add(matParamsHelper, "shininess", 0, 100);
  gui.add(sphereMesh.material, "roughness", 0, 1, 0.01);
  gui.add(sphereMesh.material, "metalness", 0, 1, 0.01);
  gui.add(sphereMesh.material, "clearcoat", 0, 1, 0.01);
  gui.add(sphereMesh.material, "clearcoatRoughness", 0, 1, 0.01);


  const color = 0xFFFFFF;
  const intensity = .7;
  const light = new THREE.PointLight(color, intensity);
  scene.add(light);
  light.position.set(3, .5, .5);

  function createClip(roughness, metalness, clearcoat, clearcoatRoughness) {
    const roughnessKF = new THREE.NumberKeyframeTrack('.roughness', [0], [roughness]);
    const metalnessKF = new THREE.NumberKeyframeTrack('.metalness', [0], [metalness]);
    const clearcoatKF = new THREE.NumberKeyframeTrack('.clearcoat', [0], [clearcoat]);
    const clearcoatRoughnessKF = new THREE.NumberKeyframeTrack('.clearcoatRoughness', [0], [clearcoatRoughness]);
    const clip = new THREE.AnimationClip('Action', 3, [roughnessKF, metalnessKF, clearcoatKF, clearcoatRoughnessKF]);
    return clip;
  }

  const initClip = createClip(1.0, 0.0, 0.0, 0.0);
  const oneClip = createClip(0, 1, 1, 0);
  const twoClip = createClip(0.75, 0.5, 0.6, 1);
  
  const mixer = new THREE.AnimationMixer( sphereMesh.material );

  const initAction = mixer.clipAction(initClip);
  const oneAction = mixer.clipAction(oneClip);
  const twoAction = mixer.clipAction(twoClip);
  setWeight(initAction, 1);
  setWeight(oneAction, 0);
  setWeight(twoAction, 0);
  initAction.play();
  oneAction.play();
  twoAction.play();

  const typeHelper = new parameterListHelper();
  typeHelper.actions = {init: initAction, one: oneAction, two: twoAction};
  typeHelper._action = typeHelper.actions['init'];
  gui.add(typeHelper, 'type', ['init', 'one', 'two']).onFinishChange((v) => {typeHelper.crossFade(v)});


  const clock = new THREE.Clock();

  function render(time) {
    time *= 0.001;
    
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
  
    sphereMesh.rotation.y = time * 0.2;
    sphereMesh.rotation.x = time * 0.2;
    
    const delta = clock.getDelta();

    mixer.update(delta);

    gui.updateDisplay();
  
    renderer.render(scene, camera);
  
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();