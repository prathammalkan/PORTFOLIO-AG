'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './ArrivalCanvas.module.css';

/* ── Color palette ── */
const WORLD = {
  code:   { r: 51,  g: 153, b: 255 },
  cinema: { r: 224, g: 85,  b: 51  },
  canvas: { r: 240, g: 180, b: 41  },
  about:  { r: 51,  g: 204, b: 136 },
};
const WHITE = { r: 220, g: 225, b: 255 };

/* ── Easing helpers ── */
const ease = {
  outCubic: t => 1 - Math.pow(1 - t, 3),
  outQuart: t => 1 - Math.pow(1 - t, 4),
  inOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  outExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
};

/* ── Particle ── */
class Particle {
  constructor(x, y, color, radius, vx, vy, life, delay = 0) {
    this.x = x; this.y = y;
    this.color = color;
    this.radius = radius;
    this.vx = vx; this.vy = vy;
    this.life = life + delay;
    this.maxLife = life;
    this.delay = delay;
    this.opacity = 0;
  }

  update() {
    if (this.delay > 0) { this.delay--; return true; }
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.985;
    this.vy *= 0.985;
    this.life--;
    const lifeRatio = this.life / this.maxLife;
    // Fade in fast, fade out slowly
    if (lifeRatio > 0.8) this.opacity = (1 - lifeRatio) / 0.2;
    else if (lifeRatio < 0.35) this.opacity = lifeRatio / 0.35;
    else this.opacity = 1;
    return this.life > 0;
  }

  draw(ctx) {
    if (this.delay > 0 || this.opacity <= 0) return;
    const { r, g, b } = this.color;
    ctx.save();
    ctx.globalAlpha = this.opacity * 0.9;
    ctx.shadowBlur = this.radius * 4;
    ctx.shadowColor = `rgba(${r},${g},${b},0.7)`;
    ctx.fillStyle = `rgba(${r},${g},${b},1)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/* ── Main Component ── */
export default function ArrivalCanvas({ onComplete }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const [showSkip, setShowSkip] = useState(false);
  const [hiding, setHiding] = useState(false);
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setHiding(true);
    setTimeout(() => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      onComplete?.();
    }, 900);
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let dpr, W, H, cx, cy;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2;
      cy = H / 2;
    };
    resize();
    window.addEventListener('resize', resize);

    const skipTimer = setTimeout(() => setShowSkip(true), 1500);

    /* ── Timing (in frames at ~60fps) ── */
    const FPS = 60;
    const PHASE_DURATIONS = [
      1.2 * FPS,   // Phase 0: Void + ambient dust
      1.0 * FPS,   // Phase 1: Core light appears and pulses
      1.2 * FPS,   // Phase 2: Beam fires into prism
      1.8 * FPS,   // Phase 3: Refraction — colors explode outward
      0.6 * FPS,   // Phase 4: Hold and begin transition
    ];
    const TOTAL_FRAMES = PHASE_DURATIONS.reduce((a, b) => a + b, 0);

    let frame = 0;
    const worldKeys = Object.keys(WORLD);
    const worldColors = Object.values(WORLD);

    /* ── Prism triangle geometry ── */
    const prismSize = Math.min(W, H) * 0.06;
    const prismPts = [
      { x: cx, y: cy - prismSize },
      { x: cx - prismSize * 0.85, y: cy + prismSize * 0.6 },
      { x: cx + prismSize * 0.85, y: cy + prismSize * 0.6 },
    ];

    /* ── Refraction beam angles (right side of prism, fanning out) ── */
    const refAngles = [
      -Math.PI / 12,
      Math.PI / 10,
      Math.PI / 4.5,
      Math.PI / 3,
    ];

    /* ── Draw prism shape ── */
    function drawPrism(opacity) {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = 'rgba(200, 210, 230, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(200, 210, 230, 0.3)';
      ctx.beginPath();
      ctx.moveTo(prismPts[0].x, prismPts[0].y);
      ctx.lineTo(prismPts[1].x, prismPts[1].y);
      ctx.lineTo(prismPts[2].x, prismPts[2].y);
      ctx.closePath();
      ctx.stroke();

      // Inner fill — subtle glass effect
      const grd = ctx.createLinearGradient(cx - prismSize, cy - prismSize, cx + prismSize, cy + prismSize);
      grd.addColorStop(0, 'rgba(200, 210, 230, 0.03)');
      grd.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      grd.addColorStop(1, 'rgba(200, 210, 230, 0.02)');
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();
    }

    /* ── Draw the incoming white beam ── */
    function drawBeam(progress) {
      const beamLen = Math.max(W, H) * 0.55;
      const angle = Math.PI; // comes from the left
      const fromX = cx + Math.cos(angle) * beamLen;
      const fromY = cy + Math.sin(angle) * beamLen * 0.1; // slight angle
      const toX = cx - prismSize * 0.3;
      const toY = cy;

      const currentX = fromX + (toX - fromX) * progress;
      const currentY = fromY + (toY - fromY) * progress;

      ctx.save();
      // Beam core
      ctx.strokeStyle = `rgba(220, 225, 255, ${0.8 * Math.min(1, progress * 2)})`;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 30;
      ctx.shadowColor = 'rgba(200, 215, 255, 0.6)';
      ctx.beginPath();
      ctx.moveTo(currentX, currentY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // Beam glow (wider, softer)
      ctx.strokeStyle = `rgba(200, 215, 255, ${0.15 * progress})`;
      ctx.lineWidth = 12;
      ctx.shadowBlur = 40;
      ctx.shadowColor = 'rgba(180, 200, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(currentX, currentY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      ctx.restore();
    }

    /* ── Draw refraction beams ── */
    function drawRefractionBeams(progress) {
      const beamLen = Math.max(W, H) * 0.5 * ease.outCubic(progress);
      const originX = cx + prismSize * 0.3;
      const originY = cy;

      worldColors.forEach((c, i) => {
        const angle = refAngles[i];
        const endX = originX + Math.cos(angle) * beamLen;
        const endY = originY + Math.sin(angle) * beamLen;

        ctx.save();
        // Beam core
        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b}, ${0.7 * progress})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 30;
        ctx.shadowColor = `rgba(${c.r},${c.g},${c.b}, 0.5)`;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Beam glow
        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b}, ${0.12 * progress})`;
        ctx.lineWidth = 10;
        ctx.shadowBlur = 45;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.restore();
      });
    }

    /* ── Spawn refraction particles ── */
    function spawnRefraction(burstProgress) {
      const originX = cx + prismSize * 0.3;
      const originY = cy;
      worldColors.forEach((c, i) => {
        const baseAngle = refAngles[i];
        const count = 3 + Math.floor(Math.random() * 3);
        for (let j = 0; j < count; j++) {
          const angle = baseAngle + (Math.random() - 0.5) * 0.35;
          const speed = 1.5 + Math.random() * 3.5;
          const size = 1 + Math.random() * 2.5;
          const life = 50 + Math.random() * 60;
          particlesRef.current.push(
            new Particle(originX, originY, c, size, Math.cos(angle) * speed, Math.sin(angle) * speed, life, Math.floor(Math.random() * 8))
          );
        }
      });
    }

    /* ── Core glow at prism center ── */
    function drawCoreGlow(intensity, colorMix = 0) {
      const size = 30 + intensity * 25;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
      if (colorMix > 0) {
        g.addColorStop(0, `rgba(255, 255, 255, ${0.9 * intensity})`);
        g.addColorStop(0.25, `rgba(180, 200, 255, ${0.4 * intensity * colorMix})`);
        g.addColorStop(0.5, `rgba(51, 153, 255, ${0.15 * colorMix})`);
        g.addColorStop(0.75, `rgba(240, 180, 41, ${0.08 * colorMix})`);
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        g.addColorStop(0, `rgba(220, 225, 255, ${0.8 * intensity})`);
        g.addColorStop(0.4, `rgba(200, 210, 255, ${0.2 * intensity})`);
        g.addColorStop(1, 'rgba(200, 210, 255, 0)');
      }
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, size, 0, Math.PI * 2);
      ctx.fill();
    }

    /* ── Ambient dust (subtle moving dots in the void) ── */
    function spawnDust() {
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const vx = (Math.random() - 0.5) * 0.3;
        const vy = (Math.random() - 0.5) * 0.3;
        const size = 0.5 + Math.random() * 1;
        const life = 100 + Math.random() * 150;
        particlesRef.current.push(
          new Particle(x, y, { r: 150, g: 160, b: 180 }, size, vx, vy, life, Math.floor(Math.random() * 60))
        );
      }
    }

    /* ── Main render loop ── */
    spawnDust();

    function animate() {
      // Clear with slight trail
      ctx.fillStyle = 'rgba(8, 8, 14, 0.2)';
      ctx.fillRect(0, 0, W, H);

      frame++;

      // Calculate current phase and progress within phase
      let elapsed = 0;
      let phase = -1;
      let phaseProgress = 0;
      for (let i = 0; i < PHASE_DURATIONS.length; i++) {
        if (frame <= elapsed + PHASE_DURATIONS[i]) {
          phase = i;
          phaseProgress = (frame - elapsed) / PHASE_DURATIONS[i];
          break;
        }
        elapsed += PHASE_DURATIONS[i];
      }
      if (phase === -1) { finish(); return; }

      /* ── Phase 0: Void with ambient dust ── */
      if (phase === 0) {
        // Subtle vignette
        const vig = ctx.createRadialGradient(cx, cy, Math.min(W, H) * 0.1, cx, cy, Math.max(W, H) * 0.7);
        vig.addColorStop(0, 'rgba(8, 8, 14, 0)');
        vig.addColorStop(1, 'rgba(4, 4, 8, 0.5)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);

        // A faint hint of light appearing at center near end
        if (phaseProgress > 0.5) {
          const intensity = (phaseProgress - 0.5) * 2;
          drawCoreGlow(intensity * 0.3, 0);
        }
      }

      /* ── Phase 1: Core light pulses to life ── */
      if (phase === 1) {
        const pulseIntensity = ease.outQuart(phaseProgress);
        drawCoreGlow(pulseIntensity, 0);

        // Start fading in the prism shape
        if (phaseProgress > 0.4) {
          drawPrism(ease.outCubic((phaseProgress - 0.4) / 0.6) * 0.7);
        }
      }

      /* ── Phase 2: White beam fires from left into prism ── */
      if (phase === 2) {
        drawPrism(0.7);
        drawBeam(ease.outQuart(phaseProgress));
        drawCoreGlow(0.6 + phaseProgress * 0.4, phaseProgress * 0.3);

        // Prism starts glowing brighter as beam hits
        if (phaseProgress > 0.7) {
          const hitIntensity = (phaseProgress - 0.7) / 0.3;
          drawCoreGlow(0.8 + hitIntensity * 0.5, hitIntensity);
        }
      }

      /* ── Phase 3: Refraction — colors explode from prism ── */
      if (phase === 3) {
        // Keep incoming beam
        drawBeam(1);
        drawPrism(0.7 + phaseProgress * 0.3);

        // Refraction beams grow outward
        drawRefractionBeams(phaseProgress);
        drawCoreGlow(1, ease.outCubic(phaseProgress));

        // Spawn particle bursts
        if (phaseProgress < 0.7 && frame % 3 === 0) {
          spawnRefraction(phaseProgress);
        }
      }

      /* ── Phase 4: Hold + transition ── */
      if (phase === 4) {
        const fadeOut = 1 - ease.outCubic(phaseProgress);
        ctx.globalAlpha = fadeOut;
        drawBeam(1);
        drawPrism(fadeOut);
        drawRefractionBeams(1);
        drawCoreGlow(fadeOut, fadeOut);
        ctx.globalAlpha = 1;

        if (phaseProgress >= 0.9) {
          finish();
          return;
        }
      }

      // Update & draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        const alive = p.update();
        if (alive) p.draw(ctx);
        return alive;
      });

      animRef.current = requestAnimationFrame(animate);
    }

    // Initial clear
    ctx.fillStyle = 'rgb(8, 8, 14)';
    ctx.fillRect(0, 0, W, H);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      clearTimeout(skipTimer);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [finish]);

  return (
    <div className={`${styles.wrapper} ${hiding ? styles.hidden : ''}`}>
      <canvas ref={canvasRef} className={styles.canvas} />
      {showSkip && (
        <button className={styles.skipButton} onClick={finish}>
          Skip
        </button>
      )}
    </div>
  );
}
