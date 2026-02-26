// ─── Main particle shaders ────────────────────────────────────────────────────

export const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aPhase;
  varying float vOpacity;
  varying float vDepth;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float pulse = sin(uTime * 1.5 + aPhase) * 0.5 + 0.5;
    vOpacity = 0.45 + pulse * 0.55;
    vDepth   = clamp((-mv.z - 100.0) / 500.0, 0.0, 1.0);
    float sz = uSize * (0.9 + pulse * 0.4);
    gl_PointSize = min(sz * (600.0 / -mv.z) * uPixelRatio, 60.0);
    gl_Position  = projectionMatrix * mv;
  }
`;

export const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying float vOpacity;
  varying float vDepth;

  void main() {
    float d    = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;

    float core = smoothstep(0.14, 0.0, d);
    float glow = smoothstep(0.50, 0.08, d);
    float mid  = smoothstep(0.32, 0.1, d);

    vec3 bright = mix(uColor, vec3(1.0), 0.70);
    vec3 col    = mix(uColor, bright, core * 0.85);
    col        += uColor * mid * 0.35;

    float depthFade = 1.0 - vDepth * 0.5;
    float alpha = (core * 1.0 + glow * 0.28 + mid * 0.18) * vOpacity * depthFade;
    gl_FragColor = vec4(col, alpha);
  }
`;

// ─── Starfield shaders ────────────────────────────────────────────────────────

export const STAR_VERTEX_SHADER = /* glsl */ `
  uniform float uWarp;
  uniform float uPixelRatio;
  attribute vec3 aStarColor;
  varying vec3  vStarColor;
  varying float vBrightness;

  void main() {
    vec4  mv         = modelViewMatrix * vec4(position, 1.0);
    vStarColor        = aStarColor;
    vBrightness       = 0.55 + uWarp * 0.45;
    float baseSize    = 1.6 + uWarp * 4.0;
    float depthScale  = 600.0 / max(-mv.z, 1.0);
    gl_PointSize = min(baseSize * depthScale * uPixelRatio, 50.0);
    gl_Position  = projectionMatrix * mv;
  }
`;

export const STAR_FRAGMENT_SHADER = /* glsl */ `
  varying vec3  vStarColor;
  varying float vBrightness;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float core  = smoothstep(0.3,  0.0,  d);
    float glow  = smoothstep(0.5,  0.1,  d);
    float alpha = (core + glow * 0.25) * vBrightness;
    vec3  col   = mix(vStarColor, vec3(1.0), core * 0.55);
    gl_FragColor = vec4(col, alpha);
  }
`;

// ─── Wave grid shaders (slide 3 — Experience) ────────────────────────────────

export const WAVE_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uMouseX;
  uniform float uMouseZ;
  uniform float uPixelRatio;
  varying float vElevation;
  varying float vFog;

  void main() {
    vec3 pos = position;

    float dx          = pos.x - uMouseX;
    float dz          = pos.z - uMouseZ;
    float distToMouse = sqrt(dx * dx + dz * dz);
    float mouseRipple = exp(-distToMouse * 0.0025) * sin(distToMouse * 0.10 - uTime * 3.0) * 1.8;

    float wave1 = sin(pos.x * 0.048 + uTime * 1.1) * cos(pos.z * 0.038 + uTime * 0.7);
    float wave2 = sin((pos.x + pos.z) * 0.030 + uTime * 0.85) * 0.55;
    float wave3 = cos(pos.x * 0.022 - pos.z * 0.028 + uTime * 1.4) * 0.35;

    float elevation = (wave1 + wave2 + wave3 + mouseRipple) * uAmplitude;
    pos.y = elevation;

    vElevation = elevation;

    vec4 mv  = modelViewMatrix * vec4(pos, 1.0);
    vFog     = clamp((-mv.z - 100.0) / 900.0, 0.0, 1.0);

    float sz = 1.8 + abs(elevation) / uAmplitude * 1.4;
    gl_PointSize = min(sz * (500.0 / -mv.z) * uPixelRatio, 18.0);
    gl_Position  = projectionMatrix * mv;
  }
`;

export const WAVE_FRAGMENT_SHADER = /* glsl */ `
  uniform float uAmplitude;
  varying float vElevation;
  varying float vFog;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;

    float core = smoothstep(0.35, 0.0, d);
    float glow = smoothstep(0.50, 0.1, d);

    float t = clamp((vElevation / uAmplitude) * 0.5 + 0.5, 0.0, 1.0);
    vec3 deep   = vec3(0.08, 0.03, 0.22);
    vec3 mid    = vec3(0.55, 0.10, 0.90);
    vec3 bright = vec3(0.92, 0.60, 1.00);
    vec3 col    = t < 0.5 ? mix(deep, mid, t * 2.0) : mix(mid, bright, (t - 0.5) * 2.0);
    col         = mix(col, vec3(1.0), core * 0.45);

    float fogFade = 1.0 - vFog * 0.72;
    float alpha   = (core + glow * 0.28) * fogFade * (0.55 + t * 0.45);
    gl_FragColor  = vec4(col, alpha);
  }
`;

// ─── Text particle shaders (slide 0 — Hero) ──────────────────────────────────

export const TEXT_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aPhase;
  varying float vGlow;
  varying float vDepth;

  void main() {
    vec4  mv    = modelViewMatrix * vec4(position, 1.0);
    float pulse = sin(uTime * 2.2 + aPhase * 6.28318) * 0.5 + 0.5;
    vGlow  = pulse;
    vDepth = clamp((-mv.z - 50.0) / 450.0, 0.0, 1.0);
    float sz = 2.0 + pulse * 1.8;
    gl_PointSize = min(sz * (600.0 / -mv.z) * uPixelRatio, 22.0);
    gl_Position  = projectionMatrix * mv;
  }
`;

export const TEXT_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  varying float vGlow;
  varying float vDepth;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float core  = smoothstep(0.28, 0.0,  d);
    float glow  = smoothstep(0.50, 0.08, d);
    vec3  col   = mix(uColorA, uColorB, core * 0.75 + vGlow * 0.25);
    col         = mix(col, vec3(1.0), core * 0.35);
    float alpha = (core + glow * 0.35) * (0.65 + vGlow * 0.35) * (1.0 - vDepth * 0.45);
    gl_FragColor = vec4(col, alpha);
  }
`;
