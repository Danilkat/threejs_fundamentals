import * as THREE from '../../node_modules/three/build/three.module.js';

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

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const fov = 40;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 50, 0);
  camera.up.set(0, 0, 1);
  camera.lookAt(0,0,0);

  const scene = new THREE.Scene();

  const objects = [];
  
  const sphereGeometry = new THREE.SphereGeometry(1, 6, 6);

  const sunMaterial = new THREE.MeshPhongMaterial({emissive: 0xFFFF00});
  const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
  sunMesh.scale.set(5, 5, 5);
  scene.add(sunMesh);
  objects.push(sunMesh);

  const moonMaterial = new THREE.MeshPhongMaterial({color: 0x888888, emissive: 0x222222});
  const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
  moonMesh.position.x = 2;
  sunMesh.scale.set(.5, .5, .5);
  scene.add(moonMesh);
  objects.push(moonMesh);

  const color = 0xFFFFFF;
  const intensity = 3;
  const light = new THREE.PointLight(color, intensity);
  scene.add(light);

  function render(time) {
    time *= 0.001;
    
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
  
    objects.forEach((obj) => {
      obj.rotation.y = time;
    })
  
    renderer.render(scene, camera);
  
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();