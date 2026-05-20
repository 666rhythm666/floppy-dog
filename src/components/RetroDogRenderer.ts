import { PlayerCustomization } from '../types';

/**
 * Procedurially renders a beautiful, highly polished 2D dog on a canvas.
 * Assumes the dog's bounding box is (x, y) to (x + width, y + height).
 * Uses robust translation of bottom-center for neat grounding and scaling.
 */
export function drawDog(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  velX: number,
  velY: number,
  onGround: boolean,
  facing: 'left' | 'right',
  animationTick: number,
  custom: PlayerCustomization,
  powerup?: 'chili' | 'balloon' | 'star' | null
) {
  ctx.save();

  // Determine center-bottom of the dog
  const cx = x + width / 2;
  const cy = y + height;

  // Move origin to center-bottom of the dog
  ctx.translate(cx, cy);

  // Inflate balloon-puff floaty size!
  if (powerup === 'balloon') {
    ctx.scale(1.28, 1.28);
  }

  // If facing left, flip horizontally
  if (facing === 'left') {
    ctx.scale(-1, 1);
  }

  // --- ANIMATION VARIABLES ---
  const isRunning = Math.abs(velX) > 0.1 && onGround;
  const legCycle = isRunning ? Math.sin(animationTick * 0.2) : 0;
  const tailCycle = isRunning 
    ? Math.sin(animationTick * 0.45) 
    : Math.sin(animationTick * 0.08); // idle slow wagging

  // Calculate ear floppiness based on physics!
  // If moving up (velY < 0 in canvas), ears are dragged down. If falling (velY > 0), ears fly up.
  // We also add inertia and slight running bounce.
  const earLagX = -velX * 0.6;
  const earFlopY = Math.max(-12, Math.min(10, velY * 0.8));
  // Warm breathing cycle when idle
  const breatheY = onGround ? Math.sin(animationTick * 0.05) * 0.5 : 0;

  // --- 1. THE TAIL (Wagging behind, drawn first so it sits behind the body) ---
  ctx.save();
  ctx.translate(-14, -14 + breatheY);
  ctx.rotate(-0.3 + (tailCycle * 0.4) - (velY * 0.05));
  
  // Tail outline/fill (thick fluffy white tail)
  ctx.beginPath();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#d1d5db';
  ctx.fillStyle = custom.bodyColor;
  
  // Custom spot on tail tailtip!
  if (custom.spotted) {
    ctx.fillStyle = '#b45309'; // brown spot
  }

  // Draw tail curve
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-10, -5, -16, -2);
  ctx.quadraticCurveTo(-10, 5, 0, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // --- 2. BACK LEGS (Drawn behind the body) ---
  // Leg positions cycle when running
  ctx.fillStyle = '#e5e7eb'; // slightly darker shading for back side legs
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 1.5;

  // Back-Rear Leg
  ctx.save();
  ctx.translate(-8, 0);
  if (isRunning) {
    ctx.rotate(legCycle * 0.4);
  }
  ctx.beginPath();
  ctx.roundRect(-4, -6, 7, 7, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Back-Front Leg
  ctx.save();
  ctx.translate(6, 0);
  if (isRunning) {
    ctx.rotate(-legCycle * 0.4);
  }
  ctx.beginPath();
  ctx.roundRect(-3, -6, 6, 7, 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // --- 3. THE BODY (White fluffy marshmallow shape) ---
  ctx.strokeStyle = '#d1d5db';
  ctx.fillStyle = custom.bodyColor;
  ctx.lineWidth = 1.5;
  
  ctx.beginPath();
  // Draw an elegant rounded torso
  ctx.roundRect(-16, -20 + breatheY, 24, 15, 7);
  ctx.fill();
  ctx.stroke();

  // Add brown/spotted patches if enabled!
  if (custom.spotted) {
    ctx.fillStyle = '#b45309'; // Warm brown beagle spot
    ctx.beginPath();
    // A cute round patch on the back
    ctx.arc(-4, -15 + breatheY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(-10, -11 + breatheY, 4, 0, Math.PI * 2);
    ctx.fill();
    // restore the white fill context
    ctx.fillStyle = custom.bodyColor;
  }

  // --- 4. FORE LEGS (Drawn in front of the body) ---
  ctx.fillStyle = custom.bodyColor;
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 1.5;

  // Front-Rear leg
  ctx.save();
  ctx.translate(-10, 0);
  if (isRunning) {
    ctx.rotate(-legCycle * 0.4);
  }
  ctx.beginPath();
  ctx.roundRect(-3, -6, 7, 7, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Front-Front leg
  ctx.save();
  ctx.translate(4, 0);
  if (isRunning) {
    ctx.rotate(legCycle * 0.4);
  }
  ctx.beginPath();
  ctx.roundRect(-3, -6, 6, 7, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // --- 5. THE HEAD & NECK ---
  ctx.save();
  // Animate head slightly with running bounce
  const headBounceY = isRunning ? Math.cos(animationTick * 0.4) * 0.7 : breatheY;
  ctx.translate(6, -17 + headBounceY);

  // Draw neck bridge
  ctx.strokeStyle = '#d1d5db';
  ctx.fillStyle = custom.bodyColor;
  ctx.beginPath();
  ctx.moveTo(-6, 2);
  ctx.lineTo(-1, -6);
  ctx.lineTo(4, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw Head circle
  ctx.beginPath();
  ctx.arc(3, -9, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cute white muzzle extending forward to the right
  ctx.beginPath();
  ctx.ellipse(7, -8, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // --- 6. BLACK NOSE (Specified exactly in requirements) ---
  ctx.fillStyle = custom.noseColor;
  ctx.beginPath();
  ctx.arc(10.5, -9, 2.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose shine
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(9.8, -10, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // --- 7. THE EYE (Blinks periodically!) ---
  const isBlinking = Math.floor(animationTick / 60) % 3 === 0 && (animationTick % 10 < 3);
  ctx.fillStyle = '#1e293b'; // dark slate slate-cool eye
  
  ctx.beginPath();
  if (isBlinking) {
    // Drawn as a closed blinking arc line
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.2;
    ctx.moveTo(1, -11);
    ctx.lineTo(4, -11);
    ctx.stroke();
  } else {
    // Shiny open eye
    ctx.arc(2.5, -11, 1.3, 0, Math.PI * 2);
    ctx.fill();
    // Catch-light sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(2.1, -11.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- 8. FLOPPY EARS (Specified exactly: floppy ears!) ---
  // Beautiful dark floppy ears that dangle and swing.
  ctx.save();
  // Ear attachment point: slightly top left on head
  ctx.translate(-1.5, -13);

  // Rotate ear based on physics + animations
  const baseRotation = 0.15; // hangs down slightly diagonal
  const windRotation = -velX * 0.05;
  const swingInertia = (earFlopY * 0.07);
  ctx.rotate(baseRotation + windRotation + swingInertia + (Math.sin(animationTick * 0.04) * 0.02));

  // Determine ear coloring
  let earFill = '#2d3748'; // charcoal default floppy
  let earStroke = '#1a202c';
  switch (custom.earColor) {
    case 'brown':
      earFill = '#854d0e';
      earStroke = '#713f12';
      break;
    case 'gray':
      earFill = '#6b7280';
      earStroke = '#4b5563';
      break;
    case 'white':
      earFill = '#ffffff';
      earStroke = '#d1d5db';
      break;
    case 'black':
    default:
      earFill = '#0f172a';
      earStroke = '#020617';
      break;
  }

  // Draw the floppy ear path (long beautiful droplet shape hanging down)
  ctx.fillStyle = earFill;
  ctx.strokeStyle = earStroke;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-1, 0);
  ctx.bezierCurveTo(-5, 6, -6, 12, -2, 15); // floppy bulbous bottom
  ctx.bezierCurveTo(1.5, 17, 3, 11, 2, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cute pink inner ear detailing
  ctx.fillStyle = '#fda4af'; // warm soft rose pink
  ctx.beginPath();
  ctx.moveTo(-0.5, 2);
  ctx.bezierCurveTo(-2.5, 6, -3, 11, -1, 13);
  ctx.bezierCurveTo(1, 14, 1.5, 10, 1, 4);
  ctx.closePath();
  ctx.fill();

  ctx.restore(); // restore ear context

  // --- 9. COSMETICS: COLLAR & SCARF ---
  ctx.save();
  // Collar position is at base of neck: relative coords roughly in (-1, -1) to (3, 3)
  if (custom.collar === 'red_collar') {
    ctx.strokeStyle = '#e11d48'; // bright cherry red
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(4, -3);
    ctx.stroke();
    
    // Hanging collar medallion
    ctx.fillStyle = '#fbbf24'; // gold circle tag
    ctx.beginPath();
    ctx.arc(1.5, -1, 1.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (custom.collar === 'gold_bell') {
    ctx.strokeStyle = '#db2777'; // pink ribbon
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-2, 1);
    ctx.lineTo(3.5, -2);
    ctx.stroke();

    // Golden cross-etched retro bell!
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(1.5, 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Inner clapper dot
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(1.5, 2.2, 0.7, 0, Math.PI * 2);
    ctx.fill();
  } else if (custom.collar === 'scarf') {
    // Big winter cozy striped scarf wrapped around!
    ctx.fillStyle = '#dc2626'; // Red stripes
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(-2.5, -2, 7.5, 5, 2);
    ctx.fill();
    
    // Tail of the scarf fluttering behind
    ctx.save();
    ctx.translate(-2, 1);
    ctx.rotate(0.3 + Math.sin(animationTick * 0.15) * 0.1 - velX * 0.05);
    ctx.fillStyle = '#ffffff'; // White striped secondary segment
    ctx.fillRect(0, 0, -6, 2.5);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-2, 0, -2, 2.5); // stripe
    ctx.restore();
  }
  ctx.restore();

  // --- 10. COSMETICS: HATS (Sitting proudly on head!) ---
  if (custom.hat !== 'none') {
    ctx.save();
    // Move to top crown of head
    ctx.translate(2.5, -17);
    
    // Rotate hat slightly based on jump inertial push
    ctx.rotate(velX * 0.03 - (velY * 0.02));

    switch (custom.hat) {
      case 'detective': // Sherlock Tweed brown cap
        // Cap base
        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 7.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Dome
        ctx.beginPath();
        ctx.arc(0, -1, 4.5, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Cap visor extending right
        ctx.fillStyle = '#451a03';
        ctx.fillRect(4, -1, 4.5, 1.2);
        break;

      case 'party': // Colorful pom-pom party cone!
        const hue = (animationTick * 3) % 360;
        ctx.fillStyle = `hsl(${hue}, 85%, 60%)`; // color cycle party cone!
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(0, -10);
        ctx.lineTo(4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Pom-pom fluffy tip
        ctx.fillStyle = '#fdba74';
        ctx.beginPath();
        ctx.arc(0, -10, 1.8, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'tophat': // Satin elegant tall black top hat
        ctx.fillStyle = '#0f172a'; // dark black
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        // Brim
        ctx.beginPath();
        ctx.roundRect(-6.5, -0.8, 13, 1.8, 0.5);
        ctx.fill();
        ctx.stroke();
        // Hat body
        ctx.beginPath();
        ctx.roundRect(-4.2, -8, 8.4, 7.5, 0.2);
        ctx.fill();
        ctx.stroke();
        // Satin red ribbon band
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-4.1, -2.5, 8.2, 1.7);
        break;

      case 'crown': // Golden high shiny crown
        // Base shape
        ctx.fillStyle = '#fbbf24'; // shiny gold
        ctx.strokeStyle = '#b45309'; // dark bronze outline
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-5, 1);
        ctx.lineTo(-5.5, -4);
        ctx.lineTo(-2.5, -1.8);
        ctx.lineTo(0, -6); // middle tall peak
        ctx.lineTo(2.5, -1.8);
        ctx.lineTo(5.5, -4);
        ctx.lineTo(5, 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Tiny ruby beads on top peaks
        ctx.fillStyle = '#ef4444'; // ruby red sparkles
        ctx.beginPath();
        ctx.arc(-5.5, -4, 0.8, 0, Math.PI * 2);
        ctx.arc(0, -6, 1, 0, Math.PI * 2);
        ctx.arc(5.5, -4, 0.8, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'flower': // Elegant spring blossom behind ear
        ctx.fillStyle = '#e9d5ff'; // light lavender petals
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 0.8;
        
        // 5 cute round petals
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          const px = Math.cos(angle) * 2.8;
          const py = Math.sin(angle) * 2.8;
          ctx.beginPath();
          ctx.arc(px, py - 1, 1.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        // Golden yellow pollen center
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, -1, 1.2, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  ctx.restore(); // restore head context

  // --- POWERUP DECORATIONS ---
  if (powerup === 'chili') {
    // Draw cute flame shoes under its paws!
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(-8, 1, 3.5 + Math.sin(animationTick * 0.3) * 1.5, 0, Math.PI * 2);
    ctx.arc(4, 1, 3.5 + Math.cos(animationTick * 0.3) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Warm spicy puff from nose
    ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.beginPath();
    ctx.arc(14 + Math.sin(animationTick * 0.25) * 2, -9, 2.5 + Math.cos(animationTick * 0.25) * 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (powerup === 'star') {
    // Elegant floating glowing crown / halo above its head
    const hue = (animationTick * 5) % 360;
    ctx.strokeStyle = `hsla(${hue}, 90%, 60%, 0.8)`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, -25, 11, 3.2, -0.05, 0, Math.PI * 2);
    ctx.stroke();
    
    // Small tiny orbiting stars
    const ox = Math.cos(animationTick * 0.08) * 11;
    const oy = Math.sin(animationTick * 0.08) * 3.2 - 25;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (powerup === 'balloon') {
    // Waving balloon string tied onto its collar
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.quadraticCurveTo(-12, -18 + Math.sin(animationTick * 0.1) * 3, -18, -26);
    ctx.stroke();
    
    // The visual balloon itself
    ctx.fillStyle = '#ef4444'; // bright red
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(-18, -32, 5, 7, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore(); // restore global center bottom context
}
