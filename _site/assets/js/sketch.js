'use strict';

(function() {
  var container = document.getElementById('canvas-container');
  if (!container) return;

  // Respect prefers-reduced-motion — skip the animation entirely.
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    // Render a single static portrait fallback for accessibility.
    var fallback = document.createElement('img');
    fallback.src = '/assets/images/portrait.jpg';
    fallback.alt = 'Guillaume Lauzier';
    fallback.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center;';
    container.appendChild(fallback);
    return;
  }

  // Pause the animation when the hero scrolls offscreen — saves CPU/battery.
  var paused = false;
  if (typeof IntersectionObserver !== 'undefined') {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        paused = !entry.isIntersecting;
        if (typeof noLoop === 'function' && typeof loop === 'function') {
          if (paused) noLoop(); else loop();
        }
      });
    }, { threshold: 0.01 });
    io.observe(container);
  }

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
  targetFPS: 30,
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
let lastMouseX = 0;
let lastMouseY = 0;
let resizeTimer = null;

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
  var cnv = createCanvas(canvasW, canvasH);
  cnv.parent('canvas-container');
  var ce = cnv.elt || cnv.canvas;
  if (ce) {
    ce.style.position = 'absolute';
    ce.style.top = '0';
    ce.style.left = '0';
    ce.style.width = '100%';
    ce.style.height = '100%';
  }
  pixelDensity(1);
  noSmooth();
  frameRate(CONFIG.targetFPS);
  computeImageTransform();
  buildGrid();
  setTimeout(function() {
    var newW = (heroWrapper && heroWrapper.offsetWidth) || window.innerWidth;
    var newH = (heroWrapper && heroWrapper.offsetHeight) || window.innerHeight;
    if (Math.abs(newW - canvasW) > 4 || Math.abs(newH - canvasH) > 4) {
      canvasW = newW;
      canvasH = newH;
      resizeCanvas(canvasW, canvasH);
      if (ce) {
        ce.style.width = '100%';
        ce.style.height = '100%';
      }
      computeImageTransform();
      buildGrid();
    }
  }, 200);
};

function computeImageTransform() {
  var scaleX = canvasW / img.width;
  var scaleY = canvasH / img.height;
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

  var step = CONFIG.baseStep;
  var cols = ceil(canvasW / step);
  var rows = ceil(canvasH / step);
  var imgW = img.width;
  var imgH = img.height;
  var pixels = img.pixels;
  var textZoneX = canvasW * CONFIG.textZoneRatio;
  var maxDistScaled = maxDist * 0.55;

  for (var row = 0; row < rows; row++) {
    for (var col = 0; col < cols; col++) {
      var cx = col * step + step * 0.5;
      var cy = row * step + step * 0.5;

      var imgX = floor((cx - imgOffX) / imgScale);
      var imgY = floor((cy - imgOffY) / imgScale);
      if (imgX < 0) imgX = 0; else if (imgX >= imgW) imgX = imgW - 1;
      if (imgY < 0) imgY = 0; else if (imgY >= imgH) imgY = imgH - 1;

      var idx = (imgY * imgW + imgX) * 4;
      var r = pixels[idx];
      var g = pixels[idx + 1];
      var b = pixels[idx + 2];

      var ddx = cx - focalX;
      var ddy = cy - focalY;
      var d = Math.sqrt(ddx * ddx + ddy * ddy);
      var nd = d / maxDistScaled;
      if (nd > 1) nd = 1;
      var pxSize = CONFIG.minPxSize + (CONFIG.maxPxSize - CONFIG.minPxSize) * nd * nd;

      var inTextZone = cx < textZoneX;

      grid.push({
        tx: cx, ty: cy,
        x: cx, y: cy,
        vx: 0, vy: 0,
        r: r, g: g, b: b,
        size: pxSize,
        noiseOff: Math.random() * 10000,
        inTextZone: inTextZone,
      });
    }
  }
}

window.draw = function() {
  background(8, 8, 12);
  noiseT += CONFIG.noiseSpeed;

  var mx = mouseX;
  var my = mouseY;

  parallaxX += (mx - canvasW * 0.5) * 0.00003 - parallaxX * 0.05;
  parallaxY += (my - canvasH * 0.5) * 0.00003 - parallaxY * 0.05;

  noStroke();

  var len = grid.length;
  var repelR = CONFIG.repelRadius;
  var repelRSq = repelR * repelR;
  var repelRText = repelR * 0.35;
  var repelRTextSq = repelRText * repelRText;
  var repelF = CONFIG.repelForce;
  var repelFText = repelF * 0.15;
  var easing = CONFIG.easing;
  var friction = CONFIG.friction;
  var noiseAmpFull = CONFIG.noiseAmp;
  var noiseAmpText = CONFIG.textNoiseAmp;
  var textDarken = CONFIG.textDarken;
  var glowThresh = CONFIG.glowThreshold;
  var px18 = parallaxX * 18;
  var py12 = parallaxY * 12;

  for (var i = 0; i < len; i++) {
    var p = grid[i];

    var noiseAmp = p.inTextZone ? noiseAmpText : noiseAmpFull;
    var nx = (noise(p.noiseOff, noiseT) * 2 - 1) * noiseAmp;
    var ny = (noise(p.noiseOff + 500, noiseT) * 2 - 1) * noiseAmp;

    var parallaxFactor = p.inTextZone ? 0.15 : 1.0;
    var targetX = p.tx + nx + px18 * parallaxFactor;
    var targetY = p.ty + ny + py12 * parallaxFactor;

    var curRepelRSq = p.inTextZone ? repelRTextSq : repelRSq;
    var curRepelR = p.inTextZone ? repelRText : repelR;
    var curRepelF = p.inTextZone ? repelFText : repelF;

    var dx = p.x - mx;
    var dy = p.y - my;
    var dSq = dx * dx + dy * dy;

    if (dSq < curRepelRSq) {
      var d = Math.sqrt(dSq);
      var strength = (1 - d / curRepelR) * curRepelF;
      var angle = Math.atan2(dy, dx);
      p.vx += Math.cos(angle) * strength;
      p.vy += Math.sin(angle) * strength;
    }

    p.vx += (targetX - p.x) * easing;
    p.vy += (targetY - p.y) * easing;
    p.vx *= friction;
    p.vy *= friction;
    p.x += p.vx;
    p.y += p.vy;

    var r = p.r, g = p.g, b = p.b;

    if (p.inTextZone) {
      r = r + (22 - r) * textDarken;
      g = g + (22 - g) * textDarken;
      b = b + (28 - b) * textDarken;
    }

    var brightness = (r + g + b) * 0.333;
    var half = p.size * 0.5;

    if (!p.inTextZone && brightness > glowThresh) {
      var gAlpha = 12 + (brightness - glowThresh) * (28 / (255 - glowThresh));
      var gs = p.size * 2.4;
      var gh = gs * 0.5;
      fill(r, g, b, gAlpha);
      rect(p.x - gh, p.y - gh, gs, gs);
    }

    fill(r, g, b);
    rect(p.x - half, p.y - half, p.size, p.size);
  }
};

window.windowResized = function() {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    getHeroDimensions();
    resizeCanvas(canvasW, canvasH);
    var c = document.querySelector('#canvas-container canvas');
    if (c) {
      c.style.position = 'absolute';
      c.style.top = '0';
      c.style.left = '0';
      c.style.width = '100%';
      c.style.height = '100%';
    }
    computeImageTransform();
    buildGrid();
    resizeTimer = null;
  }, 150);
};

})();
