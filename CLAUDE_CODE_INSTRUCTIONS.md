# Instrucciones para Claude Code — Solo animaciones nuevas

Hola Claude Code. NO sobreescribas archivos completos. Solo agrega las animaciones descritas abajo al código existente del repo. Respeta el código actual.

## Contexto
Repo: `Is44c2005/anitam-spotify` (React + Vite, CSS Modules).
Archivos a modificar: `src/index.css`, `src/pages/Welcome.module.css`, `src/pages/Home.jsx`, `src/pages/Home.module.css`.

---

## 1) `src/index.css` — AGREGAR estos keyframes al final (no borrar nada existente)

```css
@keyframes wiggle {
  0%, 100% { transform: rotate(var(--rot, 0deg)); }
  25%      { transform: rotate(calc(var(--rot, 0deg) + 1.5deg)); }
  75%      { transform: rotate(calc(var(--rot, 0deg) - 1.5deg)); }
}

@keyframes floatCard {
  0%, 100% { transform: rotate(var(--rot, 0deg)) translateY(0); }
  50%      { transform: rotate(var(--rot, 0deg)) translateY(-6px); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0; transform: scale(.5); }
  50%      { opacity: 1; transform: scale(1); }
}

@keyframes popPip {
  0%   { transform: scale(0); }
  60%  { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 0 4px rgba(245,175,175,.35); }
  50%      { box-shadow: 0 0 0 8px rgba(245,175,175,.55); }
}

@keyframes floatUpHero {
  0%   { transform: translateY(0) rotate(-8deg); opacity: 0; }
  10%  { opacity: .45; }
  90%  { opacity: .45; }
  100% { transform: translateY(-380px) rotate(12deg); opacity: 0; }
}

/* Scroll reveal utility */
.reveal { opacity: 0; transform: translateY(40px);
  transition: opacity .8s ease, transform .8s cubic-bezier(.34,1.56,.64,1); }
.reveal.in { opacity: 1; transform: translateY(0); }
```

---

## 2) `src/pages/Welcome.module.css` — MODIFICAR reglas existentes (no reemplazar archivo)

### En `.tagline` — AGREGAR una segunda animación:
```css
animation: fadeInUp 0.9s ease 0.1s both, wiggle 6s ease-in-out 1s infinite;
```
Y agregar la variable `--rot: -3deg;` a la misma regla.

### En `.titleAccent` — AGREGAR:
```css
display: inline-block;
animation: heartbeat 2.2s ease-in-out 1.5s infinite;
```

### En `.card1` — AGREGAR:
```css
--rot: -3deg;
animation: revealUp .9s ease .5s both, floatCard 8s ease-in-out 1.5s infinite;
transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s;
```
Y agregar selector nuevo:
```css
.card1:hover {
  transform: rotate(0deg) translateY(-6px) scale(1.02);
  box-shadow: 6px 9px 0 rgba(58,32,32,.1), 0 18px 40px rgba(58,32,32,.12);
  animation-play-state: paused;
}
```

### Lo mismo para `.card2` (--rot: 2deg; delay .65s, 9s) y `.card3` (--rot: -1.5deg; delay .8s, 10s). Incluir `:hover` con `animation-play-state: paused`.

### En `.enterBtn` — AGREGAR:
```css
--rot: -1deg;
animation: wiggle 5s ease-in-out 2s infinite;
```
Y en `.enterBtn:hover` agregar `animation-play-state: paused;`.

### Agregar keyframe local si hace falta:
```css
@keyframes revealUp {
  from { opacity: 0; transform: translateY(40px) rotate(var(--rot, 0deg)); }
  to   { opacity: 1; transform: translateY(0) rotate(var(--rot, 0deg)); }
}
```

### Twinkles de fondo — AGREGAR a `.root`:
```css
.root { position: relative; overflow: hidden; }
.root::before, .root::after {
  content: '✦'; position: absolute; color: var(--accent-dark); font-size: 18px;
  animation: twinkle 3s ease-in-out infinite; pointer-events: none;
}
.root::before { top: 15%; left: 8%; animation-delay: .3s; }
.root::after  { bottom: 12%; right: 10%; animation-delay: 1.8s; }
```

---

## 3) `src/pages/Home.jsx` — AGREGAR hooks y aplicar, sin reescribir

### Al inicio del archivo, agregar dos hooks:
```jsx
import { useEffect, useState, useRef } from 'react';

function useCountUp(target, duration = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return ref;
}
```

### Dentro de `Home()`, agregar:
```jsx
const monthsAnim = useCountUp(months, 1400);
const daysAnim   = useCountUp(days, 1600);
```
Y reemplazar `{months} meses` por `{monthsAnim} meses`, `{days} días` por `{daysAnim} días` SOLO en el counter-card del hero.

### En el hero, antes del `.helloTag`, agregar el campo de corazones:
```jsx
<div className={styles.heartField} aria-hidden>
  {Array.from({ length: 8 }).map((_, i) => (
    <span key={i} className={styles.heartFloat} style={{
      left: `${(i * 13.7) % 95}%`,
      fontSize: 14 + (i % 3) * 6,
      animationDuration: `${9 + (i % 4) * 2}s`,
      animationDelay: `${i * 0.7}s`,
    }}>♡</span>
  ))}
</div>
```

### Y dentro del `.counterCard`, agregar 2 sparkles:
```jsx
<span className={styles.twinkle} style={{ top: -8, right: 10, animationDelay: '.2s' }}>✦</span>
<span className={styles.twinkle} style={{ bottom: -6, left: 14, animationDelay: '1.1s' }}>✦</span>
```

### Para cada `<section>` del Home, agregar ref + className reveal:
```jsx
const ourSongRef = useReveal();
// ...
<section ref={ourSongRef} className={`${styles.section} reveal`}>
```
Repetir para timeline, songs, artist, month.

---

## 4) `src/pages/Home.module.css` — AGREGAR reglas nuevas (no reemplazar las existentes)

```css
.hero { position: relative; overflow: hidden; }
.heartField { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.heartFloat {
  position: absolute; bottom: -30px; color: var(--accent-main); opacity: .4;
  animation: floatUpHero linear infinite;
}
.helloTag, .heroTitle, .heroRow { position: relative; z-index: 1; }

.heroAccent { display: inline-block; animation: heartbeat 1.8s ease-in-out infinite; transform-origin: center; }

.counterCard { --rot: -2deg; animation: floatCard 6s ease-in-out infinite; position: relative; }
.counterCard:hover { animation-play-state: paused; }

.twinkle {
  position: absolute; font-size: 14px; color: var(--accent-dark);
  animation: twinkle 2s ease-in-out infinite; pointer-events: none;
}

.counterNum { font-variant-numeric: tabular-nums; }

.heroQuote { --rot: 3deg; animation: wiggle 5s ease-in-out infinite; }

.ourSong { --rot: -1deg; }
.ourSong:hover { transform: rotate(0deg) translateY(-4px) scale(1.01); }
.ourSong:hover .ourSongVinyl { transform: scale(1.08); }
.ourSongVinyl { transition: transform .3s; }

.songCard { animation: floatCard 8s ease-in-out infinite; transform: rotate(var(--rot, 0deg)); }
.songCard:nth-child(2) { animation-duration: 7s; animation-delay: -2s; }
.songCard:nth-child(3) { animation-duration: 9s; animation-delay: -4s; }
.songCard:hover {
  transform: rotate(0deg) translateY(-6px) scale(1.03);
  animation-play-state: paused;
}

.songCardActive { animation: glow 2s ease-in-out infinite; }

.timelineDot { animation: popPip .5s cubic-bezier(.34,1.56,.64,1) both; }
.timelinePipReached { animation: glow 2.5s ease-in-out infinite; }
.timelineFill { transition: width 1.2s cubic-bezier(.34,1.3,.64,1); }

.artistCard { --rot: -0.8deg; animation: floatCard 10s ease-in-out infinite; transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s; }
.artistCard:hover { transform: rotate(0deg) translate(-3px,-3px) scale(1.01); }
.artistAvatar { transition: transform .3s; }
.artistCard:hover .artistAvatar { transform: scale(1.08) rotate(-6deg); }
.artistGlow { animation: glow 4s ease-in-out infinite; }

.monthCard { --rot: 1deg; animation: floatCard 7s ease-in-out infinite; }
.monthCard:hover { transform: rotate(0deg) translateY(-4px) scale(1.01); }
.monthCardActive { animation: glow 2s ease-in-out infinite; }

.fpCoverGlow { animation: glow 4s ease-in-out infinite; }

@media (max-width: 600px) {
  .songCard, .ourSong, .monthCard, .artistCard, .counterCard { animation: none; transform: none; }
}
```

---

## Resumen de lo que debe lograr la implementación:
- Welcome: tarjetas flotando + hover enderezado, twinkles de fondo, ♡ del título con heartbeat, botón con wiggle sutil.
- Home: corazones flotando en hero, count-up en meses/días, scroll-reveal en secciones, tarjetas flotando con stagger, hover enderezando, timeline con pips popPip + glow en los alcanzados, artista con avatar que rota al hover.
- NO tocar lógica de Spotify, player, auth, ni estructura de JSX más allá de agregar refs/className/hooks nuevos.
- Respetar `prefers-reduced-motion`.
