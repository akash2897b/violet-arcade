(() => {
  const style = document.createElement('style');
  style.textContent = "@media (pointer: coarse), (max-width: 680px) { .game-stage { overflow-y: auto; overscroll-behavior: contain; padding: 10px 8px 12px; gap: 8px; } .game-stage canvas { max-width: 100%; touch-action: none; } .touch-pad { grid-template-columns: repeat(3, minmax(56px, 64px)); grid-template-rows: repeat(2, minmax(54px, 62px)); gap: 8px; margin: 12px auto 4px; } .touch-pad button { min-width: 54px; min-height: 54px; border-radius: 14px; border-color: rgba(220,193,255,.32); background: linear-gradient(145deg, rgba(166,107,255,.25), rgba(80,48,116,.42)); color: #fff; font-size: 20px; font-weight: 700; touch-action: none; user-select: none; -webkit-tap-highlight-color: transparent; } .touch-pad button:active { transform: scale(.94); border-color: #7cf5d1; background: rgba(124,245,209,.22); } .pong-touch-pad { grid-template-columns: repeat(2, minmax(88px, 112px)); grid-template-rows: 58px; } .memory-board { width: min(100%, 340px); grid-template-columns: repeat(4, minmax(0, 1fr)); gap: clamp(6px, 2vw, 10px); } .memory-card { min-width: 44px; min-height: 44px; font-size: clamp(20px, 6vw, 26px); touch-action: manipulation; -webkit-tap-highlight-color: transparent; } .tile-board { width: min(100%, 340px); aspect-ratio: 1; box-sizing: border-box; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-template-rows: repeat(4, minmax(0, 1fr)); touch-action: none; } .tile-cell { min-width: 0; min-height: 0; font-size: clamp(16px, 5vw, 22px); } .reaction-board { width: min(100%, 510px); height: clamp(280px, 52dvh, 430px); touch-action: manipulation; } .reaction-target { width: 76px; height: 76px; min-width: 44px; min-height: 44px; touch-action: manipulation; -webkit-tap-highlight-color: transparent; } } @media (max-width: 380px) { .touch-pad { grid-template-columns: repeat(3, 54px); grid-template-rows: repeat(2, 52px); gap: 6px; } .pong-touch-pad { grid-template-columns: repeat(2, minmax(82px, 1fr)); grid-template-rows: 56px; } }";
  document.head.append(style);
  const sendKey = (key, type) => document.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, cancelable: true }));
  const directions = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
  function addSwipe(surface) {
    if (!surface || surface.dataset.touchSwipeReady) return;
    surface.dataset.touchSwipeReady = 'true'; surface.style.touchAction = 'none';
    let start = null;
    surface.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse') return;
      start = { x: event.clientX, y: event.clientY, id: event.pointerId };
      if (surface.setPointerCapture) surface.setPointerCapture(event.pointerId);
      event.preventDefault();
    }, { passive: false });
    surface.addEventListener('pointerup', event => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y; start = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
      const key = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? directions.right : directions.left) : (dy > 0 ? directions.down : directions.up);
      sendKey(key, 'keydown'); sendKey(key, 'keyup'); event.preventDefault();
    }, { passive: false });
    surface.addEventListener('pointercancel', () => { start = null; });
  }
  function addPongPad(stage) {
    if (stage.querySelector('.pong-touch-pad')) return;
    const pad = document.createElement('div'); pad.className = 'touch-pad pong-touch-pad'; pad.setAttribute('role', 'group'); pad.setAttribute('aria-label', 'Pong paddle touch controls');
    [['ArrowUp', '↑', 'Move paddle up'], ['ArrowDown', '↓', 'Move paddle down']].forEach(([key, symbol, label]) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = symbol; button.setAttribute('aria-label', label);
      let pointerActive = false;
      button.addEventListener('pointerdown', event => { pointerActive = true; event.preventDefault(); sendKey(key, 'keydown'); if (button.setPointerCapture) button.setPointerCapture(event.pointerId); }, { passive: false });
      const release = () => { if (pointerActive) { pointerActive = false; sendKey(key, 'keyup'); } };
      button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
      button.addEventListener('click', event => { if (event.detail === 0) { sendKey(key, 'keydown'); sendKey(key, 'keyup'); } }); pad.append(button);
    });
    stage.append(pad);
  }
  const gameOverlay = document.querySelector('#gameOverlay');
  function enhanceOpenGame() {
    if (!gameOverlay || !gameOverlay.classList.contains('open')) return;
    const stage = document.querySelector('#gameStage'), title = document.querySelector('#gameTitle')?.textContent.trim();
    if (!stage) return;
    const snake = stage.querySelector('#snakeCanvas'), board2048 = stage.querySelector('.tile-board'), pong = stage.querySelector('.canvas-pong');
    if (snake) addSwipe(snake); if (board2048) addSwipe(board2048); if (pong) addPongPad(stage);
    const note = document.querySelector('#controlNote');
    const touchNotes = { 'Neon Snake': ' On touchscreens: swipe on the playfield or use the large arrow pad.', 'Afterglow Pong': ' On touchscreens: press and hold the large arrows to move your paddle.', 'Memory Matrix': ' On touchscreens: tap any two cards to find each pair.', 'Reaction Rush': ' On touchscreens: tap the glowing target as it moves.', 'Violet 2048': ' On touchscreens: swipe the board or use the large arrow pad.' };
    if (note && touchNotes[title] && note.dataset.touchNote !== title) { note.textContent += touchNotes[title]; note.dataset.touchNote = title; }
  }
  if (gameOverlay) new MutationObserver(enhanceOpenGame).observe(gameOverlay, { attributes: true, childList: true, subtree: true });
})();
