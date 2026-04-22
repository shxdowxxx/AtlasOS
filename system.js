/* ============================================================
   ATLAS OS — System (boot, HUD, wallpaper, context menu)
   ============================================================ */

(() => {

  // =============================================================
  // BOOT SEQUENCE
  // =============================================================
  const BOOT_LINES = [
    { t: 0,    text: '[BIOS] Atlas Mainboard v6.66 — POST initiated...', cls: 'dim' },
    { t: 120,  text: '[BIOS] Memory test: 32768 MiB', cls: 'dim' },
    { t: 180,  text: '[BIOS] CPU: Atlas-Core @ 6.66GHz (16 threads)', cls: 'dim' },
    { t: 240,  text: '[BIOS] GPU: Crimson RTX 5090', cls: 'dim' },
    { t: 300,  text: '[BOOT] Loading atlas-midnight kernel 6.6.6...', cls: '' },
    { t: 420,  text: '[ OK ] Initializing crimson subsystems', cls: 'ok' },
    { t: 520,  text: '[ OK ] Mounting /atlas (executive clearance)', cls: 'ok' },
    { t: 640,  text: '[ OK ] Starting window_mgr daemon', cls: 'ok' },
    { t: 760,  text: '[ OK ] Starting hud_daemon', cls: 'ok' },
    { t: 860,  text: '[ OK ] Starting wallpaper_fx (canvas accelerated)', cls: 'ok' },
    { t: 980,  text: '[WARN] Unencrypted ingress detected on port 6660', cls: 'warn' },
    { t: 1080, text: '[ OK ] Crimson Net firewall engaged', cls: 'ok' },
    { t: 1180, text: '[BOOT] Running /etc/atlas/init.d/...', cls: '' },
    { t: 1280, text: '[ OK ] atlas_cmd ready', cls: 'ok' },
    { t: 1380, text: '[ OK ] nexus_browser ready', cls: 'ok' },
    { t: 1480, text: '[ OK ] sys_monitor ready', cls: 'ok' },
    { t: 1580, text: '[BOOT] Unlocking operator session: itzzzshxdow', cls: '' },
    { t: 1700, text: '[ OK ] Session unlocked. Clearance: EXECUTIVE', cls: 'ok' },
    { t: 1820, text: '[ OK ] All stations nominal.', cls: 'ok' },
    { t: 1940, text: '', cls: '' },
    { t: 2020, text: 'Initializing Midnight Shell...', cls: 'err' },
  ];

  function runBoot() {
    const logEl = document.getElementById('boot-log');
    const logoEl = document.getElementById('boot-logo');
    const bootScreen = document.getElementById('boot-screen');

    BOOT_LINES.forEach(line => {
      setTimeout(() => {
        const span = document.createElement('span');
        span.className = line.cls;
        span.textContent = line.text + '\n';
        logEl.appendChild(span);
        logEl.scrollTop = logEl.scrollHeight;
      }, line.t);
    });

    // Reveal logo near the end
    setTimeout(() => {
      logoEl.classList.add('visible');
    }, 2200);

    // Transition to desktop
    setTimeout(() => {
      bootScreen.style.transition = 'opacity 0.6s ease';
      bootScreen.style.opacity = '0';
      setTimeout(() => {
        bootScreen.remove();
        document.getElementById('desktop').classList.remove('hidden');
        AtlasBootTime = performance.now();
        initDesktop();
      }, 600);
    }, 3400);
  }

  // =============================================================
  // ATLAS GLOBAL API
  // =============================================================
  window.Atlas = {
    notify: (msg, duration = 5000) => {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `
        <div class="toast-header">
          <span>DIRECTIVE // UN-RELAY</span>
          <i class="ph ph-warning-octagon"></i>
        </div>
        <div class="toast-body">${msg}</div>
        <div class="toast-progress"></div>
      `;

      container.appendChild(toast);
      
      // Trigger animation
      setTimeout(() => toast.classList.add('visible'), 10);

      const progress = toast.querySelector('.toast-progress');
      progress.style.transition = `transform ${duration}ms linear`;
      progress.style.transform = 'scaleX(0)';

      setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 400);
      }, duration);
    }
  };

  // =============================================================
  // DESKTOP INIT
  // =============================================================
  function initDesktop() {
    // Create toast container
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    tc.className = 'toast-container';
    document.getElementById('desktop').appendChild(tc);

    initWallpaper();
    initHUD();
    initDock();
    initHub();
    initContextMenu();

    // Welcome notification
    setTimeout(() => {
      Atlas.notify("Session established. Neuro-Link connection stable.", 6000);
    }, 1500);

    // Seed with a welcome terminal
    setTimeout(() => Apps.launch('terminal'), 800);

    // Session id
    document.getElementById('hud-session').textContent =
      'ATLAS-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  // =============================================================
  // WALLPAPER — Canvas animated background
  // =============================================================
  const WALLPAPERS = ['grid', 'particles', 'blackhole'];
  let wallpaperMode = 'grid';

  function initWallpaper() {
    const canvas = document.getElementById('wallpaper');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let t = 0;

    function resize() {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      initParticles();
    }
    function initParticles() {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 25000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.5 + 0.3,
          a: Math.random() * 0.6 + 0.2,
        });
      }
    }
    window.addEventListener('resize', resize);
    resize();

    function drawGrid() {
      const w = canvas.width, h = canvas.height;
      ctx.fillStyle = 'rgba(5,5,7,1)';
      ctx.fillRect(0, 0, w, h);

      // radial red glow
      const cx = w * 0.7, cy = h * 0.35;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
      grad.addColorStop(0, 'rgba(139,0,0,0.25)');
      grad.addColorStop(0.4, 'rgba(139,0,0,0.08)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // moving grid
      const spacing = 60 * devicePixelRatio;
      const offset = (t * 0.3) % spacing;
      ctx.strokeStyle = 'rgba(255,49,49,0.06)';
      ctx.lineWidth = 1;
      for (let x = -spacing + offset; x < w + spacing; x += spacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = -spacing + offset; y < h + spacing; y += spacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Brighter intersections near focal point
      ctx.fillStyle = 'rgba(255,49,49,0.4)';
      for (let x = -spacing + offset; x < w + spacing; x += spacing) {
        for (let y = -spacing + offset; y < h + spacing; y += spacing) {
          const dx = x - cx, dy = y - cy;
          const d = Math.sqrt(dx*dx + dy*dy);
          const falloff = Math.max(0, 1 - d / (Math.max(w,h) * 0.35));
          if (falloff > 0.01) {
            ctx.globalAlpha = falloff * 0.8;
            ctx.beginPath();
            ctx.arc(x, y, 1.5 * devicePixelRatio, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    function drawParticles() {
      const w = canvas.width, h = canvas.height;
      ctx.fillStyle = 'rgba(5,5,7,1)';
      ctx.fillRect(0, 0, w, h);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.globalAlpha = p.a;
        ctx.fillStyle = '#FF3131';
        ctx.shadowColor = '#FF3131';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    function drawBlackhole() {
      const w = canvas.width, h = canvas.height;
      ctx.fillStyle = 'rgba(5,5,7,1)';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2, cy = h / 2;
      const maxR = Math.min(w, h) * 0.45;

      // Accretion rings
      for (let i = 0; i < 6; i++) {
        const r = maxR * (0.2 + i * 0.14);
        const rot = t * (0.0004 + i * 0.0002);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.scale(1, 0.35);
        const grad = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r);
        grad.addColorStop(0, 'rgba(255,49,49,0)');
        grad.addColorStop(0.7, `rgba(210,4,45,${0.25 - i*0.03})`);
        grad.addColorStop(1, 'rgba(255,49,49,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Event horizon
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.22);
      core.addColorStop(0, 'rgba(0,0,0,1)');
      core.addColorStop(0.8, 'rgba(0,0,0,1)');
      core.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }

    let fpsCount = 0, fpsLast = performance.now(), fpsValue = 0;

    function frame() {
      t++;
      if (wallpaperMode === 'grid') drawGrid();
      else if (wallpaperMode === 'particles') drawParticles();
      else if (wallpaperMode === 'blackhole') drawBlackhole();

      fpsCount++;
      const now = performance.now();
      if (now - fpsLast > 500) {
        fpsValue = Math.round((fpsCount * 1000) / (now - fpsLast));
        fpsCount = 0; fpsLast = now;
        const el = document.getElementById('hud-fps');
        if (el) el.textContent = fpsValue;
      }
      requestAnimationFrame(frame);
    }
    frame();
  }

  function cycleWallpaper() {
    const idx = WALLPAPERS.indexOf(wallpaperMode);
    wallpaperMode = WALLPAPERS[(idx + 1) % WALLPAPERS.length];
  }

  // =============================================================
  // HUD
  // =============================================================
  function initHUD() {
    const timeSimpleEl = document.getElementById('hud-time-simple');
    const timeFullEl = document.getElementById('hub-time');
    const dateFullEl = document.getElementById('hub-date');
    const memFill = document.getElementById('hub-mem-fill');
    const cpuFill = document.getElementById('hub-cpu-fill');
    const netEl = document.getElementById('hud-net');

    let mem = 42;
    let cpu = 15;
    
    function tickSlow() {
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      
      const hh = pad(now.getHours());
      const mm = pad(now.getMinutes());
      const ss = pad(now.getSeconds());
      
      if (timeSimpleEl) timeSimpleEl.textContent = `${hh}:${mm}`;
      if (timeFullEl) timeFullEl.textContent = `${hh}:${mm}:${ss}`;
      if (dateFullEl) dateFullEl.textContent = `${now.getFullYear()}.${pad(now.getMonth()+1)}.${pad(now.getDate())}`;

      mem += (Math.random() - 0.5) * 4;
      mem = Math.max(20, Math.min(85, mem));
      if (memFill) memFill.style.width = mem + '%';

      cpu += (Math.random() - 0.5) * 8;
      cpu = Math.max(5, Math.min(95, cpu));
      if (cpuFill) cpuFill.style.width = cpu + '%';

      if (netEl) netEl.textContent = Math.random() > 0.02 ? 'OK' : 'SYN';
    }
    tickSlow();
    setInterval(tickSlow, 1000);
  }

  // =============================================================
  // DOCK
  // =============================================================
  function initDock() {
    document.querySelectorAll('.dock-item[data-app]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const app = btn.dataset.app;
        if (app === 'hub') {
          toggleHub();
        } else {
          Apps.launch(app);
        }
      });
    });

    // Update running dots
    setInterval(() => {
      document.querySelectorAll('.dock-item[data-app]').forEach(btn => {
        const app = btn.dataset.app;
        if (app === 'hub') return;
        let running = false;
        for (const d of WM.state.windows.values()) {
          if (d.appKey === app) { running = true; break; }
        }
        btn.classList.toggle('active', running);
      });
    }, 400);
  }

  // =============================================================
  // ATLAS HUB
  // =============================================================
  function initHub() {
    const hub = document.getElementById('atlas-hub');
    const searchInput = document.getElementById('hub-search');
    const hubMain = hub.querySelector('.hub-main');
    
    // Create results container
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'hub-results hidden';
    hubMain.appendChild(resultsContainer);

    function showResults(html) {
      resultsContainer.innerHTML = html;
      resultsContainer.classList.remove('hidden');
      hub.querySelectorAll('.hub-tile, .hub-section-label, .hub-grid, .hub-options').forEach(el => el.classList.add('hidden'));
    }

    function hideResults() {
      resultsContainer.classList.add('hidden');
      hub.querySelectorAll('.hub-tile, .hub-section-label, .hub-grid, .hub-options').forEach(el => el.classList.remove('hidden'));
    }

    hub.querySelectorAll('.hub-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        Apps.launch(tile.dataset.app);
        hideHub();
      });
    });

    // Search functionality
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (!q) {
          hideResults();
          return;
        }

        const results = [];
        
        // 1. Search Apps
        const apps = [
          { name: 'Terminal', key: 'terminal', icon: 'ph ph-terminal-window' },
          { name: 'System Monitor', key: 'sysmonitor', icon: 'ph ph-pulse' },
          { name: 'Nexus Browser', key: 'browser', icon: 'ph ph-globe' },
          { name: 'File System', key: 'files', icon: 'ph ph-folder' },
          { name: 'Notepad', key: 'notepad', icon: 'ph ph-note-pencil' },
          { name: 'System Info', key: 'sysinfo', icon: 'ph ph-info' },
        ];
        apps.forEach(a => {
          if (a.name.toLowerCase().includes(q)) {
            results.push(`<div class="search-result" onclick="Apps.launch('${a.key}'); Atlas.hideHub()">
              <i class="${a.icon}"></i>
              <span>App: ${a.name}</span>
            </div>`);
          }
        });

        // 2. Search VFS
        if (Apps.VFS) {
          Object.entries(Apps.VFS.data).forEach(([path, entries]) => {
            entries.forEach(entry => {
              if (entry.name.toLowerCase().includes(q)) {
                const fullPath = path === '/' ? '/' + entry.name : path + '/' + entry.name;
                const icon = entry.type === 'folder' ? 'ph ph-folder' : 'ph ph-file-text';
                results.push(`<div class="search-result" onclick="Apps.launch('${entry.type === 'folder' ? 'files' : 'notepad'}', {title: '${entry.name}', content: \`${(entry.content || '').replace(/`/g, '\\`')}\`}); Atlas.hideHub()">
                  <i class="${icon}"></i>
                  <span>File: ${fullPath}</span>
                </div>`);
              }
            });
          });
        }

        // 3. Quick Actions
        const actions = [
          { name: 'Reboot System', action: () => location.reload(), icon: 'ph ph-arrow-clockwise' },
          { name: 'Change Wallpaper', action: () => cycleWallpaper(), icon: 'ph ph-image' },
          { name: 'Cycle Theme', action: () => Apps.themeCycle(), icon: 'ph ph-palette' },
        ];
        actions.forEach(a => {
          if (a.name.toLowerCase().includes(q)) {
            results.push(`<div class="search-result action" onclick="Atlas.notify('Executing: ${a.name}'); Atlas.executeAction('${a.name}')">
              <i class="${a.icon}"></i>
              <span>Action: ${a.name}</span>
            </div>`);
          }
        });

        if (results.length > 0) {
          showResults(results.join(''));
        } else {
          showResults(`<div class="search-no-results">No matches found for "${q}"</div>`);
        }
      });
    }

    // System Options
    hub.querySelectorAll('.hub-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'wallpaper') cycleWallpaper();
        if (action === 'theme-toggle') Apps.themeCycle();
        if (action === 'reboot') location.reload();
        if (action !== 'theme-toggle') hideHub();
      });
    });

    document.getElementById('hub-power').addEventListener('click', () => {
      if (confirm('Shut down Atlas OS session?')) location.reload();
    });
    
    document.addEventListener('click', (e) => {
      if (hub.classList.contains('hidden')) return;
      if (hub.contains(e.target)) return;
      if (e.target.closest('.dock-hub')) return;
      hideHub();
    });
  }

  window.Atlas.hideHub = hideHub;
  window.Atlas.executeAction = (name) => {
    if (name === 'Reboot System') location.reload();
    if (name === 'Change Wallpaper') cycleWallpaper();
    if (name === 'Cycle Theme') Apps.themeCycle();
  };
  function toggleHub() {
    const hub = document.getElementById('atlas-hub');
    hub.classList.toggle('hidden');
  }
  function hideHub() {
    document.getElementById('atlas-hub').classList.add('hidden');
  }

  // =============================================================
  // CONTEXT MENU
  // =============================================================
  function initContextMenu() {
    const menu = document.getElementById('context-menu');

    document.addEventListener('contextmenu', (e) => {
      // Only suppress/replace on desktop surfaces, not inside iframes
      if (e.target.closest('.browser-frame')) return;
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY);
    });
    document.addEventListener('click', () => hideContextMenu());

    menu.querySelectorAll('.ctx-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const a = item.dataset.action;
        hideContextMenu();
        switch (a) {
          case 'new-file':  Apps.launch('notepad'); break;
          case 'wallpaper': cycleWallpaper(); break;
          case 'sysinfo':   Apps.launch('sysinfo'); break;
          case 'terminal':  Apps.launch('terminal'); break;
          case 'reboot':    location.reload(); break;
        }
      });
    });
  }
  function showContextMenu(x, y) {
    const menu = document.getElementById('context-menu');
    menu.classList.remove('hidden');
    const vw = window.innerWidth, vh = window.innerHeight;
    const rect = menu.getBoundingClientRect();
    if (x + rect.width > vw) x = vw - rect.width - 8;
    if (y + rect.height > vh) y = vh - rect.height - 8;
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
  }
  function hideContextMenu() {
    document.getElementById('context-menu').classList.add('hidden');
  }

  // =============================================================
  // KICK OFF
  // =============================================================
  document.addEventListener('DOMContentLoaded', runBoot);

})();
