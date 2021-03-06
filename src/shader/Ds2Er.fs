precision mediump float;

#define _DRAW_BOTH
#define PI 3.1415926535897932384626433832795
#define _RADIUS 0.47
#define _TEXTURE_Y_OFFSET 0.0
#define _TEXTURE_Y_SCALE 1.0
//#define _FORWARD_ROTATION_DEGREE (-90.0 + _INSTA360_AIR_SENSOR_ROTATION_DEGREE)
//#define _BACKWARD_ROTATION_DEGREE (90.0 + _INSTA360_AIR_SENSOR_ROTATION_DEGREE)
#define _FORWARD_ROTATION_DEGREE -90.0
#define _BACKWARD_ROTATION_DEGREE 90.0

// uniforms
uniform sampler2D uTex;
uniform vec4 _UVOffset;
uniform float _RotFront;
uniform float _RotBack;
uniform float _RadiusFront;
uniform float _RadiusBack;

varying vec2 vUv;

// ２次元変換行列 （３次元目は平行移動用に使う）
mat3 rotate_matrix_radian(float rot) {
  float sinX = sin ( rot );
  float cosX = cos ( rot );
  return mat3(cosX, -sinX, 0,  sinX, cosX,  0, 0, 0, 1);
}

// Scale/Rotate/Translate Matrix群
mat3 rotate_matrix_degree(float rot) {
  return rotate_matrix_radian(rot * PI / 180.0);
}
mat3 scale_matrix(vec2 scale) {
  return mat3(scale.x, 0, 0,  0, scale.y, 0, 0, 0, 1);
}
mat3 scaleX_matrix(float x) {
  return mat3(x, 0, 0,  0, 1, 0, 0, 0, 1);
}
mat3 scaleY_matrix(float y) {
  return mat3(1, 0, 0,  0, y, 0, 0, 0, 1);
}
mat3 translate_matrix(vec2 vec) {
  return mat3(1, 0, 0,  0, 1, 0, vec.x,vec.y,1);
}
mat3 translateX_matrix(float x) {
  return mat3(1, 0, 0,  0, 1, 0, x, 0, 1);
}
mat3 translateY_matrix(float y) {
  return mat3(1, 0, 0,  0, 1, 0, 0, y, 1);
}

mat3 texture_matrix3() {
  mat3 mat = mat3(1,0,0, 0,1,0, 0,0,1);
  mat = scaleY_matrix(_TEXTURE_Y_SCALE) * mat;
  mat = translateY_matrix(_TEXTURE_Y_OFFSET) * mat;
  return mat;
}

// forward用変換行列
// (0,0)を中心として半径1の範囲の座標、をテクスチャ座標に変換するmatrix
// 計算量多いようだが、すべてコンパイル時に解決されるはず。
mat3 forward_matrix3() {
    mat3 mat = mat3(1,0,0, 0,1,0, 0,0,1);
    mat = rotate_matrix_degree(_FORWARD_ROTATION_DEGREE + _RotFront) * mat;
    mat = translate_matrix(vec2(0.5, 0.5)) * mat;
    // 裏側なので逆方向にする
    mat = scaleX_matrix(-1.0) * mat;
    mat = translateX_matrix(1.0) * mat;
    // XのUV幅は半分なので x0.5
    mat = scaleX_matrix(0.5) * mat;
    // オフセット
    mat = translate_matrix(_UVOffset.yx) * mat;
    mat = texture_matrix3() * mat;
    return mat;
}

// backward用変換行列
// (0,0)を中心として半径1の範囲の座標、をテクスチャ座標に変換するmatrix
// 計算量多いようだが、すべてコンパイル時に解決されるはず。
mat3 backward_matrix3() {
    mat3 mat = mat3(1,0,0, 0,1,0, 0,0,1);
    mat = rotate_matrix_degree(_BACKWARD_ROTATION_DEGREE + _RotBack) * mat;
    mat = translate_matrix(vec2(0.5, 0.5)) * mat;
    // 片目分のUV幅は半分なので x0.5
    mat = scaleX_matrix(0.5) * mat;
    // 右側なので +0.5
    mat = translateX_matrix(0.5) * mat;
    // Y逆方向
    mat = scaleY_matrix(-1.0) * mat;
    mat = translateY_matrix(1.0) * mat;
    // オフセット
    mat = translate_matrix(_UVOffset.wz) * mat;
    mat = texture_matrix3() * mat;
    return mat;
}

vec2 convert_for_forward(vec2 st) {
  return (forward_matrix3() * vec3(st.x, st.y, 1)).xy;
}

vec2 convert_for_backward(vec2 st) {
  return (backward_matrix3() * vec3(st.x, st.y, 1)).xy;
}

void main() {
  vec2 revUV = vec2(vUv.x, 1.0 - vUv.y);

  #if defined(_DRAW_BOTH)
  if (vUv.x <= 0.5) {
    revUV.x = 1.0 - revUV.x * 2.0;
  } else {
    revUV.x = 1.0 - (revUV.x - 0.5) * 2.0;
  }
  #endif

  revUV *= PI;

  vec3 p = vec3(cos(revUV.x), cos(revUV.y), sin(revUV.x));
  p.xz *= sqrt(1.0 - p.y * p.y);

  float r = 1.0 - asin(p.z) / (PI / 2.0);
  vec2 st = vec2(p.y, p.x);

  st *= r / sqrt(1.0 - p.z * p.z);
  //st *= _RADIUS;

  // stは (0,0)を中心としたFisheye座標

  bool forward_or_back;

  #if defined(_DRAW_FORWARD)
    forward_or_back = true;
  #elif defined(_DRAW_BACKWARD)
    forward_or_back = false;
  #else
    forward_or_back = (vUv.x <= 0.5);
  #endif

  if (forward_or_back) {
    st *= _RadiusBack;
    st = convert_for_backward(st);
  } else {
    st *= _RadiusFront;
    st = convert_for_forward(st);
  }

  gl_FragColor = texture2D(uTex, st);
}