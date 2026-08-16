/**
 * ✍️ SignaturePad - Canvas 기반 터치/마우스 전자 서명 패드 모듈
 */
class SignaturePad {
  constructor(canvasId, placeholderId) {
    this.canvas = document.getElementById(canvasId);
    this.placeholder = document.getElementById(placeholderId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.hasDrawn = false;

    this.initCanvas();
    this.bindEvents();
  }

  initCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = this.canvas.getBoundingClientRect();
    
    // 캔버스 해상도 조절 (고해상도 디스플레이 대응)
    this.canvas.width = rect.width * ratio;
    this.canvas.height = rect.height * ratio;
    this.ctx.scale(ratio, ratio);

    this.ctx.strokeStyle = '#2B2D42';
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  bindEvents() {
    // Mouse Events
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    window.addEventListener('mouseup', () => this.stopDrawing());

    // Touch Events (모바일/태블릿)
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startDrawing(e.touches[0]);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.draw(e.touches[0]);
    }, { passive: false });

    window.addEventListener('touchend', () => this.stopDrawing());

    // 윈도우 리사이즈 대응
    window.addEventListener('resize', () => {
      if (!this.hasDrawn) {
        this.initCanvas();
      }
    });
  }

  getCoordinates(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  startDrawing(event) {
    this.isDrawing = true;
    const { x, y } = this.getCoordinates(event);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);

    if (this.placeholder) {
      this.placeholder.style.opacity = '0';
    }
  }

  draw(event) {
    if (!this.isDrawing) return;
    const { x, y } = this.getCoordinates(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.hasDrawn = true;
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.ctx.closePath();
    }
  }

  clear() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width * ratio, rect.height * ratio);
    this.hasDrawn = false;

    if (this.placeholder) {
      this.placeholder.style.opacity = '1';
    }
  }

  isEmpty() {
    return !this.hasDrawn;
  }

  toDataURL() {
    if (this.isEmpty()) return '';
    return this.canvas.toDataURL('image/png');
  }
}

window.SignaturePad = SignaturePad;
