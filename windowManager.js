/* ============================================================
   ATLAS OS — Window Manager
   ============================================================ */

const WM = (() => {
  const state = {
    windows: new Map(), // id -> window descriptor
    zCounter: 100,
    focusedId: null,
    idCounter: 0,
  };

  const root = () => document.getElementById('windows-root');
  const dockRunning = () => document.getElementById('dock-running');

  function nextId() { return `win-${++state.idCounter}`; }

  function getBounds() {
    const r = root().getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  function create({ title, icon = 'ph ph-app-window', width = 640, height = 440, x, y, content, onMount, appKey }) {
    const id = nextId();
    const bounds = getBounds();
    if (x == null) x = Math.max(20, Math.round((bounds.w - width) / 2 + (Math.random() * 80 - 40)));
    if (y == null) y = Math.max(10, Math.round((bounds.h - height) / 2 - 40 + (Math.random() * 60 - 30)));

    const el = document.createElement('div');
    el.className = 'window';
    el.dataset.id = id;
    el.style.width = width + 'px';
    el.style.height = height + 'px';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.zIndex = ++state.zCounter;

    el.innerHTML = `
      <div class="window-titlebar">
        <i class="window-icon ${icon}"></i>
        <div class="window-title">${title}</div>
        <div class="window-controls">
          <button class="win-btn min" title="Minimize"><i class="ph ph-minus"></i></button>
          <button class="win-btn max" title="Maximize"><i class="ph ph-square"></i></button>
          <button class="win-btn close" title="Close"><i class="ph ph-x"></i></button>
        </div>
      </div>
      <div class="window-body"></div>
      <div class="resize-handle resize-n"></div>
      <div class="resize-handle resize-s"></div>
      <div class="resize-handle resize-e"></div>
      <div class="resize-handle resize-w"></div>
      <div class="resize-handle resize-ne"></div>
      <div class="resize-handle resize-nw"></div>
      <div class="resize-handle resize-se"></div>
      <div class="resize-handle resize-sw"></div>
    `;

    const body = el.querySelector('.window-body');
    if (typeof content === 'string') body.innerHTML = content;
    else if (content instanceof Node) body.appendChild(content);

    root().appendChild(el);

    const desc = { id, el, title, icon, appKey, minimized: false, maximized: false, prevRect: null };
    state.windows.set(id, desc);

    // Spawn animation
    requestAnimationFrame(() => el.classList.add('spawned'));

    // Focus on click
    el.addEventListener('mousedown', () => focus(id), true);

    // Dragging
    const titlebar = el.querySelector('.window-titlebar');
    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.window-controls')) return;
      if (desc.maximized) return;
      startDrag(desc, e);
    });
    titlebar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.window-controls')) return;
      toggleMaximize(id);
    });

    // Controls
    el.querySelector('.win-btn.min').addEventListener('click', (e) => { e.stopPropagation(); minimize(id); });
    el.querySelector('.win-btn.max').addEventListener('click', (e) => { e.stopPropagation(); toggleMaximize(id); });
    el.querySelector('.win-btn.close').addEventListener('click', (e) => { e.stopPropagation(); close(id); });

    // Resize handles
    el.querySelectorAll('.resize-handle').forEach((h) => {
      h.addEventListener('mousedown', (e) => {
        if (desc.maximized) return;
        const dir = [...h.classList].find(c => c.startsWith('resize-') && c !== 'resize-handle').replace('resize-', '');
        startResize(desc, e, dir);
      });
    });

    focus(id);
    addDockRunning(desc);
    if (typeof onMount === 'function') onMount(body, desc);
    return desc;
  }

  function focus(id) {
    const desc = state.windows.get(id);
    if (!desc) return;
    if (desc.minimized) restore(id);
    desc.el.style.zIndex = ++state.zCounter;
    for (const d of state.windows.values()) d.el.classList.toggle('focused', d.id === id);
    state.focusedId = id;
  }

  function startDrag(desc, e) {
    const el = desc.el;
    const startX = e.clientX, startY = e.clientY;
    const startLeft = parseInt(el.style.left, 10);
    const startTop = parseInt(el.style.top, 10);
    el.classList.add('dragging');
    el.style.transition = 'none';

    function onMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    }
    function onUp(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      el.style.transform = '';
      let newLeft = startLeft + dx;
      let newTop  = Math.max(32, startTop + dy); // don't go above HUD
      // Edge snap — within 24px of viewport edge
      const SNAP = 24;
      const vw = window.innerWidth;
      const winW = parseInt(el.style.width, 10) || el.offsetWidth;
      if (newLeft < SNAP) newLeft = 0;
      if (newLeft + winW > vw - SNAP) newLeft = vw - winW;
      el.style.left = newLeft + 'px';
      el.style.top  = newTop + 'px';
      el.style.transition = '';
      el.classList.remove('dragging');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function startResize(desc, e, dir) {
    const el = desc.el;
    const startX = e.clientX, startY = e.clientY;
    const r = el.getBoundingClientRect();
    const rootR = root().getBoundingClientRect();
    const startW = r.width, startH = r.height;
    const startLeft = r.left - rootR.left;
    const startTop = r.top - rootR.top;
    el.style.transition = 'none';

    function onMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let nw = startW, nh = startH, nl = startLeft, nt = startTop;
      if (dir.includes('e')) nw = Math.max(320, startW + dx);
      if (dir.includes('s')) nh = Math.max(200, startH + dy);
      if (dir.includes('w')) { nw = Math.max(320, startW - dx); nl = startLeft + (startW - nw); }
      if (dir.includes('n')) { nh = Math.max(200, startH - dy); nt = startTop + (startH - nh); }
      el.style.width = nw + 'px';
      el.style.height = nh + 'px';
      el.style.left = nl + 'px';
      el.style.top = nt + 'px';
    }
    function onUp() {
      el.style.transition = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    e.preventDefault();
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function minimize(id) {
    const desc = state.windows.get(id);
    if (!desc || desc.minimized) return;
    desc.minimized = true;
    const el = desc.el;
    const r = el.getBoundingClientRect();
    // Animate toward bottom-center (taskbar)
    const tx = (window.innerWidth / 2) - (r.left + r.width / 2);
    const ty = window.innerHeight - r.top;
    el.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.4,0,1,1)';
    el.style.transformOrigin = 'center bottom';
    el.style.transform = `translate(${tx}px, ${ty}px) scale(0.3)`;
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
    setTimeout(() => {
      if (desc.minimized) {
        el.style.display = 'none';
        el.style.transform = '';
        el.style.opacity = '';
        el.style.transition = '';
        el.style.pointerEvents = '';
      }
    }, 360);
    if (state.focusedId === id) state.focusedId = null;
  }

  function restore(id) {
    const desc = state.windows.get(id);
    if (!desc) return;
    desc.minimized = false;
    desc.el.style.display = '';
    desc.el.style.transform = '';
    desc.el.style.opacity = '';
    desc.el.style.transition = '';
    desc.el.style.pointerEvents = '';
    desc.el.classList.remove('minimizing');
    requestAnimationFrame(() => {
      desc.el.style.transition = 'opacity 0.25s ease, transform 0.3s var(--ease-snap, cubic-bezier(0.2,0.9,0.3,1.2))';
      desc.el.style.opacity = '1';
      desc.el.style.transform = 'scale(1) translateY(0)';
      setTimeout(() => {
        desc.el.style.transition = '';
        desc.el.style.transform = '';
      }, 300);
    });
  }

  function toggleMaximize(id) {
    const desc = state.windows.get(id);
    if (!desc) return;
    const el = desc.el;
    if (!desc.maximized) {
      desc.prevRect = {
        left: el.style.left, top: el.style.top,
        width: el.style.width, height: el.style.height,
      };
      el.classList.add('maximized');
      el.style.left = '0px';
      el.style.top = '32px';          // clear the 32px HUD
      el.style.width = '100%';
      el.style.height = 'calc(100% - 32px)';
      desc.maximized = true;
    } else {
      el.classList.remove('maximized');
      Object.assign(el.style, desc.prevRect);
      desc.maximized = false;
    }
  }

  function close(id) {
    const desc = state.windows.get(id);
    if (!desc) return;
    desc.el.classList.add('closing');
    removeDockRunning(desc);
    setTimeout(() => {
      desc.el.remove();
      state.windows.delete(id);
    }, 240);
  }

  function addDockRunning(desc) {
    const existing = dockRunning().querySelector(`[data-win-id="${desc.id}"]`);
    if (existing) return;
    const btn = document.createElement('button');
    btn.className = 'dock-item';
    btn.dataset.winId = desc.id;
    btn.title = desc.title;
    btn.innerHTML = `<i class="${desc.icon}"></i>`;
    btn.addEventListener('click', () => {
      const d = state.windows.get(desc.id);
      if (!d) return;
      if (d.minimized) { restore(desc.id); focus(desc.id); }
      else if (state.focusedId === desc.id) minimize(desc.id);
      else focus(desc.id);
    });
    dockRunning().appendChild(btn);
  }
  function removeDockRunning(desc) {
    const btn = dockRunning().querySelector(`[data-win-id="${desc.id}"]`);
    if (btn) btn.remove();
  }

  return { create, focus, minimize, close, toggleMaximize, state };
})();
