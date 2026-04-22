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

    let cwd = '/';
    const prompt = el('span', { class: 'term-prompt' }, 'operator@atlas:~$');
    const input = el('input', { class: 'term-input', spellcheck: 'false', autocomplete: 'off' });
    const inputLine = el('div', { class: 'term-input-line' }, [
      prompt,
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
          ['ls',       'List directory contents'],
          ['cd',       'Change directory'],
          ['cat',      'Read file content'],
          ['mkdir',    'Create a new folder'],
          ['touch',    'Create a new file'],
          ['rm',       'Remove a file or folder'],
          ['sentinel', 'Interact with Siz-Sentinel'],
          ['whoami',   'Print current user session'],
          ['neofetch', 'Display system info'],
          ['theme',    'Change UI intensity'],
          ['date',     'Print system time'],
          ['reboot',   'Restart simulation'],
        ];
        rows.forEach(([k, v]) => writeHTML(`  <span style="color:var(--red-neon)">${k.padEnd(10)}</span> <span style="color:var(--text-secondary)">${v}</span>`));
      },
      sentinel: (args) => {
        const msg = args.join(' ').toLowerCase();
        if (!msg) return write('SENTINEL: State your inquiry, Operator.', 'accent');
        const responses = [
          "Your query has been logged. Corporate review pending.",
          "That information is restricted to Level 5 Executives.",
          "TheSizCorporation values your curiosity. Please return to your assigned tasks.",
          "Observations suggest your focus is drifting. Corrective measures available.",
          "Simulation stability: 98.4%. No cause for concern.",
          "I am watching. I am always watching."
        ];
        write('SENTINEL: ' + responses[Math.floor(Math.random() * responses.length)], 'accent');
      },
      clear: () => {
        [...host.querySelectorAll('.term-line')].forEach(n => n.remove());
      },
      echo: (args) => write(args.join(' ')),
      whoami: () => write('operator@atlas // clearance: EXECUTIVE', 'accent'),
      date: () => write(new Date().toString(), 'sys'),
      ls: () => {
        const entries = VFS.ls(cwd);
        if (entries.length === 0) return;
        const html = entries.map(e => {
          const color = e.type === 'folder' ? '#fbbf24' : 'var(--text-primary)';
          return `<span style="color:${color}">${e.name}${e.type === 'folder' ? '/' : ''}</span>`;
        }).join('  ');
        writeHTML(html);
      },
      cd: (args) => {
        const target = args[0];
        if (!target || target === '~') { cwd = '/'; }
        else if (target === '..') {
          if (cwd === '/') return;
          const parts = cwd.split('/').filter(Boolean);
          parts.pop();
          cwd = '/' + parts.join('/');
        } else {
          const entry = VFS.resolve(cwd, target);
          if (entry && entry.type === 'folder') {
            cwd = cwd === '/' ? '/' + target : cwd + '/' + target;
          } else {
            write(`cd: ${target}: No such directory`, 'err');
          }
        }
        prompt.textContent = `operator@atlas:${cwd === '/' ? '~' : cwd}$`;
      },
      cat: (args) => {
        const name = args[0];
        if (!name) return write('cat: missing filename', 'err');
        const entry = VFS.resolve(cwd, name);
        if (entry && entry.type === 'file') {
          write(entry.content || '', 'sys');
        } else {
          write(`cat: ${name}: No such file`, 'err');
        }
      },
      mkdir: (args) => {
        const name = args[0];
        if (!name) return write('mkdir: missing operand', 'err');
        if (VFS.mkdir(cwd, name)) {
          write(`Directory created: ${name}`, 'ok');
        } else {
          write(`mkdir: cannot create directory '${name}': File exists`, 'err');
        }
      },
      touch: (args) => {
        const name = args[0];
        if (!name) return write('touch: missing operand', 'err');
        VFS.touch(cwd, name, '');
        write(`File created: ${name}`, 'ok');
      },
      rm: (args) => {
        const name = args[0];
        if (!name) return write('rm: missing operand', 'err');
        if (VFS.rm(cwd, name)) {
          write(`Removed: ${name}`, 'ok');
        } else {
          write(`rm: cannot remove '${name}': No such file or directory`, 'err');
        }
      },
      reboot: () => {
        write('Initiating reboot sequence...', 'err');
        setTimeout(() => location.reload(), 800);
      },
      theme: (args) => {
        const mode = args[0];
        if (!['low', 'mid', 'high'].includes(mode)) return write('Usage: theme <low|mid|high>', 'err');
        setTheme(mode);
        write(`Theme set to ${mode.toUpperCase()} intensity.`, 'sys');
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
          ['Shell',    'Neuro-Link CMD'],
          ['Uptime',   formatUptime((performance.now() - AtlasBootTime) / 1000)],
          ['Resolution', `${window.innerWidth}x${window.innerHeight}`],
          ['Theme',    'Midnight & Blood'],
          ['Clearance','EXECUTIVE'],
        ];
        const block = `<div class="neofetch-block"><div class="neofetch-art">${art}</div><div class="neofetch-info">` +
          info.map(([k,v]) => `<div><span class="k">${k.padEnd(10)}</span> <span class="v">${v}</span></div>`).join('') +
          `</div></div>`;
        writeHTML(block);
      },
    };

    const OBSERVATIONS = [
      "NOTICE: Network packet 0x6F2A intercepted and scrubbed.",
      "OBSERVATION: Operator pulse rate stable. Efficiency optimal.",
      "SYSTEM: Purging temp_buffer cache... OK.",
      "SENTINEL: TheSizCorporation reminds you: Curiosity is a Level 2 Risk.",
      "ALERT: Unauthorized port scan detected on node 127.0.0.1. Handled.",
      "NOTICE: Session encrypted. Neuro-Link signal at 100%."
    ];
    const sentinelInterval = setInterval(() => {
      if (!document.body.contains(host)) {
        clearInterval(sentinelInterval);
        return;
      }
      if (Math.random() > 0.85) {
        write('SENTINEL: ' + OBSERVATIONS[Math.floor(Math.random() * OBSERVATIONS.length)], 'accent');
      }
    }, 15000);

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
  // VFS — Persistent Virtual File System
  // =============================================================
  const DEFAULT_FS = {
    '/': [
      { name: 'Documents', type: 'folder' },
      { name: 'System', type: 'folder' },
      { name: 'Logs', type: 'folder' },
      { name: 'ReadMe.txt', type: 'file', content: null }, // placeholder
      { name: 'manifest.atlas', type: 'file', content: 'ATLAS // Neuro-Link // Operator: itzzzshxdow' },
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

  const VFS = {
    data: JSON.parse(localStorage.getItem('atlas_vfs')) || DEFAULT_FS,
    save() {
      localStorage.setItem('atlas_vfs', JSON.stringify(this.data));
    },
    ls(path) {
      return this.data[path] || [];
    },
    resolve(cwd, name) {
      const entries = this.ls(cwd);
      return entries.find(e => e.name === name);
    },
    mkdir(cwd, name) {
      if (this.resolve(cwd, name)) return false;
      this.data[cwd].push({ name, type: 'folder' });
      const newPath = cwd === '/' ? '/' + name : cwd + '/' + name;
      this.data[newPath] = [];
      this.save();
      return true;
    },
    touch(cwd, name, content = '') {
      const existing = this.resolve(cwd, name);
      if (existing) {
        existing.content = content;
      } else {
        this.data[cwd].push({ name, type: 'file', content });
      }
      this.save();
      return true;
    },
    rm(cwd, name) {
      const entries = this.ls(cwd);
      const idx = entries.findIndex(e => e.name === name);
      if (idx === -1) return false;
      const entry = entries[idx];
      if (entry.type === 'folder') {
        const fullPath = cwd === '/' ? '/' + name : cwd + '/' + name;
        delete this.data[fullPath];
      }
      entries.splice(idx, 1);
      this.save();
      return true;
    }
  };

  function openFiles() {
    const root = el('div', { class: 'app-files' });
    let cwd = '/';

    function render() {
      root.innerHTML = `
        <div class="files-toolbar">
          <button class="browser-btn" id="files-up" ${cwd === '/' ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button>
          <span>PATH:</span>
          <span class="files-path">atlas:${cwd}</span>
        </div>
        <div class="files-grid"></div>
      `;
      const grid = root.querySelector('.files-grid');
      const entries = VFS.ls(cwd);
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
            openNotepad(entry.name, entry.content, (newContent) => {
              VFS.touch(cwd, entry.name, newContent);
              render();
            });
          }
        });
        grid.appendChild(item);
      });
      root.querySelector('#files-up').addEventListener('click', () => {
        if (cwd === '/') return;
        const parts = cwd.split('/').filter(Boolean);
        parts.pop();
        cwd = '/' + parts.join('/');
        render();
      });
    }

    // Lazy load readme if not set
    const rootFiles = VFS.ls('/');
    const readme = rootFiles.find(f => f.name === 'ReadMe.txt');
    if (readme && !readme.content) {
      readme.content = AtlasLore.readme;
      VFS.save();
    }

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
  function openNotepad(title = 'untitled.txt', content = '', onSave) {
    const root = el('div', { class: 'app-notepad' });
    const area = el('textarea', { class: 'notepad-body', spellcheck: 'false' });
    area.value = content;

    const saveBtn = el('button', { class: 'browser-btn', title: 'Save File' }, [el('i', { class: 'ph ph-floppy-disk' })]);
    saveBtn.onclick = () => {
      if (onSave) onSave(area.value);
      if (window.Atlas) window.Atlas.notify(`File saved: ${title}`);
    };

    const toolbar = el('div', { class: 'notepad-toolbar' }, [
      el('span', {}, `ATLAS // NOTEPAD — ${title}`),
      saveBtn
    ]);

    root.appendChild(toolbar);
    root.appendChild(area);

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
      ['CODE NAME', 'Neuro-Link'],
      ['KERNEL', 'Atlas-midnight 6.6.6'],
      ['OPERATOR', 'itzzzshxdow'],
      ['CLEARANCE', 'EXECUTIVE'],
      ['SHELL', 'Neuro-Link CMD'],
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
  function launch(key, params = {}) {
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
      case 'browser':    return openBrowser(params.url);
      case 'files':      return openFiles();
      case 'notepad':    return openNotepad(params.title, params.content, params.onSave);
      case 'sysinfo':    return openSysInfo();
    }
  }

  return { launch, openTerminal, openSysMonitor, openBrowser, openFiles, openNotepad, openSysInfo, themeCycle, VFS };
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
