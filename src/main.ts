import * as THREE from 'three';
import $ from 'jquery';
import * as dat from 'dat.gui';

// Checking
import * as Sub from './sub';
import SSS from './sub';

// about loading shader code when using typescript.
// https://github.com/ryokomy/ts-webpack-threejs-shader-template
const simplevert: string = require('./shader/simple.vs');
const Ds2Erfrag: string = require('./shader/Ds2Er.fs');

class Ds2ErFragUniforms {
  UVOffset_FU: number = 0.0; //Front, U
  UVOffset_FV: number = -0.006; //Front, V
  UVOffset_BU: number = 0.005; //Back, U
  UVOffset_BV: number = -0.005; //Back, V
  // UVOffset: THREE.Vector4 = new THREE.Vector4(0.0, -0.006, 0.005, -0.005);
  RotFront: number = 1.53;
  RotBack: number = -1.41;
  RadiusFront: number = 0.441;
  RadiusBack: number = 0.483;
}

let scene: THREE.Scene;
let erPlane: THREE.Mesh;
const shaderUniforms = new Ds2ErFragUniforms();

$(() => {
  AddGui();
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

    UpdateFragShaderUniforms();
    // 描画
    renderer.render(scene, camera);
  };
  tick();

  console.log('Hello Three.js');

  // Checking Typescript + Webpack Basic import technic.
  CheckImportOnWPandTS();
});

const GetCamera = function (): void {
  const constraints: MediaStreamConstraints =
  {
    video: { width: 3008, height: 1504 }
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

    erPlane = MakeVideoTexture(video);
    scene.add(erPlane);
  }).catch((error) => {
    console.log("camera not found");
  });
}

const MakeVideoTexture = function (video: HTMLVideoElement): THREE.Mesh {
  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;

  var geometry = new THREE.PlaneGeometry(3008, 1504);

  // https://nogson2.hatenablog.com/entry/2017/09/29/185126
  // https://gist.github.com/izmhr/aa0c05d96c8182bcfbf7ce70ec43b4f7
  var uniforms = {
    uTex: { type: "t", value: texture },
    _UVOffset: { type: "v4", value: new THREE.Vector4(0.0, -0.006, 0.005, -0.005) },
    _RotFront: { type: "f", value: 1.53 },
    _RotBack: { type: "f", value: -1.41 },
    _RadiusFront: { type: "f", value: 0.441 },
    _RadiusBack: { type: "f", value: 0.483 },
  };

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: simplevert,
    fragmentShader: Ds2Erfrag
  });
  return new THREE.Mesh(geometry, material);
}

const CheckImportOnWPandTS = function (): void {
  Sub.Foo();
  Sub.Boo();
  const sss = new SSS();
  console.log("calc: ", sss.Add(999, 1));
  const sss2 = new Sub.default(); // こういうimportの仕方もあるけどまぁ不要でしょう
}

const AddGui = function (): void {
  const gui = new dat.GUI();
  gui.useLocalStorage = true;
  gui.remember(shaderUniforms);
  gui.add(shaderUniforms, 'UVOffset_FU', -0.1, 0.1);
  gui.add(shaderUniforms, 'UVOffset_FV', -0.1, 0.1);
  gui.add(shaderUniforms, 'UVOffset_BU', -0.1, 0.1);
  gui.add(shaderUniforms, 'UVOffset_BV', -0.1, 0.1);
  gui.add(shaderUniforms, 'RotFront', -3.1415, 3.1415);
  gui.add(shaderUniforms, 'RotBack', -3.1415, 3.1415);
  gui.add(shaderUniforms, 'RadiusFront', 0.43, 0.5);
  gui.add(shaderUniforms, 'RadiusBack', 0.43, 0.5);
}

const UpdateFragShaderUniforms = function (): void {
  if(erPlane == undefined) return;
  
  const _uniforms = (<THREE.ShaderMaterial>(erPlane.material)).uniforms;
  _uniforms._UVOffset.value = new THREE.Vector4(shaderUniforms.UVOffset_FU, shaderUniforms.UVOffset_FV, shaderUniforms.UVOffset_BU, shaderUniforms.UVOffset_BV);
  _uniforms._RotFront.value = shaderUniforms.RotFront;
  _uniforms._RotBack.value = shaderUniforms.RotBack;
  _uniforms._RadiusFront.value = shaderUniforms.RadiusFront;
  _uniforms._RadiusBack.value = shaderUniforms.RadiusBack;
}