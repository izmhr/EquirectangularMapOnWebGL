import * as THREE from 'three';
import $ from 'jquery';
import * as dat from 'dat.gui';

let scene: THREE.Scene;

$(() => {
  addGui();
  GetCamera();
  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer();
  // レンダラーのサイズを設定
  renderer.setSize(1600, 800);
  // canvasをbodyに追加
  document.body.appendChild(renderer.domElement);

  // シーンを作成
  scene = new THREE.Scene();

  // カメラを作成
  const camera = new THREE.OrthographicCamera(-1504, 1504, 752, -752);
  camera.position.set(0, 0, 1000);

  const tick = (): void => {
    requestAnimationFrame(tick);

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

  var geometry = new THREE.PlaneGeometry(3008,1504);

  // https://nogson2.hatenablog.com/entry/2017/09/29/185126
  // https://gist.github.com/izmhr/aa0c05d96c8182bcfbf7ce70ec43b4f7
  var uniforms = {
    uTex: {type: "t", value: texture },
    _UVOffset: {type: "v4", value: new THREE.Vector4(0.0, -0.006, 0.005, -0.005)},
    _RotFront: {type: "f", value: 1.53},
    _RotBack: {type: "f", value: -1.41},
    _RadiusFront: {type: "f", value: 0.441},
    _RadiusBack: {type: "f", value: 0.483},
  };

  var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: <string>$("#vertexShader").text(),
      fragmentShader:  <string>$("#fragmentShader").text(),
    });
  var plane = new THREE.Mesh(geometry, material);

  scene.add(plane);
}

class FizzyText {
  message: string = 'dat.gui';
}

const addGui = function(): void {
  const text = new FizzyText();
  const gui = new dat.GUI();
  gui.add(text, 'message');
}