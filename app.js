/* =====================================================================
   Día de las Flores Amarillas · Viaje Estelar
   Un solo index.html + un solo app.js. Se personaliza con la URL:
     ?para=novia | mama | hermanita | amiga | prima
     &nombre=Camila   (opcional: cambia el nombre mostrado)
   ===================================================================== */

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* =====================================================================
   1. CONTENIDO  (aquí editas mensajes, canciones y colores)
   ===================================================================== */

const EVENTO = {
  firma: 'Geral',                       // ← tu nombre: sale como "By Geral" y "Atte: Geral"
  pie: 'Feliz Día de las Flores Amarillas 🌼',
  volumenMusica: 0.85,
};

const DESTINATARIOS = {
  // ?para=todo  → dos modos: "por los jajas" (bromista) y "el rial" (romántico)
  todo: {
    nombre: 'Lobita',
    color: 0xffd700, // dorado brillante
    modos: {
      rial: {
        boton: 'Rial version',
        mensaje:
          'La primavera empieza hoy, pero yo te floreo cuando quieras :v. ' +
          'Cada flor amarilla de este universo es un motivo por el que me alegra que existas. ' +
          'Gracias por ser lo contrario de nada.' +
          '  PD: Ya trátame bonito p.',
        cancion: 'audio/rial.mp3',
        titulo: 'Canción random q me encontré x ahi :v',          // ← cámbialo
        artista: 'Cuco',                 // ← cámbialo
        portada: 'img/rial.jfif',       // ← tu imagen (cuadrada)
      },
      jajas: {
        boton: 'Evil version',
        mensaje:
          'Sabía que ibas a elegir esto. ' +
          'Hoy es el Día de las Flores Amarillas y, en vez de un ramo normal, te mandé un planeta entero: ' +
          'de nada, ya sé que no lo mereces. De hecho... devuélvemelo.' +
          'Pero weno... te quiero hasta cuando te pones violenta o dices cosas q me sacan de onda xde.',
        cancion: 'audio/jaja.mp3',
        titulo: 'Mala',     // ← cámbialo
        artista: '6ix9ine ',                 // ← cámbialo
        portada: 'img/jaja.jpg',      // ← tu imagen (cuadrada)
      },
    },
  },
  mama: {
    nombre: 'La mejor mamá del mundo',
    mensaje:
      'Mami, gracias por sembrar en mí todo lo bonito que hoy florece. ' +
      'Eres mi sol, mi refugio y mi mejor casualidad. ' +
      'Hoy el universo entero se viste de amarillo para ti.',
    cancion: 'audio/mama.mp3',
    titulo: 'Mary es mi amor',      // ← nombre de la canción
    artista: 'Leo Dan',   // ← artista
    portada: 'img/mama.jfif',  // ← portada (cuadrada)
    color: 0xffb74d, // amarillo cálido
  },
  hermanita: {
    nombre: 'Brya',
    mensaje:
      'Hoy es tu día, Bryanis: primavera, flores amarillas y todo lo lindo del mundo. ' +
      'Sigue brillando como siempre, que el universo te queda chico. ' +
      'Y ya sabes: aquí tienes a alguien con nave propia para despegar sin destino.',
    cancion: 'audio/hermanita.mp3',
    titulo: 'Niña Bonita',      // ← nombre de la canción
    artista: 'Dstance',   // ← artista
    portada: 'img/hermanita.jfif',  // ← portada (cuadrada)
    color: 0xffeb3b, // amarillo pastel
  },

  /* ---- Las dos chicas nuevas: cambia nombre, mensaje, canción y color ---- */
  angela: {
    nombre: 'Squishy',
    mensaje:
      'Hoy el cosmos se llenó de flores amarillas y aun así tú brillas más. ' +
      'Gracias por ser como eres: por las risas, las conversaciones y por quedarte siempre. ' +
      'Feliz primavera, que florezcas hasta en el espacio.' +
      '  PD: Ya no seas tan fría conmigo p :v',
    cancion: 'audio/amiga.mp3',
    titulo: 'Termonuclear',      // ← nombre de la canción
    artista: 'Perfecto miserable',   // ← artista
    portada: 'img/angela.jfif',  // ← portada (cuadrada)
    color: 0xffdf4d, // amarillo limón
  },
  liz: {
    nombre: 'Lizet :D',
    mensaje:
      'Que esta primavera te llene de flores, buena vibra y que ya no te hagan renegar xd. ' +
      'El universo entero te manda pétalos amarillos hoy (y mucha paciencia). ' +
      '¡A florecer, Evelyn :v!',
    cancion: 'audio/liz.mp3',
    titulo: 'Vamonos a marte',      // ← nombre de la canción
    artista: 'Kevin Kaarl',   // ← artista
    portada: 'img/liz.jfif',  // ← portada (cuadrada)
    color: 0xffc93c, // ámbar suave
  },
};

// Si la URL no trae ?para= o no existe, se muestra esto (sin música)
const POR_DEFECTO = {
  nombre: 'Para ti 💛',
  mensaje:
    'Hoy empieza la primavera y el universo se llenó de flores amarillas. ' +
    'Que tu día florezca con todo lo bonito que mereces.',
  cancion: 'audio/amarillo.mp3',
  titulo: 'Flores amarillas',      // ← nombre de la canción
  artista: 'Yo p',   // ← artista
  portada: 'img/girasol.jfif',
  color: 0xffd700,
};

/* =====================================================================
   2. UTILIDADES
   ===================================================================== */

const $ = (id) => document.getElementById(id);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);

const normalizar = (s) =>
  s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Ruido 3D simple (value noise) para rugosidad del asteroide
function hash3(x, y, z) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const l = lerp;
  return l(
    l(l(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u), l(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u), v),
    l(l(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u), l(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u), v),
    w
  );
}
function fbm(x, y, z) {
  let a = 0.5, f = 1, s = 0;
  for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, y * f, z * f); f *= 2; a *= 0.5; }
  return s / 0.9375;
}

// Textura circular suave (halo, polen)
function texturaSuave() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.25, 'rgba(255,255,255,.55)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}

/* =====================================================================
   3. PERFIL SEGÚN LA URL  (URLSearchParams)
   ===================================================================== */

function resolverPerfil() {
  const params = new URLSearchParams(window.location.search);
  const clave = normalizar(params.get('para') || '');
  const alias = { mami: 'mama', hermana: 'hermanita' };
  const perfil = { ...(DESTINATARIOS[alias[clave] || clave] || POR_DEFECTO) };

  const nombre = (params.get('nombre') || '').trim();
  if (nombre) perfil.nombre = nombre.slice(0, 40);
  return perfil;
}

// Devuelve los datos del modo activo (o del perfil si solo tiene un modo)
function datosDe(perfil, modo) {
  const m = perfil.modos ? perfil.modos[modo] : perfil;
  return { mensaje: m.mensaje, cancion: m.cancion, titulo: m.titulo, artista: m.artista, portada: m.portada };
}

function aplicarPerfilUI(perfil) {
  const hex = '#' + perfil.color.toString(16).padStart(6, '0');
  document.documentElement.style.setProperty('--acento', hex);
  // textContent (no innerHTML): la URL nunca puede inyectar HTML
  $('intro-sub').textContent = `Un viaje estelar para ${perfil.nombre}`;
  $('card-nombre').textContent = perfil.nombre;
  $('card-pie').textContent = EVENTO.pie;
  // Firma (textContent: seguro)
  const firmaIntro = $('intro-firma'), firmaCard = $('card-firma');
  if (EVENTO.firma) {
    firmaIntro.append('By ', Object.assign(document.createElement('b'), { textContent: EVENTO.firma }), ' ✦');
    firmaCard.append('Atte: ', Object.assign(document.createElement('b'), { textContent: EVENTO.firma }));
  }
  document.title = `Para ${perfil.nombre} · Flores Amarillas 🌼`;
}

/* =====================================================================
   4. ESCENA
   ===================================================================== */

const PLANET_R = 1.6;
const NUM_FLORES = 46;

const S = {
  t: 0,               // tiempo de la escena (s)
  started: false,
  clickT: 0,
  bloomT0: 0,
  pulseT: -99,        // último cambio de modo (para el latido)
  glow: 0,            // 0 → 1 tras el clic
  flyDur: 6.2,
  reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

const lowPower =
  window.matchMedia('(pointer: coarse)').matches ||
  (navigator.hardwareConcurrency || 8) <= 4 ||
  Math.min(window.innerWidth, window.innerHeight) < 500;

if (S.reduced) S.flyDur = 2;

/* ---------- 4.1 Renderer + cámara ---------- */
function crearRenderer(contenedor) {
  const renderer = new THREE.WebGLRenderer({
    antialias: lowPower,             // en escritorio el MSAA va en el composer
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  contenedor.appendChild(renderer.domElement);
  return renderer;
}

/* ---------- 4.2 Fondo: nebulosa + estrellas ---------- */
const FRAG_TAIL = `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

function crearCielo() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: `
      varying vec3 vDir;
      void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: `
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        vec3 base = vec3(0.010, 0.012, 0.038);
        float a = smoothstep(0.10, 0.95, dot(d, normalize(vec3( 0.7,  0.25, -0.6))));
        float b = smoothstep(0.20, 0.90, dot(d, normalize(vec3(-0.6, -0.30, -0.7))));
        float c = smoothstep(0.50, 1.00, dot(d, normalize(vec3( 0.0,  0.90, -0.4))));
        float mott = 0.6 + 0.4 * sin(d.x * 7.0 + d.y * 3.0) * sin(d.z * 6.0 - d.y * 4.0);
        vec3 col = base
                 + vec3(0.16, 0.07, 0.30) * a * mott          /* violeta */
                 + vec3(0.30, 0.16, 0.02) * b * mott * 0.8    /* dorado: guiño a las flores */
                 + vec3(0.03, 0.10, 0.22) * c;                /* azul */
        gl_FragColor = vec4(col, 1.0);
        ${FRAG_TAIL}
      }
    `,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), mat);
}

function crearEstrellas(pixelRatio) {
  const N = lowPower ? 2200 : 4500;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const size = new Float32Array(N);
  const phase = new Float32Array(N);
  const tint = [new THREE.Color(0xffffff), new THREE.Color(0xffe9b0), new THREE.Color(0xb9d2ff)];
  const v = new THREE.Vector3();

  for (let i = 0; i < N; i++) {
    v.randomDirection().multiplyScalar(rand(80, 220));
    pos.set([v.x, v.y, v.z], i * 3);
    const c = tint[Math.floor(Math.random() * 3)];
    col.set([c.r, c.g, c.b], i * 3);
    size[i] = 1.2 + Math.pow(Math.random(), 2.5) * 3.4;
    phase[i] = Math.random() * 6.283;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPR: { value: pixelRatio } },
    vertexShader: `
      attribute vec3 aColor; attribute float aSize; attribute float aPhase;
      uniform float uTime; uniform float uPR;
      varying vec3 vCol; varying float vA;
      void main() {
        float speed = 0.8 + fract(aPhase * 7.3) * 2.2;
        float tw = 0.5 + 0.5 * sin(uTime * speed + aPhase);
        vCol = aColor;
        vA = 0.45 + 0.55 * tw;
        gl_PointSize = aSize * uPR * (0.6 + 0.4 * tw);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vCol; varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        a *= a;
        gl_FragColor = vec4(vCol, a * vA);
        ${FRAG_TAIL}
      }
    `,
  });
  return new THREE.Points(geo, mat);
}

/* ---------- 4.3 Planeta rocoso ---------- */
function crearPlaneta(color) {
  const geo = new THREE.IcosahedronGeometry(PLANET_R, lowPower ? 7 : 11);
  const pos = geo.attributes.position;
  const cols = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  const c = new THREE.Color();
  const valle = new THREE.Color(0x23212b);
  const cresta = new THREE.Color(0x7e7670);
  const polvo = new THREE.Color(color).multiplyScalar(0.55);
  const seed = Math.random() * 20;

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const h = fbm(v.x * 1.5 + seed, v.y * 1.5 + seed, v.z * 1.5 + seed);
    const g = fbm(v.x * 3.4 + seed, v.y * 3.4 + seed, v.z * 3.4 + seed);
    const cresteado = 1 - Math.abs(2 * g - 1);
    const r = PLANET_R * (1 + (h - 0.5) * 0.42 + (cresteado - 0.5) * 0.16);
    pos.setXYZ(i, v.x * r, v.y * r, v.z * r);

    const m = clamp(h * 0.6 + cresteado * 0.4, 0, 1);
    c.copy(valle).lerp(cresta, m).lerp(polvo, 0.14 * m);
    cols.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.95,
    metalness: 0.05,
    flatShading: true,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/* ---------- 4.4 Rocas flotando (gravedad cero) ---------- */
function crearEscombros() {
  const N = lowPower ? 18 : 36;
  const mesh = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(0.13, 0),
    new THREE.MeshStandardMaterial({ color: 0x4a4650, roughness: 1, flatShading: true }),
    N
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;

  const datos = [];
  for (let i = 0; i < N; i++) {
    datos.push({
      base: new THREE.Vector3().randomDirection().multiplyScalar(rand(3.6, 8.5)),
      amp: new THREE.Vector3(rand(-0.4, 0.4), rand(-0.4, 0.4), rand(-0.4, 0.4)),
      f: rand(0.15, 0.4),
      ph: rand(0, 6.28),
      rot: new THREE.Vector3(rand(-0.4, 0.4), rand(-0.4, 0.4), rand(-0.4, 0.4)),
      s: rand(0.5, 1.7),
    });
  }
  const dummy = new THREE.Object3D();
  mesh.userData.actualizar = (t) => {
    datos.forEach((d, i) => {
      dummy.position.copy(d.base).addScaledVector(d.amp, Math.sin(t * d.f + d.ph));
      dummy.rotation.set(d.rot.x * t, d.rot.y * t, d.rot.z * t);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  mesh.userData.actualizar(0);
  return mesh;
}

/* ---------- 4.5 Flores (2 InstancedMesh = 2 draw calls) ---------- */
function crearFlores(color) {
  const segW = lowPower ? 6 : 8, segH = lowPower ? 4 : 5;

  // Una flor: dos coronas de pétalos (elipsoides aplastados) que forman una copa
  const petalos = [];
  const corona = (n, largo, ancho, inclina, offset, giro) => {
    for (let i = 0; i < n; i++) {
      const g = new THREE.SphereGeometry(1, segW, segH);
      g.scale(ancho, 0.05, largo);
      g.translate(0, 0, offset + largo * 0.9);
      g.rotateX(-inclina);
      g.rotateY((i / n) * Math.PI * 2 + giro);
      petalos.push(g);
    }
  };
  corona(8, 0.52, 0.17, 0.32, 0.10, 0);
  corona(8, 0.38, 0.14, 0.78, 0.06, Math.PI / 8);
  const geoPetalos = mergeGeometries(petalos);
  petalos.forEach((g) => g.dispose());

  const geoCentro = new THREE.SphereGeometry(0.17, 8, 6);
  geoCentro.translate(0, 0.13, 0);

  const matPetalos = new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 0.35, roughness: 0.45, metalness: 0.1,
  });
  const matCentro = new THREE.MeshStandardMaterial({
    color: 0x8a4a00, emissive: 0xff8a00, emissiveIntensity: 0.6, roughness: 0.6,
  });

  const mP = new THREE.InstancedMesh(geoPetalos, matPetalos, NUM_FLORES);
  const mC = new THREE.InstancedMesh(geoCentro, matCentro, NUM_FLORES);
  [mP, mC].forEach((m) => { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; });

  const base = new THREE.Color(color);
  const tmp = new THREE.Color();
  const anillos = [2.8, 3.6, 4.4, 5.2]; // órbitas concéntricas

  const flores = [];
  for (let i = 0; i < NUM_FLORES; i++) {
    const k = i % anillos.length;
    const axis = new THREE.Vector3(rand(-0.45, 0.45), 1, rand(-0.45, 0.45)).normalize();
    const b = new THREE.Vector3().randomDirection();
    b.addScaledVector(axis, -b.dot(axis)).normalize();
    flores.push({
      axis,
      base: b,
      radio: anillos[k] + rand(-0.15, 0.15),
      vel: (k % 2 ? -1 : 1) * rand(0.10, 0.18) / (0.5 + k * 0.25),
      fase: rand(0, 6.28),
      spin: rand(-0.7, 0.7),
      escala: rand(0.38, 0.72),
      delay: rand(0, 2.0),
      dur: rand(1.8, 2.6),
    });
    mP.setColorAt(i, tmp.copy(base).offsetHSL(rand(-0.015, 0.015), 0, rand(-0.06, 0.06)));
  }
  mP.instanceColor.needsUpdate = true;

  const grupo = new THREE.Group();
  grupo.add(mP, mC);
  grupo.visible = false;

  const dummy = new THREE.Object3D();
  const q = new THREE.Quaternion(), spinQ = new THREE.Quaternion();
  const pos = new THREE.Vector3(), dir = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);

  grupo.userData.material = matPetalos;
  grupo.userData.actualizar = (t) => {
    const tt = t - S.bloomT0;
    flores.forEach((f, i) => {
      const p = clamp((tt - f.delay) / f.dur);
      const e = easeOutBack(p);
      const r = lerp(PLANET_R * 0.5, f.radio, easeOutCubic(p)) + Math.sin(tt * 0.6 + f.fase) * 0.08 * p;

      q.setFromAxisAngle(f.axis, f.fase + f.vel * Math.max(tt, 0));
      pos.copy(f.base).applyQuaternion(q).multiplyScalar(r);
      dir.copy(pos).normalize();

      dummy.position.copy(pos);
      dummy.quaternion.setFromUnitVectors(up, dir);
      spinQ.setFromAxisAngle(up, f.spin * Math.max(tt, 0) + f.fase);
      dummy.quaternion.multiply(spinQ);
      dummy.scale.setScalar(Math.max(e, 0) * f.escala);
      dummy.updateMatrix();
      mP.setMatrixAt(i, dummy.matrix);
      mC.setMatrixAt(i, dummy.matrix);
    });
    mP.instanceMatrix.needsUpdate = true;
    mC.instanceMatrix.needsUpdate = true;
  };
  return grupo;
}

/* ---------- 4.6 Polen dorado ---------- */
function crearPolen(color, textura) {
  const N = lowPower ? 250 : 600;
  const pos = new Float32Array(N * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    v.randomDirection().multiplyScalar(rand(2.2, 6.4));
    v.y *= 0.55;
    pos.set([v.x, v.y, v.z], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    map: textura,
    color: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.35),
    size: 0.16,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geo, mat);
}

/* ---------- 4.6b Nombre flotando al fondo ---------- */
function crearNombre(texto, color) {
  const W = lowPower ? 1024 : 2048, H = W / 2;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const acento = '#' + new THREE.Color(color).getHexString();
  let dosLineas = false;

  function dibujar() {
    ctx.clearRect(0, 0, W, H);
    let lineas = [texto];
    if (dosLineas && texto.includes(' ')) {
      // parte el nombre por el espacio más cercano al centro
      const mid = texto.length / 2;
      let corte = -1, mejor = Infinity;
      [...texto].forEach((ch, i) => {
        if (ch === ' ' && Math.abs(i - mid) < mejor) { mejor = Math.abs(i - mid); corte = i; }
      });
      lineas = [texto.slice(0, corte), texto.slice(corte + 1)];
    }
    const fuente = (px) => `600 ${px}px Fraunces, Georgia, serif`;
    let px = H * (lineas.length === 1 ? 0.30 : 0.26);
    ctx.font = fuente(px);
    const ancho = Math.max(...lineas.map((l) => ctx.measureText(l).width));
    if (ancho > W * 0.92) px *= (W * 0.92) / ancho;
    ctx.font = fuente(px);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const inter = px * 1.15;
    const y0 = H / 2 - ((lineas.length - 1) * inter) / 2;
    lineas.forEach((l, i) => {
      const y = y0 + i * inter;
      ctx.shadowColor = acento; ctx.shadowBlur = px * 0.45;   // resplandor
      ctx.fillStyle = acento; ctx.globalAlpha = 0.9;
      ctx.fillText(l, W / 2, y);
      ctx.shadowBlur = px * 0.12;                              // núcleo cremoso
      ctx.fillStyle = '#fff6d6'; ctx.globalAlpha = 1;
      ctx.fillText(l, W / 2, y);
    });
    tex.needsUpdate = true;
  }

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 0.5),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
  );
  mesh.position.set(0, 3.4, -7);

  mesh.userData.modo = (dos) => { if (dos !== dosLineas) { dosLineas = dos; dibujar(); } };
  dibujar();
  // Redibuja cuando la tipografía ya cargó
  if (document.fonts && document.fonts.load) {
    document.fonts.load('600 100px Fraunces').then(dibujar).catch(() => { });
  }
  return mesh;
}

/* ---------- 4.7 Luces ---------- */
function crearLuces(color) {
  // Ambiente tenue de espacio profundo
  const ambiente = new THREE.AmbientLight(0x2a3070, 0.55);

  // "Estrella cercana": direccional potente con sombras
  const sol = new THREE.DirectionalLight(0xfff3dd, 3.2);
  sol.position.set(7, 4, 6);
  sol.castShadow = true;
  sol.shadow.mapSize.set(lowPower ? 512 : 1024, lowPower ? 512 : 1024);
  const sc = sol.shadow.camera;
  sc.near = 0.5; sc.far = 30; sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -8;
  sol.shadow.bias = -0.0005;
  sol.shadow.normalBias = 0.03;

  // Corazón dorado: crece tras el clic
  const corazon = new THREE.PointLight(color, 0, 0, 2);

  return { ambiente, sol, corazon };
}

/* =====================================================================
   5. ARRANQUE
   ===================================================================== */

function iniciar() {
  const perfil = resolverPerfil();
  aplicarPerfilUI(perfil);

  let renderer;
  try {
    renderer = crearRenderer($('stage'));
  } catch (err) {
    console.error(err);
    $('aviso').classList.add('show');
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);

  const cielo = crearCielo();
  const estrellas = crearEstrellas(renderer.getPixelRatio());
  const planeta = crearPlaneta(perfil.color);
  const escombros = crearEscombros();
  const flores = crearFlores(perfil.color);
  const suave = texturaSuave();
  const polen = crearPolen(perfil.color, suave);
  const { ambiente, sol, corazon } = crearLuces(perfil.color);

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: suave, color: perfil.color, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  halo.scale.set(10, 10, 1);

  const nombre = crearNombre(perfil.nombre, perfil.color);
  scene.add(nombre);

  // El planeta flota en un grupo para poder dar "deriva" de gravedad cero
  const grupoPlaneta = new THREE.Group();
  grupoPlaneta.add(planeta);

  scene.add(cielo, estrellas, grupoPlaneta, escombros, flores, polen, halo, ambiente, sol, corazon);

  /* ---- Postproceso (bloom) solo en equipos potentes ---- */
  let composer = null, bloom = null;
  if (!lowPower) {
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0, 0.6, 0.72);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    composer.setSize(window.innerWidth, window.innerHeight);
  }

  /* ---- Cámara: recorrido cinematográfico ---- */
  const recorrido = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 0.3, 9.5),     // inicio (pantalla de carga)
      new THREE.Vector3(1.8, 0.5, 4.6),   // zambullida hacia el planeta
      new THREE.Vector3(-2.6, 1.2, 6.0),  // barrido entre las flores
      new THREE.Vector3(0, 1.5, 10.8),    // plano final para ver todo el sistema
    ],
    false, 'centripetal'
  );
  const inicioCam = recorrido.getPoint(0);
  let distEscala = 1;
  let nombreAncho = 18, nombreY = 3.4;   // se recalculan en onResize
  const parallax = { x: 0, y: 0, tx: 0, ty: 0 };
  const camPos = new THREE.Vector3();

  window.addEventListener('pointermove', (e) => {
    parallax.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    parallax.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function actualizarCamara(t, dt) {
    let u = 0;
    if (S.started) u = clamp((t - S.clickT) / S.flyDur);
    const e = easeInOutCubic(u);

    if (S.started) camPos.copy(recorrido.getPoint(e));
    else camPos.copy(inicioCam);

    // Deriva suave que se desvanece al arrancar el vuelo
    const deriva = S.started ? 1 - clamp(u / 0.12) : 1;
    camPos.x += Math.sin(t * 0.25) * 0.35 * deriva;
    camPos.y += Math.cos(t * 0.2) * 0.2 * deriva;

    camPos.multiplyScalar(distEscala);

    parallax.x = lerp(parallax.x, parallax.tx, 1 - Math.pow(0.02, dt));
    parallax.y = lerp(parallax.y, parallax.ty, 1 - Math.pow(0.02, dt));
    camera.position.set(camPos.x + parallax.x * 0.8, camPos.y - parallax.y * 0.5, camPos.z);

    // Alabeo y FOV: sensación de velocidad durante el vuelo
    const pulso = Math.sin(Math.PI * u);
    const roll = S.reduced ? 0 : 0.10 * Math.sin(u * Math.PI * 2);
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    const fov = 55 + (S.reduced ? 0 : 13 * pulso * pulso);
    if (Math.abs(fov - camera.fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    camera.lookAt(0, 0, 0);
  }

  /* ---- Resize (móvil + escritorio) ---- */
  function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    // En vertical se aleja la cámara para que las órbitas quepan
    distEscala = camera.aspect < 1 ? Math.min(1.9, 0.95 / camera.aspect) : 1;
    camera.updateProjectionMatrix();

    // Nombre al fondo: en vertical se parte en dos líneas y se ajusta al ancho visible
    const vertical = camera.aspect < 1;
    nombre.userData.modo(vertical);
    const distPlano = 10.8 * distEscala + 7;
    const anchoVisible = 2 * Math.tan(THREE.MathUtils.degToRad(27.5)) * distPlano * camera.aspect;
    nombreAncho = vertical ? anchoVisible * 0.95 : Math.min(18, anchoVisible * 0.6);
    nombreY = vertical ? 4.4 : 3.4;

    renderer.setSize(w, h);
    estrellas.material.uniforms.uPR.value = renderer.getPixelRatio();
    if (composer) composer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  onResize();

  /* ---- Modos + Audio ---- */
  const modosKeys = perfil.modos ? Object.keys(perfil.modos) : [];
  let modoActual = modosKeys[0] || null;
  let datos = datosDe(perfil, modoActual);

  const audio = new Audio();
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0;
  const volumenObjetivo = EVENTO.volumenMusica;
  let fadeId = null;

  function fundir(hasta, ms = 1800, alTerminar) {
    clearInterval(fadeId);
    const desde = audio.volume, t0 = performance.now();
    fadeId = setInterval(() => {
      const k = clamp((performance.now() - t0) / ms);
      audio.volume = clamp(lerp(desde, hasta, k));
      if (k >= 1) { clearInterval(fadeId); if (alTerminar) alTerminar(); }
    }, 50);
  }

  function cargarCancion(src) {
    if (!src) { audio.removeAttribute('src'); audio.load(); return; }
    audio.src = src;
    audio.load();
  }

  function reproducir() {
    if (!audio.getAttribute('src')) return;
    audio.play()
      .then(() => fundir(volumenObjetivo))
      .catch((err) => console.warn('No se pudo reproducir el audio:', err));
  }

  /* ---- Minireproductor ---- */
  const pl = {
    root: $('player'), disco: $('p-disco'), img: $('p-img'),
    titulo: $('p-titulo'), artista: $('p-artista'),
    play: $('p-play'), vol: $('p-vol'), barra: $('p-barra'),
  };

  function pintarPlayer() {
    pl.root.hidden = !datos.cancion;                 // sin canción no hay reproductor
    pl.titulo.textContent = datos.titulo || 'Música';
    pl.artista.textContent = datos.artista || '';
    pl.barra.style.width = '0%';
    pl.disco.classList.remove('tiene-img');
    pl.img.hidden = true;
    if (datos.portada) {
      pl.img.onload = () => { pl.img.hidden = false; pl.disco.classList.add('tiene-img'); };
      pl.img.onerror = () => { pl.img.hidden = true; pl.disco.classList.remove('tiene-img'); };
      pl.img.src = datos.portada;
    } else {
      pl.img.removeAttribute('src');
    }
  }

  audio.addEventListener('play', () => {
    pl.root.classList.add('play');
    pl.play.textContent = '⏸';
    pl.play.setAttribute('aria-label', 'Pausar');
  });
  audio.addEventListener('pause', () => {
    pl.root.classList.remove('play');
    pl.play.textContent = '▶';
    pl.play.setAttribute('aria-label', 'Reproducir');
  });
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) pl.barra.style.width = (audio.currentTime / audio.duration) * 100 + '%';
  });

  pl.play.addEventListener('click', () => {
    if (audio.paused) audio.play().then(() => fundir(volumenObjetivo, 600)).catch(() => { });
    else audio.pause();
  });
  pl.vol.addEventListener('click', () => {
    audio.muted = !audio.muted;
    pl.vol.textContent = audio.muted ? '🔇' : '🔊';
    pl.vol.setAttribute('aria-label', audio.muted ? 'Activar sonido' : 'Silenciar');
  });

  /* ---- UI ---- */
  const intro = $('intro'), card = $('card'), chip = $('btn-chip');
  const dock = $('dock'), botonModo = $('btn-modo');

  function pintarMensaje() { $('card-msg').textContent = datos.mensaje; }

  function actualizarBotonModo() {
    const otro = modosKeys.find((k) => k !== modoActual);
    botonModo.textContent = '🔁 ' + perfil.modos[otro].boton;
    botonModo.setAttribute('aria-label', 'Cambiar de modo a ' + perfil.modos[otro].boton);
  }

  function cambiarModo() {
    const nuevo = modosKeys.find((k) => k !== modoActual);
    if (!nuevo) return;
    modoActual = nuevo;
    datos = datosDe(perfil, nuevo);
    S.pulseT = S.t;                                   // latido del planeta + destello del halo

    const cambiarCancion = () => { cargarCancion(datos.cancion); pintarPlayer(); reproducir(); };
    if (!audio.paused && audio.getAttribute('src')) fundir(0, 500, cambiarCancion);
    else cambiarCancion();

    // Muestra el nuevo mensaje aunque la tarjeta estuviera minimizada
    pintarMensaje();
    card.classList.remove('min');
    card.classList.add('show');
    chip.classList.remove('show');
    actualizarBotonModo();
  }
  botonModo.addEventListener('click', cambiarModo);

  function empezar(modo) {
    if (S.started) return;
    if (modo) { modoActual = modo; datos = datosDe(perfil, modo); }
    S.started = true;
    S.clickT = S.t;
    S.bloomT0 = S.t + (S.reduced ? 0.3 : 1.4);
    flores.visible = true;

    pintarMensaje();
    cargarCancion(datos.cancion);
    pintarPlayer();
    reproducir();                     // el clic desbloquea el autoplay

    if (modosKeys.length) { botonModo.hidden = false; actualizarBotonModo(); }
    intro.classList.add('gone');
    dock.classList.add('show');
    setTimeout(() => card.classList.add('show'), S.flyDur * 1000 * 0.62);
  }

  // Botones de inicio: uno por modo (?para=todo) o el botón único de siempre
  const contBotones = $('intro-botones');
  if (modosKeys.length) {
    modosKeys.forEach((k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'go go--' + k;
      b.textContent = perfil.modos[k].boton;
      b.addEventListener('click', () => empezar(k));
      contBotones.appendChild(b);
    });
    $('intro-hint').textContent = 'Elige tu modo de viaje y sube el volumen 🎧';
  } else {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'go';
    b.textContent = 'Iniciar Viaje Estelar 🚀';
    b.addEventListener('click', () => empezar());
    contBotones.appendChild(b);
    cargarCancion(datos.cancion);     // precarga (solo un modo)
  }
  pintarPlayer();

  $('btn-min').addEventListener('click', () => {
    card.classList.remove('show');
    card.classList.add('min');
    chip.classList.add('show');
  });
  chip.addEventListener('click', () => {
    card.classList.remove('min');
    card.classList.add('show');
    chip.classList.remove('show');
  });

  /* ---- Bucle ---- */
  const clock = new THREE.Clock();
  const matPetalos = flores.userData.material;

  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    S.t += dt;
    const t = S.t;

    estrellas.material.uniforms.uTime.value = t;

    // Planeta en gravedad cero: rota, cabecea y flota
    planeta.rotation.y = t * 0.06;
    planeta.rotation.x = Math.sin(t * 0.13) * 0.18;
    planeta.rotation.z = Math.cos(t * 0.09) * 0.1;
    grupoPlaneta.position.y = Math.sin(t * 0.55) * 0.09;
    grupoPlaneta.position.x = Math.cos(t * 0.37) * 0.05;

    escombros.userData.actualizar(t);

    // Nombre: flota suavemente, como todo lo demás en gravedad cero
    nombre.position.set(Math.sin(t * 0.3) * 0.3, nombreY + Math.sin(t * 0.5) * 0.25, -7);
    nombre.rotation.y = Math.sin(t * 0.2) * 0.06;

    if (S.started) {
      const gn = easeOutCubic(clamp((t - S.clickT - 1.0) / 3.0));
      const k = 0.92 + 0.08 * gn;
      nombre.material.opacity = 0.92 * gn;
      nombre.scale.set(nombreAncho * k, nombreAncho * k * 0.5, 1);

      const g = easeOutCubic(clamp((t - S.clickT - 0.6) / 4.2));
      S.glow = g;

      flores.userData.actualizar(t);
      flores.rotation.y = (t - S.bloomT0) * 0.03;    // giro lento del conjunto
      polen.rotation.y = t * 0.04;

      corazon.intensity = g * 75 * (1 + Math.sin(t * 1.6) * 0.06);
      matPetalos.emissiveIntensity = 0.35 + 0.75 * g;
      planeta.material.emissiveIntensity = 0.05 * g;
      const flash = Math.sin(Math.PI * clamp((t - S.pulseT) / 1.2));
      halo.material.opacity = 0.5 * g + 0.3 * flash * g;
      polen.material.opacity = 0.9 * g;
      if (bloom) bloom.strength = 0.85 * g;

      // Latido del planeta al florecer
      const latido = clamp((t - S.bloomT0) / 1.6);
      grupoPlaneta.scale.setScalar(1 + Math.sin(Math.PI * latido) * 0.06 + flash * 0.05);
    }

    actualizarCamara(t, dt);
    if (composer) composer.render(); else renderer.render(scene, camera);
  }
  tick();
}

iniciar();
