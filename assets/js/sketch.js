'use strict';

(function() {
  var container = document.getElementById('canvas-container');
  if (!container) return;

const CONFIG = {
  baseStep: 12,
  minPxSize: 3,
  maxPxSize: 22,
  focalXRatio: 0.63,
  focalYRatio: 0.40,
  textZoneRatio: 0.40,
  repelRadius: 90,
  repelForce: 14,
  easing: 0.09,
  friction: 0.82,
  noiseScale: 0.003,
  noiseSpeed: 0.00025,
  noiseAmp: 3.5,
  textNoiseAmp: 0.8,
  textDarken: 0.55,
  glowThreshold: 180,
};

let img;
let grid = [];
let noiseT = 0;
let imgOffX, imgOffY, imgScale;
let focalX, focalY;
let maxDist;
let parallaxX = 0;
let parallaxY = 0;
let heroWrapper;
let canvasW, canvasH;

function getHeroDimensions() {
  heroWrapper = document.querySelector('.gl-hero-wrapper') || document.getElementById('canvas-container');
  if (heroWrapper) {
    canvasW = heroWrapper.offsetWidth || window.innerWidth;
    canvasH = heroWrapper.offsetHeight || window.innerHeight;
  } else {
    canvasW = window.innerWidth;
    canvasH = window.innerHeight;
  }
  if (!canvasW) canvasW = window.innerWidth;
  if (!canvasH) canvasH = window.innerHeight;
}

window.preload = function() {
  img = loadImage('/assets/images/portrait.jpg');
};

window.setup = function() {
  getHeroDimensions();
  let cnv = createCanvas(canvasW, canvasH);
  cnv.parent('canvas-container');
  pixelDensity(1);
  noSmooth();
  computeImageTransform();
  buildGrid();
  // Re-read dimensions after layout settles and rebuild if needed
  setTimeout(function() {
    var newW = (heroWrapper && heroWrapper.offsetWidth) || window.innerWidth;
    var newH = (heroWrapper && heroWrapper.offsetHeight) || window.innerHeight;
    if (Math.abs(newW - canvasW) > 4 || Math.abs(newH - canvasH) > 4) {
      canvasW = newW;
      canvasH = newH;
      resizeCanvas(canvasW, canvasH);
      computeImageTransform();
      buildGrid();
    }
  }, 200);
};

function computeImageTransform() {
  let scaleX = canvasW / img.width;
  let scaleY = canvasH / img.height;
  imgScale = max(scaleX, scaleY);
  imgOffX = (canvasW - img.width * imgScale) / 2;
  imgOffY = (canvasH - img.height * imgScale) / 2;
  focalX = canvasW * CONFIG.focalXRatio;
  focalY = canvasH * CONFIG.focalYRatio;
  maxDist = dist(0, 0, canvasW, canvasH);
}

function buildGrid() {
  grid = [];
  img.loadPixels();

  let step = CONFIG.baseStep;
  let cols = ceil(canvasW / step);
  let rows = ceil(canvasH / step);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let cx = col * step + step * 0.5;
      let cy = row * step + step * 0.5;

      let imgX = floor((cx - imgOffX) / imgScale);
      let imgY = floor((cy - imgOffY) / imgScale);
      imgX = constrain(imgX, 0, img.width - 1);
      imgY = constrain(imgY, 0, img.height - 1);

      let idx = (imgY * img.width + imgX) * 4;
      let r = img.pixels[idx];
      let g = img.pixels[idx + 1];
      let b = img.pixels[idx + 2];

      let d = dist(cx, cy, focalX, focalY);
      let nd = constrain(d / (maxDist * 0.55), 0, 1);
      let pxSize = lerp(CONFIG.minPxSize, CONFIG.maxPxSize, nd * nd);

      let inTextZone = cx < canvasW * CONFIG.textZoneRatio;

      grid.push({
        tx: cx, ty: cy,
        x: cx, y: cy,
        vx: 0, vy: 0,
        r, g, b,
        size: pxSize,
        noiseOff: random(10000),
        inTextZone,
      });
    }
  }
}

window.draw = function() {
  background(8, 8, 12);
  noiseT += CONFIG.noiseSpeed;

  let mx = mouseX;
  let my = mouseY;

  parallaxX += (mouseX - canvasW * 0.5) * 0.00003 - parallaxX * 0.05;
  parallaxY += (mouseY - canvasH * 0.5) * 0.00003 - parallaxY * 0.05;

  noStroke();

  for (let i = 0; i < grid.length; i++) {
    let p = grid[i];

    let noiseAmp = p.inTextZone ? CONFIG.textNoiseAmp : CONFIG.noiseAmp;
    let nx = (noise(p.noiseOff, noiseT) * 2 - 1) * noiseAmp;
    let ny = (noise(p.noiseOff + 500, noiseT) * 2 - 1) * noiseAmp;

    let parallaxFactor = p.inTextZone ? 0.15 : 1.0;
    let targetX = p.tx + nx + parallaxX * 18 * parallaxFactor;
    let targetY = p.ty + ny + parallaxY * 12 * parallaxFactor;

    let repelRadius = p.inTextZone ? CONFIG.repelRadius * 0.35 : CONFIG.repelRadius;
    let repelForce  = p.inTextZone ? CONFIG.repelForce * 0.15  : CONFIG.repelForce;

    let dx = p.x - mx;
    let dy = p.y - my;
    let dSq = dx * dx + dy * dy;
    let rSq = repelRadius * repelRadius;

    if (dSq < rSq) {
      let d = sqrt(dSq);
      let strength = (1 - d / repelRadius) * repelForce;
      let angle = atan2(dy, dx);
      p.vx += cos(angle) * strength;
      p.vy += sin(angle) * strength;
    }

    p.vx += (targetX - p.x) * CONFIG.easing;
    p.vy += (targetY - p.y) * CONFIG.easing;
    p.vx *= CONFIG.friction;
    p.vy *= CONFIG.friction;
    p.x += p.vx;
    p.y += p.vy;

    let r = p.r, g = p.g, b = p.b;

    if (p.inTextZone) {
      let t = CONFIG.textDarken;
      r = lerp(r, 22, t);
      g = lerp(g, 22, t);
      b = lerp(b, 28, t);
    }

    let brightness = (r + g + b) / 3;
    let half = p.size * 0.5;

    if (!p.inTextZone && brightness > CONFIG.glowThreshold) {
      let gAlpha = map(brightness, CONFIG.glowThreshold, 255, 12, 40);
      let gs = p.size * 2.4;
      let gh = gs * 0.5;
      fill(r, g, b, gAlpha);
      rect(p.x - gh, p.y - gh, gs, gs);
    }

    fill(r, g, b);
    rect(p.x - half, p.y - half, p.size, p.size);
  }
};

window.windowResized = function() {
  getHeroDimensions();
  resizeCanvas(canvasW, canvasH);
  computeImageTransform();
  buildGrid();
};

})();
