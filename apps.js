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
          ['override', 'Elevate session clearance'],
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
      override: (args) => {
        const key = args[0];
        if (!key) return write('Usage: override <ACCESS_KEY>', 'err');
        
        if (key === "ORION_77") {
          if (window.Atlas) window.Atlas.setClearance('EXECUTIVE');
          write("ACCESS GRANTED: EXECUTIVE STATUS ACTIVATED.", "ok");
        } else if (key === "VOID_OVERRIDE_00") {
          if (window.Atlas) window.Atlas.setClearance('ROOT');
          write("CRITICAL OVERRIDE: ROOT ACCESS GRANTED.", "ok");
        } else {
          write("ACCESS DENIED: INVALID KEY. Incident has been logged.", "err");
          if (window.Atlas) window.Atlas.notify("UNAUTHORIZED OVERRIDE ATTEMPT DETECTED.", 3000);
        }
      },
      clear: () => {
        [...host.querySelectorAll('.term-line')].forEach(n => n.remove());
      },
      echo: (args) => write(args.join(' ')),
      whoami: () => write('operator@atlas // clearance: ' + (window.Atlas ? window.Atlas.state.clearance : 'OPERATOR'), 'accent'),
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
          ['Clearance', window.Atlas ? window.Atlas.state.clearance : 'OPERATOR'],
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
  // SYS MONITOR — CRIMSON CORE MONITOR
  // =============================================================
  function openSysMonitor() {
    const root = el('div', { class: 'app-sysmon' });
    root.innerHTML = `
      <div class="sysmon-header">
        <div class="sysmon-title"><i class="ph-fill ph-pulse"></i> CRIMSON CORE MONITOR</div>
        <div id="sysmon-uptime" class="sysmon-uptime">UPTIME: 00:00:00</div>
      </div>
      <div class="sysmon-grid">
        <div class="sysmon-card">
          <div class="sysmon-card-header">CPU_UTILIZATION</div>
          <div class="sysmon-gauge-container">
            <canvas id="cpu-gauge"></canvas>
            <div class="sysmon-gauge-value" id="cpu-val">0%</div>
          </div>
          <div class="sysmon-mini-chart">
            <canvas id="cpu-chart"></canvas>
          </div>
        </div>
        <div class="sysmon-card">
          <div class="sysmon-card-header">NET_BANDWIDTH</div>
          <div class="sysmon-gauge-container">
            <canvas id="net-gauge"></canvas>
            <div class="sysmon-gauge-value" id="net-val">0</div>
            <div class="sysmon-gauge-unit">Mb/s</div>
          </div>
          <div class="sysmon-mini-chart">
            <canvas id="net-chart"></canvas>
          </div>
        </div>
      </div>
      <div class="sysmon-procs">
        <div class="sysmon-procs-header">ACTIVE_PROCESS_STREAM</div>
        <table>
          <thead><tr><th>PID</th><th>PROCESS_ID</th><th>CPU</th><th>MEM</th><th>STATE</th><th>ACTION</th></tr></thead>
          <tbody id="proc-body"></tbody>
        </table>
      </div>
    `;

    let PROCS = [
      { id: 1001, name: 'atlas_kernel', status: 'CORE' },
      { id: 1024, name: 'window_mgr',   status: 'RUN' },
      { id: 1042, name: 'neuro_link',   status: 'RUN' },
      { id: 1056, name: 'nexus_core',   status: 'IDLE' },
      { id: 1088, name: 'hud_daemon',   status: 'RUN' },
      { id: 1102, name: 'sentinel_ai',  status: 'WATCH' },
      { id: 1150, name: 'crimson_net',  status: 'LISTEN' },
    ];

    const win = WM.create({
      title: 'CORE MONITOR',
      icon: 'ph ph-pulse',
      width: 720, height: 580,
      content: root,
      appKey: 'sysmonitor',
      onMount: (body) => initSysmon(body),
    });

    function initSysmon(body) {
      const cpuGauge = body.querySelector('#cpu-gauge');
      const netGauge = body.querySelector('#net-gauge');
      const cpuChart = body.querySelector('#cpu-chart');
      const netChart = body.querySelector('#net-chart');
      
      const cpuVal = body.querySelector('#cpu-val');
      const netVal = body.querySelector('#net-val');
      const procBody = body.querySelector('#proc-body');
      const uptimeEl = body.querySelector('#sysmon-uptime');

      const cpuHist = new Array(60).fill(25);
      const netHist = new Array(60).fill(40);

      function resize() {
        [cpuGauge, netGauge, cpuChart, netChart].forEach(c => {
          c.width = c.clientWidth * devicePixelRatio;
          c.height = c.clientHeight * devicePixelRatio;
        });
      }
      resize();
      const ro = new ResizeObserver(resize);
      [cpuGauge, netGauge, cpuChart, netChart].forEach(c => ro.observe(c));

      function drawGauge(canvas, value, color) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        const cx = w / 2, cy = h / 2;
        const r = Math.min(w, h) * 0.4;
        
        ctx.clearRect(0, 0, w, h);
        
        // Background track
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI * 0.8, Math.PI * 2.2);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 8 * devicePixelRatio;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Value track
        const angle = Math.PI * 0.8 + (Math.PI * 1.4 * (value / 100));
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI * 0.8, angle);
        ctx.strokeStyle = color;
        ctx.lineWidth = 8 * devicePixelRatio;
        ctx.lineCap = 'round';
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 * devicePixelRatio;
        ctx.stroke();
        childShadowBlur = 0;
      }

      function drawMiniChart(canvas, data, color) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        
        ctx.beginPath();
        ctx.moveTo(0, h);
        data.forEach((v, i) => {
          const x = (i / (data.length - 1)) * w;
          const y = h - (v / 100) * h;
          ctx.lineTo(x, y);
        });
        ctx.lineTo(w, h);
        ctx.fillStyle = color + '22';
        ctx.fill();

        ctx.beginPath();
        data.forEach((v, i) => {
          const x = (i / (data.length - 1)) * w;
          const y = h - (v / 100) * h;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2 * devicePixelRatio;
        ctx.stroke();
      }

      let cpuBase = 30;
      let netBase = 45;
      let running = true;

      function tick() {
        if (!running) return;
        if (!document.body.contains(root)) { running = false; ro.disconnect(); return; }

        cpuBase += (Math.random() - 0.5) * 10;
        cpuBase = Math.max(5, Math.min(95, cpuBase));
        netBase += (Math.random() - 0.5) * 15;
        netBase = Math.max(5, Math.min(95, netBase));

        cpuHist.shift(); cpuHist.push(cpuBase);
        netHist.shift(); netHist.push(netBase);

        drawGauge(cpuGauge, cpuBase, '#FF3131');
        drawGauge(netGauge, netBase, '#D2042D');
        drawMiniChart(cpuChart, cpuHist, '#FF3131');
        drawMiniChart(netChart, netHist, '#D2042D');

        cpuVal.textContent = Math.round(cpuBase) + '%';
        netVal.textContent = Math.round(netBase * 8.5);
        uptimeEl.textContent = 'UPTIME: ' + formatUptime((performance.now() - AtlasBootTime) / 1000);

        // Proc table
        procBody.innerHTML = PROCS.map((p) => {
          const cpu = (Math.random() * 15 + (p.status === 'CORE' ? 10 : 0)).toFixed(1);
          const mem = (Math.random() * 300 + (p.status === 'CORE' ? 400 : 50)).toFixed(0);
          return `<tr>
            <td>${p.id}</td>
            <td class="accent">${p.name}</td>
            <td>${cpu}%</td>
            <td>${mem} MB</td>
            <td><span class="proc-status ${p.status.toLowerCase()}">${p.status}</span></td>
            <td><button class="proc-kill" onclick="this.closest('tr').style.opacity='0.3'; Atlas.notify('Terminating process: ${p.name}')">KILL</button></td>
          </tr>`;
        }).join('');

        setTimeout(tick, 600);
      }
      tick();
    }

    return win;
  }

  // =============================================================
  // NEXUS BROWSER — NEXUS INTERFACE
  // =============================================================
  function openBrowser(url) {
    const root = el('div', { class: 'app-browser' });

    const backBtn = el('button', { class: 'browser-btn', disabled: 'true' }, [el('i', { class: 'ph ph-caret-left' })]);
    const fwdBtn = el('button', { class: 'browser-btn', disabled: 'true' }, [el('i', { class: 'ph ph-caret-right' })]);
    const reloadBtn = el('button', { class: 'browser-btn' }, [el('i', { class: 'ph ph-arrow-clockwise' })]);
    const homeBtn = el('button', { class: 'browser-btn' }, [el('i', { class: 'ph ph-house' })]);
    const urlInput = el('input', { class: 'browser-url', placeholder: 'Enter node address...' });
    const vpnToggle = el('button', { class: 'browser-vpn-btn' }, 'VPN_OFF');
    
    const toolbar = el('div', { class: 'browser-toolbar' }, [
      el('div', { class: 'browser-nav-group' }, [backBtn, fwdBtn, reloadBtn, homeBtn]),
      urlInput,
      vpnToggle
    ]);
    
    const viewport = el('div', { class: 'browser-viewport' });
    const vpnOverlay = el('div', { class: 'browser-vpn-overlay hidden' });
    
    root.appendChild(toolbar);
    root.appendChild(viewport);
    root.appendChild(vpnOverlay);

    const history = [];
    let idx = -1;

    function renderHome() {
      viewport.innerHTML = '';
      const home = el('div', { class: 'browser-home' });
      home.innerHTML = `
        <div class="browser-logo-glitch" data-text="NEXUS">NEXUS</div>
        <div class="browser-sub">CRIMSON_NET INTERFACE</div>
        <div class="browser-nodes">
          <div class="browser-node" data-url="https://google.com">
            <i class="ph ph-magnifying-glass"></i><span>SEARCH</span>
          </div>
          <div class="browser-node" data-url="https://wikipedia.org">
            <i class="ph ph-books"></i><span>ARCHIVE</span>
          </div>
          <div class="browser-node" data-url="https://github.com/shxdowxxx/AtlasOS">
            <i class="ph ph-git-branch"></i><span>REPOSITORY</span>
          </div>
          <div class="browser-node" data-url="https://news.ycombinator.com">
            <i class="ph ph-broadcast"></i><span>SIGNAL</span>
          </div>
        </div>
      `;
      viewport.appendChild(home);
      home.querySelectorAll('.browser-node').forEach(b => {
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
    urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(urlInput.value.trim()); });
    
    vpnToggle.addEventListener('click', () => {
      const active = vpnOverlay.classList.toggle('hidden');
      vpnToggle.textContent = !active ? 'VPN_ON' : 'VPN_OFF';
      vpnToggle.classList.toggle('active', !active);
      Atlas.notify(!active ? "VPN Tunnel Established. Ingress obfuscated." : "VPN Terminated. Direct link active.");
    });

    const win = WM.create({
      title: 'NEXUS INTERFACE',
      icon: 'ph ph-globe',
      width: 960, height: 640,
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
      { name: 'encrypted_vault.txt', type: 'file', content: 'RESTRICTED DATA // SIZ-CORP ENCRYPTION v4.0\n\n[FILE BLOB: 0x48657850...]\n\nNOTICE: Accessing this file without Level 3 Clearance will trigger an automated trace.\n\nLOG_FRAGMENT:\n- EXEC_KEY: "ORION_77"\n- ROOT_KEY: "VOID_OVERRIDE_00"' },
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

  function themeCycle() {
    const root = document.documentElement;
    const current = getComputedStyle(root).getPropertyValue('--red-neon').trim().toUpperCase();
    
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
