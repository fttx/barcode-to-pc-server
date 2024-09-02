function showConfettiAndMessage(text) {
  // Create a canvas element for the confetti
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.zIndex = '999'; // Ensure it's behind the message

  // Create the message element
  const message = document.createElement('div');
  message.textContent = text;
  message.style.position = 'fixed';
  message.style.top = '50%';
  message.style.left = '50%';
  message.style.transform = 'translate(-50%, -50%)';
  message.style.fontSize = '4em';
  message.style.fontWeight = 'bold';
  message.style.fontFamily = 'Arial, sans-serif';
  message.style.color = '#000'; // Bright yellow color
  message.style.textAlign = 'center';
  message.style.zIndex = '1000'; // Ensure it's on top
  message.style.opacity = '1';
  message.style.transition = 'opacity 2s ease-out';
  message.style.webkitTextStroke = '1px black'; // Black outline
  document.body.appendChild(message);

  // Confetti settings
  const ctx = canvas.getContext('2d');
  const confettiCount = 150;
  const confettiColors = ['#FF0A47', '#FF0AC6', '#47FF0A', '#0AC6FF', '#FF8C0A', '#FFD700'];
  const confetti = Array.from({ length: confettiCount }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 6 + 2,
    d: Math.random() * confettiCount,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    tilt: Math.random() * 10 - 10,
    opacity: 1,
  }));

  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach((c) => {
      ctx.globalAlpha = c.opacity; // Set opacity for fade-out
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2, false);
      ctx.fillStyle = c.color;
      ctx.fill();
    });
    updateConfetti();
  }

  function updateConfetti() {
    confetti.forEach((c, i) => {
      c.y += Math.cos(c.d) + 1 + c.r / 2;
      c.x += Math.sin(c.d);
      if (c.x > canvas.width + 5 || c.x < -5 || c.y > canvas.height) {
        confetti[i] = {
          x: Math.random() * canvas.width,
          y: -10,
          r: c.r,
          d: c.d,
          color: c.color,
          tilt: c.tilt,
          opacity: 1,
        };
      }

      // Continue moving confetti and fade them out gradually
      if (animationFrameCount > 500) {
        c.opacity -= 0.002; // Gradually decrease opacity while moving
      }
    });
  }

  let animationFrameCount = 0;

  function animateConfetti() {
    drawConfetti();
    animationFrameCount++;

    if (animationFrameCount < 600) { // Run animation for 10 seconds at 60fps
      requestAnimationFrame(animateConfetti);
    } else {
      // Remove elements after fade-out
      setTimeout(() => {
        document.body.removeChild(canvas);
        document.body.removeChild(message);
      }, 200); // Allow 2 seconds for fade-out
    }
  }

  // Start confetti animation
  animateConfetti();

  // Start fade-out for message after 8 seconds
  setTimeout(() => {
    message.style.opacity = '0';
  }, 8000); // Fade out message after 8 seconds


  const audio = new Audio('assets/audio/confetti_v2_free.ogg');
  audio.play();
}

window.confetti_v2 = showConfettiAndMessage;
