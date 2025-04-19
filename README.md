# React + Vite

```js
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>InkSpire</title>
  <style>
    html, body {
      margin: 0;
      height: 100%;
      overflow: hidden;
      background: #fff;
    }
    canvas {
      display: block;
      cursor: crosshair;
    }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>

  <script src="https://cdn.jsdelivr.net/npm/roughjs@4.5.1/bundled/rough.min.js"></script>
    <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const roughCanvas = rough.canvas(canvas);

    let drawing = false;
    let lastX = 0, lastY = 0;
    let lastTime = 0;
    let mouseSpeed = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
        lastTime = performance.now();
        drawDot(lastX, lastY);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!drawing) return;

        const now = performance.now();
        const newX = e.offsetX;
        const newY = e.offsetY;

        const dx = newX - lastX;
        const dy = newY - lastY;
        const dist = Math.hypot(dx, dy);
        const dt = now - lastTime || 1; 

        mouseSpeed = dist / dt; 

        const step = 1;
        for (let i = 0; i < dist; i += step) {
        const x = lastX + (dx * i) / dist;
        const y = lastY + (dy * i) / dist;
        drawDot(x, y);
        }

        lastX = newX;
        lastY = newY;
        lastTime = now;

        // console.log('Speed:', mouseSpeed.toFixed(2), 'px/ms');
    });

    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mouseleave', () => drawing = false);

    function drawDot(x, y) {
        roughCanvas.circle(x, y, 2.5, {
        stroke: 'black',
        strokeWidth: 1.2 * mouseSpeed.toFixed(2),
        fill: 'black',
        fillStyle: 'solid'
        });
    }
    </script>
</body>
</html>
```
