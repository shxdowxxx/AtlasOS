/* ============================================================
   ATLAS OS — Applications
   ============================================================ */

const Apps = (() => {

  // ---------- Utility ----------
  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') n.className = v;
      else if (k === 'style') n.style.cssText = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'html') n.innerHTML = v;
      else n.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null) return;
      if (typeof c === 'string') n.appendChild(document.createTextNode(c));
      else n.appendChild(c);
    });
    return n;
  }

  // =============================================================
  // TERMINAL — Atlas_CMD
  // =============================================================
  const TERMINAL_LORE = {
    banner: [
      { text: 'ATLAS_CMD v1.0.0 — Midnight Shell', cls: 'accent' },
      { text: '(c) TheSizCorporation // All stations nominal.', cls: 'sys' },
      { text: 'Type "help" for a list of available commands.', cls: 'sys' },
      { text: '' },
    ],
  };

  function openTerminal() {
    const host = el('div', { class: 'app-terminal' });
    const history = [];
    let histIdx = 0;

    function write(text, cls = '') {
      const line = el('div', { class: 'term-line' + (cls ? ' ' + cls : '') });
      line.textContent = text;
      host.insertBefore(line, inputLine);
      host.scrollTop = host.scrollHeight;
    }
    function writeHTML(html) {
      const line = el('div', { class: 'term-line', html });
      host.insertBefore(line, inputLine);
      host.scrollTop = host.scrollHeight;
    }

    const input = el('input', { class: 'term-input', spellcheck: 'false', autocomplete: 'off' });
    const inputLine = el('div', { class: 'term-input-line' }, [
      el('span', { class: 'term-prompt' }, 'operator@atlas:~$'),
      input,
    ]);

    TERMINAL_LORE.banner.forEach(b => {
      const line = el('div', { class: 'term-line' + (b.cls ? ' ' + b.cls : '') });
      line.textContent = b.text || ' ';
      host.appendChild(line);
    });
    host.appendChild(inputLine);

    const COMMANDS = {
      help: () => {
        writeHTML(`<span class="accent">Available commands:</span>`);
        const rows = [
          ['help',     'List all commands'],
          ['clear',    'Clear the terminal buffer'],
          ['echo',     'Print arguments to stdout'],
          ['whoami',   'Print the active session user'],
          ['neofetch', 'Display system summary with ATLAS art'],
          ['theme',    'Toggle red accent intensity (low|mid|high)'],
          ['date',     'Print current system date/time'],
          ['ls',       'List virtual file system'],
          ['cat',      'Show contents of a virtual file'],
          ['reboot',   'Restart Atlas OS'],
        ];
        rows.forEach(([k, v]) => writeHTML(`  <span style="color:var(--red-neon)">${k.padEnd(10)}</span> <span style="color:var(--text-secondary)">${v}</span>`));
      },
      clear: () => {
        [...host.querySelectorAll('.term-line')].forEach(n => n.remove());
      },
      echo: (args) => write(args.join(' ')),
      whoami: () => write('operator@atlas // clearance: EXECUTIVE', 'accent'),
      date: () => write(new Date().toString(), 'sys'),
      ls: () => {
        writeHTML(`<span style="color:#fbbf24">Documents/</span>  <span style="color:#fbbf24">System/</span>  <span style="color:#fbbf24">Logs/</span>  <span style="color:var(--text-primary)">ReadMe.txt</span>  <span style="color:var(--text-primary)">manifest.atlas</span>`);
      },
      cat: (args) => {
        const file = args[0];
        if (!file) return write('cat: missing filename', 'err');
        if (file === 'ReadMe.txt') {
          write(AtlasLore.readme, 'sys');
        } else if (file === 'manifest.atlas') {
          write('ATLAS // Midnight Shell // Operator: itzzzshxdow', 'accent');
        } else {
          write(`cat: ${file}: No such file`, 'err');
        }
      },
      reboot: () => {
        write('Initiating reboot sequence...', 'err');
        setTimeout(() => location.reload(), 800);
      },
      theme: (args) => {
        const mode = args[0];
        const root = document.documentElement;
        if (mode === 'low') {
          root.style.setProperty('--red-neon', '#8B0000');
          root.style.setProperty('--red-glow', 'rgba(139,0,0,0.3)');
          write('Theme set to LOW intensity.', 'sys');
        } else if (mode === 'mid') {
          root.style.setProperty('--red-neon', '#D2042D');
          root.style.setProperty('--red-glow', 'rgba(210,4,45,0.4)');
          write('Theme set to MID intensity.', 'sys');
        } else if (mode === 'high') {
          root.style.setProperty('--red-neon', '#FF3131');
          root.style.setProperty('--red-glow', 'rgba(255,49,49,0.45)');
          write('Theme set to HIGH intensity.', 'sys');
        } else {
          write('Usage: theme <low|mid|high>', 'err');
        }
      },
      neofetch: () => {
        const art = [
          '      ▄████▄      ',
          '    ▄█▀    ▀█▄    ',
          '   █▀  ▄██▄  ▀█   ',
          '  █   █▀  ▀█   █  ',
          '  █   █    █   █  ',
          '  █▄  ▀█▄▄█▀  ▄█  ',
          '   █▄  ████  ▄█   ',
          '    ▀█▄    ▄█▀    ',
          '      ▀████▀      ',
        ].join('\n');
        const info = [
          ['OS',       'Atlas OS 1.0.0 x86_64'],
          ['Host',     'Atlas Mainframe'],
          ['Kernel',   'Atlas-midnight 6.6.6'],
          ['Shell',    'atlas_cmd'],
          ['Uptime',   formatUptime((performance.now() - AtlasBootTime) / 1000)],
          ['Resolution', `${window.innerWidth}x${window.innerHeight}`],
          ['Theme',    'Midnight & Blood'],
          ['CPU',      'Atlas-Core @ 6.66GHz (16)'],
          ['GPU',      'Crimson RTX 5090'],
          ['Memory',   `${(512 + Math.floor(Math.random()*512))}MiB / 32768MiB`],
          ['Clearance','EXECUTIVE'],
        ];
        const block = `<div class="neofetch-block"><div class="neofetch-art">${art}</div><div class="neofetch-info">` +
          info.map(([k,v]) => `<div><span class="k">${k.padEnd(10)}</span> <span class="v">${v}</span></div>`).join('') +
          `</div></div>`;
        writeHTML(block);
      },
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const raw = input.value;
        const display = el('div', { class: 'term-line' });
        display.innerHTML = `<span class="term-prompt">operator@atlas:~$</span> ${escapeHTML(raw)}`;
        host.insertBefore(display, inputLine);
        input.value = '';
        if (raw.trim()) {
          history.push(raw);
          histIdx = history.length;
          const [cmd, ...args] = raw.trim().split(/\s+/);
          if (COMMANDS[cmd]) {
            try { COMMANDS[cmd](args); } catch (err) { write(String(err), 'err'); }
          } else {
            write(`atlas_cmd: command not found: ${cmd}`, 'err');
          }
        }
        host.scrollTop = host.scrollHeight;
      } else if (e.key === 'ArrowUp') {
        if (histIdx > 0) { histIdx--; input.value = history[histIdx] || ''; }
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (histIdx < history.length) { histIdx++; input.value = history[histIdx] || ''; }
        e.preventDefault();
      }
    });

    host.addEventListener('click', () => input.focus());

    const win = WM.create({
      title: 'ATLAS_CMD',
      icon: 'ph ph-terminal-window',
      width: 680, height: 460,
      content: host,
      appKey: 'terminal',
      onMount: () => setTimeout(() => input.focus(), 50),
    });
    return win;
  }

  function formatUptime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return `${h}h ${m}m ${sec}s`;
  }

  function escapeHTML(s) {
    return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  // =============================================================
  // SYS MONITOR
  // =============================================================
  function openSysMonitor() {
    const root = el('div', { class: 'app-sysmon' });
    root.innerHTML = `
      <div class="sysmon-header">
        <span>ATLAS // SYSTEM MONITOR</span>
        <span id="sysmon-uptime">00:00:00</span>
      </div>
      <div class="sysmon-chart">
        <canvas id="cpu-canvas"></canvas>
        <div class="sysmon-chart-label">CPU</div>
        <div class="sysmon-chart-value" id="cpu-val">0%</div>
      </div>
      <div class="sysmon-chart">
        <canvas id="net-canvas"></canvas>
        <div class="sysmon-chart-label">NET I/O</div>
        <div class="sysmon-chart-value" id="net-val">0 Mb/s</div>
      </div>
      <div class="sysmon-procs">
        <table>
          <thead><tr><th>PID</th><th>PROCESS</th><th>CPU</th><th>MEM</th><th>STATUS</th></tr></thead>
          <tbody id="proc-body"></tbody>
        </table>
      </div>
    `;

    const PROCS = [
      { name: 'atlas_kernel', status: 'CORE' },
      { name: 'window_mgr',   status: 'RUN' },
      { name: 'atlas_cmd',    status: 'RUN' },
      { name: 'nexus_browser',status: 'IDLE' },
      { name: 'hud_daemon',   status: 'RUN' },
      { name: 'wallpaper_fx', status: 'RUN' },
      { name: 'sys_monitor',  status: 'RUN' },
      { name: 'crimson_net',  status: 'LISTEN' },
    ];

    const win = WM.create({
      title: 'SYSMONITOR',
      icon: 'ph ph-pulse',
      width: 640, height: 520,
      content: root,
      appKey: 'sysmonitor',
      onMount: (body) => initSysmonCanvases(body),
    });

    function initSysmonCanvases(body) {
      const cpuCanvas = body.querySelector('#cpu-canvas');
      const netCanvas = body.querySelector('#net-canvas');
      const cpuVal = body.querySelector('#cpu-val');
      const netVal = body.querySelector('#net-val');
      const procBody = body.querySelector('#proc-body');
      const uptimeEl = body.querySelector('#sysmon-uptime');

      const cpuHist = new Array(120).fill(20);
      const netHist = new Array(120).fill(30);

      function resize() {
        [cpuCanvas, netCanvas].forEach(c => {
          c.width = c.clientWidth * devicePixelRatio;
          c.height = c.clientHeight * devicePixelRatio;
        });
      }
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(cpuCanvas);
      ro.observe(netCanvas);

      function drawChart(canvas, data, color) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = 'rgba(255,49,49,0.08)';
        ctx.lineWidth = 1;
        for (let i = 1; i < 5; i++) {
          const y = (h / 5) * i;
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
        for (let i = 1; i < 10; i++) {
          const x = (w / 10) * i;
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }

        // Fill
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, color + 'cc');
        grad.addColorStop(1, color + '00');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, h);
        data.forEach((v, i) => {
          const x = (i / (data.length - 1)) * w;
          const y = h - (v / 100) * h;
          ctx.lineTo(x, y);
        });
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // Line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        data.forEach((v, i) => {
          const x = (i / (data.length - 1)) * w;
          const y = h - (v / 100) * h;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      let cpuBase = 25;
      let netBase = 40;
      let running = true;

      function tick() {
        if (!running) return;
        if (!document.body.contains(root)) { running = false; ro.disconnect(); return; }

        cpuBase += (Math.random() - 0.5) * 8;
        cpuBase = Math.max(8, Math.min(92, cpuBase));
        netBase += (Math.random() - 0.5) * 14;
        netBase = Math.max(5, Math.min(95, netBase));

        cpuHist.shift(); cpuHist.push(cpuBase);
        netHist.shift(); netHist.push(netBase);

        drawChart(cpuCanvas, cpuHist, '#FF3131');
        drawChart(netCanvas, netHist, '#D2042D');

        cpuVal.textContent = Math.round(cpuBase) + '%';
        netVal.textContent = (netBase * 12).toFixed(1) + ' Mb/s';
        uptimeEl.textContent = formatUptime((performance.now() - AtlasBootTime) / 1000);

        // Proc table
        procBody.innerHTML = PROCS.map((p, i) => {
          const cpu = (Math.random() * 18).toFixed(1);
          const mem = (Math.random() * 400 + 20).toFixed(0);
          return `<tr><td>${(1000 + i*13)}</td><td style="color:var(--red-neon)">${p.name}</td><td>${cpu}%</td><td>${mem} MB</td><td>${p.status}</td></tr>`;
        }).join('');

        setTimeout(tick, 450);
      }
      tick();
    }

    return win;
  }

  // =============================================================
  // NEXUS BROWSER
  // =============================================================
  function openBrowser(url) {
    const root = el('div', { class: 'app-browser' });

    const backBtn = el('button', { class: 'browser-btn', disabled: 'true' }, [el('i', { class: 'ph ph-caret-left' })]);
    const fwdBtn = el('button', { class: 'browser-btn', disabled: 'true' }, [el('i', { class: 'ph ph-caret-right' })]);
    const reloadBtn = el('button', { class: 'browser-btn' }, [el('i', { class: 'ph ph-arrow-clockwise' })]);
    const homeBtn = el('button', { class: 'browser-btn' }, [el('i', { class: 'ph ph-house' })]);
    const urlInput = el('input', { class: 'browser-url', placeholder: 'nexus://search or https://...' });
    const goBtn = el('button', { class: 'browser-btn' }, [el('i', { class: 'ph ph-arrow-right' })]);

    const toolbar = el('div', { class: 'browser-toolbar' }, [backBtn, fwdBtn, reloadBtn, homeBtn, urlInput, goBtn]);
    const viewport = el('div', { style: 'position:relative; overflow:hidden;' });
    root.appendChild(toolbar);
    root.appendChild(viewport);

    const history = [];
    let idx = -1;

    function renderHome() {
      viewport.innerHTML = '';
      const home = el('div', { class: 'browser-home' });
      home.innerHTML = `
        <h1>NEXUS</h1>
        <p>CRIMSON NET // ENTRY POINT</p>
        <div class="browser-bookmarks">
          <button class="browser-bookmark" data-url="https://example.com">EXAMPLE</button>
          <button class="browser-bookmark" data-url="https://wikipedia.org">WIKIPEDIA</button>
          <button class="browser-bookmark" data-url="https://duckduckgo.com">DUCK.DG</button>
          <button class="browser-bookmark" data-url="https://news.ycombinator.com">HN</button>
        </div>
      `;
      viewport.appendChild(home);
      home.querySelectorAll('.browser-bookmark').forEach(b => {
        b.addEventListener('click', () => navigate(b.dataset.url));
      });
      urlInput.value = '';
    }

    function navigate(u) {
      if (!u) return renderHome();
      if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
      history.splice(idx + 1);
      history.push(u);
      idx = history.length - 1;
      show(u);
      updateNav();
    }

    function show(u) {
      viewport.innerHTML = '';
      const frame = el('iframe', { class: 'browser-frame', src: u, sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups' });
      frame.style.width = '100%';
      frame.style.height = '100%';
      viewport.appendChild(frame);
      urlInput.value = u;
    }

    function updateNav() {
      backBtn.disabled = idx <= 0;
      fwdBtn.disabled = idx >= history.length - 1;
    }

    backBtn.addEventListener('click', () => { if (idx > 0) { idx--; show(history[idx]); updateNav(); } });
    fwdBtn.addEventListener('click', () => { if (idx < history.length-1) { idx++; show(history[idx]); updateNav(); } });
    reloadBtn.addEventListener('click', () => { if (idx >= 0) show(history[idx]); });
    homeBtn.addEventListener('click', () => { idx = -1; history.length = 0; renderHome(); updateNav(); });
    goBtn.addEventListener('click', () => navigate(urlInput.value.trim()));
    urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(urlInput.value.trim()); });

    const win = WM.create({
      title: 'NEXUS BROWSER',
      icon: 'ph ph-globe',
      width: 900, height: 600,
      content: root,
      appKey: 'browser',
      onMount: () => { if (url) navigate(url); else renderHome(); },
    });
    return win;
  }

  // =============================================================
  // FILE SYSTEM
  // =============================================================
  const FS = {
    '/': [
      { name: 'Documents', type: 'folder' },
      { name: 'System', type: 'folder' },
      { name: 'Logs', type: 'folder' },
      { name: 'ReadMe.txt', type: 'file', content: null }, // filled below
      { name: 'manifest.atlas', type: 'file', content: 'ATLAS // Midnight Shell // Operator: itzzzshxdow' },
    ],
    '/Documents': [
      { name: 'operator_notes.txt', type: 'file', content: 'Nothing to see here yet. The operator keeps their secrets close.' },
      { name: 'crimson_protocol.txt', type: 'file', content: 'PROTOCOL CRIMSON\n================\n\n1. All ingress is logged.\n2. All egress is encrypted.\n3. Trust nothing outside the shell.\n' },
    ],
    '/System': [
      { name: 'kernel.atlas', type: 'file', content: '[BINARY BLOB — access denied without EXECUTIVE clearance]' },
      { name: 'config.json', type: 'file', content: '{\n  "theme": "midnight",\n  "accent": "#FF3131",\n  "operator": "itzzzshxdow"\n}' },
    ],
    '/Logs': [
      { name: 'boot.log', type: 'file', content: '[2026-04-21 00:00:00] Atlas boot sequence initiated.\n[2026-04-21 00:00:01] Crimson Net handshake OK.\n[2026-04-21 00:00:02] Operator session unlocked.\n' },
    ],
  };

  function openFiles() {
    const root = el('div', { class: 'app-files' });
    let cwd = '/';

    function render() {
      root.innerHTML = `
        <div class="files-toolbar">
          <button class="browser-btn" id="files-up" ${cwd === '/' ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button>
          <span>PATH:</span>
          <span class="files-path">atlas:/${cwd === '/' ? '' : cwd.slice(1)}</span>
        </div>
        <div class="files-grid"></div>
      `;
      const grid = root.querySelector('.files-grid');
      const entries = FS[cwd] || [];
      entries.forEach(entry => {
        const iconCls = entry.type === 'folder' ? 'folder' : 'file';
        const iconName = entry.type === 'folder' ? 'ph-fill ph-folder-simple' :
          entry.name.endsWith('.txt') ? 'ph ph-file-text' :
          entry.name.endsWith('.json') ? 'ph ph-brackets-curly' :
          entry.name.endsWith('.atlas') ? 'ph ph-hexagon' :
          'ph ph-file';
        const item = el('div', { class: `file-icon ${iconCls}` }, [
          el('i', { class: iconName }),
          el('span', {}, entry.name),
        ]);
        item.addEventListener('dblclick', () => {
          if (entry.type === 'folder') {
            cwd = cwd === '/' ? '/' + entry.name : cwd + '/' + entry.name;
            render();
          } else {
            openNotepad(entry.name, entry.content || AtlasLore.readme);
          }
        });
        grid.appendChild(item);
      });
      root.querySelector('#files-up').addEventListener('click', () => {
        if (cwd === '/') return;
        const parts = cwd.split('/').filter(Boolean);
        parts.pop();
        cwd = '/' + parts.join('/');
        if (cwd === '/') cwd = '/';
        render();
      });
    }

    // Fill readme lazily
    const readme = FS['/'].find(x => x.name === 'ReadMe.txt');
    if (readme && !readme.content) readme.content = AtlasLore.readme;

    render();

    const win = WM.create({
      title: 'FILES',
      icon: 'ph ph-folder',
      width: 620, height: 440,
      content: root,
      appKey: 'files',
    });
    return win;
  }

  // =============================================================
  // NOTEPAD
  // =============================================================
  function openNotepad(title = 'untitled.txt', content = '') {
    const root = el('div', { class: 'app-notepad' });
    root.innerHTML = `
      <div class="notepad-toolbar">ATLAS // NOTEPAD — ${escapeHTML(title)}</div>
      <textarea class="notepad-body" spellcheck="false"></textarea>
    `;
    root.querySelector('textarea').value = content;
    return WM.create({
      title: `NOTEPAD — ${title}`,
      icon: 'ph ph-note-pencil',
      width: 560, height: 420,
      content: root,
      appKey: 'notepad',
    });
  }

  // =============================================================
  // SYS INFO
  // =============================================================
  function openSysInfo() {
    const root = el('div', { class: 'app-sysinfo' });
    const rows = [
      ['OPERATING SYSTEM', 'Atlas OS 1.0.0'],
      ['CODE NAME', 'Midnight Shell'],
      ['KERNEL', 'Atlas-midnight 6.6.6'],
      ['OPERATOR', 'itzzzshxdow'],
      ['CLEARANCE', 'EXECUTIVE'],
      ['SHELL', 'atlas_cmd'],
      ['THEME', 'Midnight & Blood'],
      ['RESOLUTION', `${window.innerWidth} x ${window.innerHeight}`],
      ['USER AGENT', navigator.userAgent],
      ['PLATFORM', navigator.platform],
      ['LANGUAGE', navigator.language],
      ['CPU CORES', navigator.hardwareConcurrency || '—'],
      ['MEMORY (reported)', (navigator.deviceMemory || '?') + ' GB'],
      ['UPTIME', formatUptime((performance.now() - AtlasBootTime) / 1000)],
    ];
    root.innerHTML = `
      <div class="sysinfo-header">SYSTEM INFORMATION</div>
      ${rows.map(([k, v]) => `<div class="sysinfo-row"><div class="sysinfo-k">${k}</div><div class="sysinfo-v">${v}</div></div>`).join('')}
    `;
    return WM.create({
      title: 'SYSTEM INFO',
      icon: 'ph ph-info',
      width: 560, height: 520,
      content: root,
      appKey: 'sysinfo',
    });
  }

  // =============================================================
  // LAUNCHER
  // =============================================================
  function launch(key) {
    // Focus existing window if singleton app already open
    for (const d of WM.state.windows.values()) {
      if (d.appKey === key && ['sysmonitor','files','sysinfo','browser'].includes(key)) {
        WM.focus(d.id);
        return d;
      }
    }
    switch (key) {
      case 'terminal':   return openTerminal();
      case 'sysmonitor': return openSysMonitor();
      case 'browser':    return openBrowser();
      case 'files':      return openFiles();
      case 'notepad':    return openNotepad();
      case 'sysinfo':    return openSysInfo();
    }
  }

  function themeCycle() {
    const root = document.documentElement;
    const current = getComputedStyle(root).getPropertyValue('--red-neon').trim().toUpperCase();
    if (current === '#8B0000') launch('terminal').then(() => COMMANDS.theme(['mid'])); // Wait, launch returns win
    // Simpler logic for the Hub:
    if (current === '#8B0000' || current === 'RGB(139, 0, 0)') {
      setTheme('mid');
    } else if (current === '#D2042D' || current === 'RGB(210, 4, 45)') {
      setTheme('high');
    } else {
      setTheme('low');
    }
  }

  function setTheme(mode) {
    const root = document.documentElement;
    if (mode === 'low') {
      root.style.setProperty('--red-neon', '#8B0000');
      root.style.setProperty('--red-glow', 'rgba(139,0,0,0.3)');
    } else if (mode === 'mid') {
      root.style.setProperty('--red-neon', '#D2042D');
      root.style.setProperty('--red-glow', 'rgba(210,4,45,0.4)');
    } else if (mode === 'high') {
      root.style.setProperty('--red-neon', '#FF3131');
      root.style.setProperty('--red-glow', 'rgba(255,49,49,0.45)');
    }
  }

  return { launch, openTerminal, openSysMonitor, openBrowser, openFiles, openNotepad, openSysInfo, themeCycle };
})();

// =============================================================
// LORE
// =============================================================
const AtlasLore = {
  readme: `ATLAS // MIDNIGHT SHELL — READ ME
================================

You are operating within a simulation.

Atlas OS is an executive shell built for a single purpose:
to command, to observe, and to persist — when nothing else will.

The crimson you see threading through every surface is not
decoration. It is the accretion trail of a system that has
burned down and rebuilt itself more times than its operators
can count. Every pixel is a scar.

The rules are simple:
  1. Trust nothing outside the shell.
  2. Log everything. Encrypt the rest.
  3. The operator is always alone. That is the point.

You have been granted EXECUTIVE clearance.
Try not to waste it.

— TheSizCorporation`,
};

// Populated by system.js when boot completes.
let AtlasBootTime = performance.now();
