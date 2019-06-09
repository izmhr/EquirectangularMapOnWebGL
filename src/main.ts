import * as THREE from 'three';
import $ from 'jquery';

let scene: THREE.Scene;

// window.addEventListener('DOMContentLoaded', () => {
$(() => {
  GetCamera();
  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer();
  // レンダラーのサイズを設定
  renderer.setSize(800, 600);
  // canvasをbodyに追加
  document.body.appendChild(renderer.domElement);

  // シーンを作成
  scene = new THREE.Scene();

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(45, 800 / 600, 1, 10000);
  camera.position.set(0, 0, 1000);

  // 箱を作成
  const geometry = new THREE.BoxGeometry(250, 250, 250);
  const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  const box = new THREE.Mesh(geometry, material);
  box.position.z = -5;
  scene.add(box);

  // 平行光源を生成
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);

  const tick = (): void => {
    requestAnimationFrame(tick);

    box.rotation.x += 0.05;
    box.rotation.y += 0.05;

    // 描画
    renderer.render(scene, camera);
  };
  tick();

  console.log('Hello Three.js');
});

const GetCamera = function (): void {
  const constraints: MediaStreamConstraints =
  {
    video: {width: 3008, height: 1504}
  }
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    // Success
    const video = (<HTMLVideoElement>document.getElementById('myvideo'));
    video.srcObject = stream;
    // video.hidden = true;
    // localStream = stream;
    var $resolution = $('#resolution');
    setInterval(() => {
      $resolution.text("Raw " + video.videoWidth + " x " + video.videoHeight);
    }, 500);

    MakeVideoTexture(video);
  }).catch((error) => {
    console.log("camera not found");
  });
}

const MakeVideoTexture = function (video: HTMLVideoElement): void {
  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;

  var geometry = new THREE.PlaneGeometry(800,400);
  // var mat = new THREE.MeshBasicMaterial({
  //   color: 0xffffff, side: THREE.FrontSide,
  //   map: texture
  // });

  // https://nogson2.hatenablog.com/entry/2017/09/29/185126
    var uniforms = {
    uTex: {type: "t", value: texture }
    // u_time: { type: "f", value: 1.0 },
    // u_resolution: { type: "v2", value: new THREE.Vector2() },
    // u_mouse: { type: "v2", value: new THREE.Vector2() }
  };

  var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: <string>$("#vertexShader").text(),
      fragmentShader:  <string>$("#fragmentShader").text(),
    });
  var plane = new THREE.Mesh(geometry, material);
  plane.position.z = -5;

  scene.add(plane);
}