precision mediump float;

#define PI 3.1415926535897932384626433832795
#define _W 1.0
#define _H 1.0

// uniforms
uniform sampler2D uTex;
uniform float _FOV;
uniform float _CenterShiftX;
uniform float _CenterShiftY;
uniform float _TextureSizeW;
uniform float _TextureSizeH;
uniform float _RotA;
uniform float _RotB;
uniform float _FisheyeDiameterOnTextureInPixel;
uniform float _SigmoidCoef;

varying vec2 vUv;

// http://paulbourke.net/dome/dualfish2sphere/diagram.pdf
void main() {
  vec2 pfishA, pfishB;
  float lat, lon;
  float thetaA, thetaB, phiA, phiB, rA, rB;
  vec3 psph;
  float FOV = _FOV / 180.0 * PI;
  float coef;

  // on earth map.
  float x = 2.0 * vUv.x / _W - 1.0;	// -1 ~ 1
  float y = 2.0 * vUv.y / _H - 1.0;	// -1 ~ 1

  // Polar angles
  lon = PI * x;		// -pi to pi : 経度 longitude
  lat = PI / 2.0 * y;	// -pi/2 to pi/2 : 緯度 latitude

  // Vector in 3D space
  psph.x = cos(lat) * sin(lon);
  psph.y = cos(lat) * cos(lon);
  psph.z = sin(lat);

  // Calculate fisheye angle and radius
  thetaA = atan(psph.z, psph.x) + _RotA;
  thetaB = atan(psph.z, psph.x) + _RotB;
  phiA = atan(sqrt(psph.x*psph.x + psph.z*psph.z), -psph.y);
  phiB = atan(sqrt(psph.x*psph.x + psph.z*psph.z),  psph.y);
  rA = _FisheyeDiameterOnTextureInPixel / _TextureSizeH * _H * phiA / (FOV / 2.0);
  rB = _FisheyeDiameterOnTextureInPixel / _TextureSizeH * _H * phiB / (FOV / 2.0);

  // UV in fisheye space
  pfishA.x = 0.75 * _W - 0.25 * rA * cos(thetaA) + _CenterShiftX;	// 0~1
  pfishB.x = 0.25 * _W + 0.25 * rB * cos(thetaB) + _CenterShiftX;	// 0~1
  pfishA.y = 0.5 * _W + 0.5 * rA * sin(thetaA) + _CenterShiftY;	// 0~1
  pfishB.y = 0.5 * _W + 0.5 * rB * sin(thetaB) + _CenterShiftY;	// 0~1

  // Return Black if the pixel is out of image
  //if (pfish.y > 1.0 || pfish.y < 0) return float4(0, 0, 0, 0);
  if (vUv.x < 0.5)
    coef = 1.0 / (1.0 + exp(_SigmoidCoef * (vUv.x * 4.0 - 1.0)));
  else
    coef = 1.0 / (1.0 + exp(_SigmoidCoef * (-vUv.x * 4.0 + 3.0)));

  gl_FragColor = texture2D(uTex, pfishA) * coef + texture2D(uTex, pfishB) * (1.0 - coef);
}