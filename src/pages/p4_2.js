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
  renderer.setClearColor(0xAAAAAA);
  renderer.shadowMap.enabled = true;

  function makeCamera(fov = 40) {
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 1000;
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
  }

  const cameraPivot = new THREE.Object3D();


  const camera = makeCamera();
  camera.position.set(8, 4, 10).multiplyScalar(3);
  camera.lookAt(0,0,0);
  cameraPivot.add(camera);
  const scene = new THREE.Scene();

  {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 20, 0);
    scene.add(light);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    const d = 50;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 50;
    light.shadow.bias = 0.001;
  }

  {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 2, 4);
    scene.add(light);
  }

  const objects = [];


  const groundMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(50, 50), new THREE.MeshPhongMaterial({color: 0x9b7653}));
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  const tank = new THREE.Object3D();
  scene.add(tank);

  const bodyMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(4, 1, 8), new THREE.MeshPhongMaterial({color: 0x6688AA}));
  bodyMesh.position.y = 1.4;
  bodyMesh.castShadow = true;
  tank.add(bodyMesh);
  
  const wheels = []

  const wheelGeometry = new THREE.CylinderBufferGeometry(1,1, 0.5, 6);
  const wheelMaterial = new THREE.MeshPhongMaterial({color: 0x888888});
  function addWheel(x, z) {
    let wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheelMesh.position.set(x, -0.5, z);
    wheelMesh.rotation.z = Math.PI / -2;
    wheelMesh.castShadow = true;
    wheels.push(wheelMesh);
    bodyMesh.add(wheelMesh);
  }
  addWheel(2.25,0);
  addWheel(-2.25,0);
  addWheel(2.25,3);
  addWheel(-2.25,3);
  addWheel(2.25,-3);
  addWheel(-2.25,-3);

  const domeMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(2, 8, 8, 0, Math.PI), new THREE.MeshPhongMaterial({color: 0x6688AA}));
  domeMesh.rotation.x = Math.PI / -2;
  domeMesh.position.y = 0.5;
  domeMesh.castShadow = true;
  bodyMesh.add(domeMesh);

  const turretPivot = new THREE.Object3D;
  turretPivot.position.y = 0.5;
  bodyMesh.add(turretPivot);

  const turretMesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(.3,.3,4,6), new THREE.MeshPhongMaterial({color: 0x6688AA}));
  turretMesh.position.z = 3.5;
  turretMesh.rotation.x = Math.PI / 2;
  turretMesh.castShadow = true;
  turretPivot.add(turretMesh);

  const turretCamera = makeCamera();
  turretCamera.position.y = .75 * .2;
  turretMesh.add(turretCamera);

  const targetOrbit = new THREE.Object3D();
  scene.add(targetOrbit);

  const targetElevation = new THREE.Object3D();
  targetElevation.position.z = 16;
  targetElevation.position.y = 8;
  targetOrbit.add(targetElevation);

  const targetBob = new THREE.Object3D();
  targetElevation.add(targetBob);

  const targetMaterial = new THREE.MeshPhongMaterial({color: 0x00FF00, flatShading: true});
  const targetMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 6, 3), targetMaterial);
  targetMesh.castShadow = true;
  targetBob.add(targetMesh);

  const targetCamera = makeCamera();
  const targetCameraPivot = new THREE.Object3D();
  targetCamera.position.y = 1;
  targetCamera.position.z = -2;
  targetCamera.rotation.y = Math.PI;
  targetBob.add(targetCameraPivot);
  targetCameraPivot.add(targetCamera);

  const curve = new THREE.SplineCurve( [
    new THREE.Vector2( -10, 0 ),
    new THREE.Vector2( -5, 5 ),
    new THREE.Vector2( 0, 0 ),
    new THREE.Vector2( 5, -5 ),
    new THREE.Vector2( 10, 0 ),
    new THREE.Vector2( 5, 10 ),
    new THREE.Vector2( -5, 10 ),
    new THREE.Vector2( -10, -10 ),
    new THREE.Vector2( -15, -8 ),
    new THREE.Vector2( -10, 0 ),
  ] );

  const points = curve.getPoints( 50 );
  const geometry = new THREE.BufferGeometry().setFromPoints( points );
  const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
  const splineObject = new THREE.Line( geometry, material );
  splineObject.rotation.x = Math.PI * .5;
  splineObject.position.y = 0.05;
  scene.add(splineObject);

  const targetPosition = new THREE.Vector3();
  const tankPosition = new THREE.Vector2();
  const tankTarget = new THREE.Vector2();

  function render(time) {
    time *= 0.001;
    
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    //move target
    targetOrbit.rotation.y = time * .27;
    targetBob.position.y = Math.sin(time * 2) * 4;
    targetMesh.rotation.x = time * 7;
    targetMesh.rotation.y = time * 13;
    targetMaterial.emissive.setHSL(time * 10 % 1, 1, .25);
    targetMaterial.color.setHSL(time * 10 % 1, 1, .25);

    //move tank
    const tankTime = time * 0.05;
    curve.getPointAt(tankTime % 1, tankPosition);
    curve.getPointAt((tankTime + 0.01) % 1, tankTarget);
    tank.position.set(tankPosition.x, 0, tankPosition.y);
    tank.lookAt(tankTarget.x, 0, tankTarget.y);
    wheels.forEach((obj) => {
      obj.rotation.x = time * 3;
    });

    // face turret at target
    targetMesh.getWorldPosition(targetPosition);
    turretPivot.lookAt(targetPosition);

    camera.lookAt(0,0,0);

    renderer.render(scene, camera);
  
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();