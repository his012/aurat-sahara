import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Ambient WebGL background: 3 wave layers (top/mid/bottom), 8 lines each,
 * with a soft neon glow drawn via a fullscreen fragment shader.
 * Transparent canvas — sits behind content, the page background shows through.
 */
export default function FloatingLinesBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
        premultipliedAlpha: true,
      });
    } catch {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.pointerEvents = "none";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },
      uSpeed: { value: 3.0 },
      uLineSpacing: { value: 8.0 },
      uLinesPerLayer: { value: 8 },
      uColorStart: { value: new THREE.Color(0xc7196a) },
      uColorMid: { value: new THREE.Color(0xe0408a) },
      uColorEnd: { value: new THREE.Color(0x991040) },
    };

    const vert = /* glsl */ `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const frag = /* glsl */ `
      precision highp float;
      uniform float iTime;
      uniform vec2  iResolution;
      uniform float uSpeed;
      uniform float uLineSpacing;
      uniform vec3  uColorStart;
      uniform vec3  uColorMid;
      uniform vec3  uColorEnd;

      // 3-stop gradient
      vec3 grad3(float t) {
        t = clamp(t, 0.0, 1.0);
        if (t < 0.5) return mix(uColorStart, uColorMid, t * 2.0);
        return mix(uColorMid, uColorEnd, (t - 0.5) * 2.0);
      }

      // Wave y at a given x for a layer
      float waveY(float x, float layerCenter, float layerPhase, float t) {
        float w =
            sin(x * 1.6 + t * 0.9 + layerPhase) * 0.06
          + sin(x * 3.1 - t * 0.6 + layerPhase * 1.7) * 0.035
          + sin(x * 0.7 + t * 0.45 + layerPhase * 0.3) * 0.09;
        return layerCenter + w;
      }

      // Glow contribution from a line at given y-offset
      vec3 lineGlow(float dist, float idxT) {
        // dist in normalized [0..1] vertical space
        float core = exp(-dist * dist * 90000.0);          // bright core
        float glow = exp(-dist * dist * 1200.0) * 0.55;    // soft halo
        float wide = exp(-dist * dist * 220.0)  * 0.18;    // outer bloom
        vec3 col = grad3(idxT);
        return col * (core + glow + wide);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy; // 0..1
        float t = iTime * uSpeed * 0.1;             // tuned speed
        float aspect = iResolution.x / iResolution.y;
        float x = (uv.x - 0.5) * 2.0 * aspect;

        // Spacing converted from "8 px" feel to normalized: spacing in y units
        // We make spacing scale with resolution so it looks consistent.
        float spacing = uLineSpacing / iResolution.y; // ~8 pixels per line gap

        vec3 acc = vec3(0.0);

        // 3 layers: top (0.78), middle (0.5), bottom (0.22)
        for (int layer = 0; layer < 3; layer++) {
          float lc = (layer == 0) ? 0.78 : (layer == 1) ? 0.5 : 0.22;
          float lp = float(layer) * 1.7;

          for (int i = 0; i < 8; i++) {
            float fi = float(i) - 3.5;                // -3.5 .. 3.5
            float offset = fi * spacing * 4.0;        // band thickness
            float idxT = (float(i) + float(layer) * 2.7) / 10.0;
            float y = waveY(x + float(layer) * 0.6, lc, lp + float(i) * 0.18, t) + offset;
            float d = uv.y - y;
            acc += lineGlow(d, fract(idxT));
          }
        }

        // Soft tone
        acc = acc / (1.0 + acc); // gentle filmic
        float alpha = clamp(max(max(acc.r, acc.g), acc.b), 0.0, 1.0);
        gl_FragColor = vec4(acc, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const geom = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geom, material);
    scene.add(mesh);

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer!.setSize(w, h, false);
      uniforms.iResolution.value.set(w * dpr, h * dpr);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const start = performance.now();
    let raf = 0;
    let running = true;

    const tick = () => {
      if (!running) return;
      uniforms.iTime.value = (performance.now() - start) / 1000;
      renderer!.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      geom.dispose();
      material.dispose();
      renderer!.dispose();
      if (renderer!.domElement.parentNode === mount) {
        mount.removeChild(renderer!.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 0 }}
    />
  );
}
