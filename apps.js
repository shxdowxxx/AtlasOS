/* ============================================================
   ATLAS OS — Applications
   ============================================================ */

const Apps = (() => {

  // =============================================================
  // MISSION / CLEARANCE PROGRESSION SYSTEM
  // =============================================================
  const MISSION_KEY = 'atlas_missions';
  function _mGet() { return JSON.parse(localStorage.getItem(MISSION_KEY) || '{}'); }
  function _mSet(id) {
    const s = _mGet(); s[id] = true;
    localStorage.setItem(MISSION_KEY, JSON.stringify(s));
    _mCheck();
  }
  function _mDone(id) { return !!_mGet()[id]; }

  const EXEC_MISSIONS = [
    { id: 'm_boot',      label: 'Desktop initialized',                hint: '(auto)' },
    { id: 'm_neofetch',  label: 'Run neofetch',                       hint: 'neofetch' },
    { id: 'm_manifest',  label: 'Read manifest.atlas',                 hint: 'cat manifest.atlas' },
    { id: 'm_sentinel',  label: 'Query Sentinel about clearance',      hint: 'sentinel clearance' },
  ];
  const ROOT_MISSIONS = [
    { id: 'm_vault',     label: 'Read encrypted_vault.txt',           hint: 'cat encrypted_vault.txt (req EXEC)' },
    { id: 'm_hack',      label: 'Run hack sequence on crimson-net',   hint: 'hack crimson-net' },
    { id: 'm_directive', label: 'Read ops_directive.sys',             hint: 'cd /System && cat ops_directive.sys' },
    { id: 'm_ping',      label: 'Ping sentinel-node',                 hint: 'ping sentinel-node' },
  ];

  function _mCheck() {
    const current = window.Atlas ? window.Atlas.state.clearance : 'OPERATOR';
    if (current === 'OPERATOR' && EXEC_MISSIONS.every(m => _mDone(m.id))) {
      setTimeout(() => {
        if (window.Atlas) window.Atlas.setClearance('EXECUTIVE');
        window.dispatchEvent(new CustomEvent('atlas:mission-unlock', { detail: { level: 'EXECUTIVE' } }));
      }, 600);
    }
    if (current === 'EXECUTIVE' && ROOT_MISSIONS.every(m => _mDone(m.id))) {
      setTimeout(() => {
        if (window.Atlas) window.Atlas.setClearance('ROOT');
        window.dispatchEvent(new CustomEvent('atlas:mission-unlock', { detail: { level: 'ROOT' } }));
      }, 600);
    }
  }

  // Mark boot done once desktop is up
  setTimeout(() => _mSet('m_boot'), 100);

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
        writeHTML(`<span class="accent">══ ATLAS_CMD // AVAILABLE COMMANDS ══</span>`);
        const groups = [
          ['FILESYSTEM', [
            ['ls',         'List directory contents'],
            ['cd <dir>',   'Change directory'],
            ['cat <file>', 'Read file content'],
            ['mkdir',      'Create directory'],
            ['touch',      'Create file'],
            ['rm',         'Remove file or directory'],
          ]],
          ['SYSTEM', [
            ['whoami',     'Display operator session'],
            ['neofetch',   'System info panel'],
            ['date',       'Print system time'],
            ['history',    'Show command history'],
            ['clear',      'Clear terminal buffer'],
            ['reboot',     'Restart simulation'],
            ['screenshot', 'Capture desktop as PNG'],
            ['theme',      'Change UI intensity (low|mid|high)'],
          ]],
          ['NETWORK', [
            ['ping <host>',   'Probe a network node'],
            ['hack <target>', 'Run intrusion sequence'],
          ]],
          ['INTEL', [
            ['sentinel <msg>', 'Query Sentinel AI'],
            ['override <key>', 'Elevate session clearance'],
            ['missions',       'View clearance progression'],
            ['echo <text>',    'Echo text'],
          ]],
        ];
        groups.forEach(([label, rows]) => {
          writeHTML(`<span style="color:var(--red-crimson);letter-spacing:2px;font-size:0.9em"> ${label}</span>`);
          rows.forEach(([k, v]) => writeHTML(`  <span style="color:var(--red-neon)">${k.padEnd(16)}</span><span style="color:var(--text-secondary)">${v}</span>`));
        });
      },
      sentinel: (args) => {
        const msg = args.join(' ').toLowerCase();
        if (!msg) return write('SENTINEL: State your inquiry, Operator.', 'accent');
        if (msg.includes('clearance')) _mSet('m_sentinel');
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
      screenshot: () => {
        write('Initializing desktop capture...', 'sys');
        if (typeof html2canvas === 'undefined') {
          return write('screenshot: html2canvas module not loaded', 'err');
        }
        
        const desktop = document.getElementById('desktop');
        html2canvas(desktop, {
          allowTaint: true,
          useCORS: true,
          scale: 1,
        }).then(canvas => {
          const link = document.createElement('a');
          link.download = `atlas_os_capture_${Date.now()}.png`;
          link.href = canvas.toDataURL();
          link.click();
          write('Desktop capture complete. File downloaded.', 'ok');
          if (window.Atlas) window.Atlas.notify('DEKSTOP_CAPTURE: SUCCESS');
        }).catch(err => {
          write('screenshot: capture failed: ' + err, 'err');
        });
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
        const levels = ['OPERATOR', 'EXECUTIVE', 'ROOT'];
        const userLevel = levels.indexOf(window.Atlas ? window.Atlas.state.clearance : 'OPERATOR');
        const html = entries.map(e => {
          if (e.type === 'folder') {
            return `<span style="color:#fbbf24">${e.name}/</span>`;
          }
          const locked = e.clearance && levels.indexOf(e.clearance) > userLevel;
          const color = locked ? 'var(--red-crimson)' : 'var(--text-primary)';
          const lock  = locked ? ' 🔒' : '';
          return `<span style="color:${color}">${e.name}${lock}</span>`;
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
          const levels = ['OPERATOR', 'EXECUTIVE', 'ROOT'];
          const userLevel = levels.indexOf(window.Atlas ? window.Atlas.state.clearance : 'OPERATOR');
          const reqLevel  = levels.indexOf(entry.clearance || 'OPERATOR');
          if (userLevel < reqLevel) {
            write(`ACCESS DENIED — ${entry.clearance} clearance required.`, 'err');
            write(`Run: override <key>  to elevate session.`, 'sys');
          } else {
            write(entry.content || '', 'sys');
            if (name === 'manifest.atlas') _mSet('m_manifest');
            if (name === 'encrypted_vault.txt') _mSet('m_vault');
            if (name === 'ops_directive.sys') _mSet('m_directive');
          }
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
      history: () => {
        if (history.length === 0) return write('No commands in history.', 'sys');
        history.forEach((cmd, i) => writeHTML(`  <span style="color:var(--text-muted)">${String(i + 1).padStart(3)}.</span>  <span style="color:var(--text-primary)">${escapeHTML(cmd)}</span>`));
      },

      ping: (args) => {
        const hostname = args[0];
        if (!hostname) return write('Usage: ping <host>', 'err');
        const KNOWN = {
          'sentinel-node': '10.66.0.1',
          'crimson-net':   '10.66.0.254',
          'mainframe':     '10.66.1.1',
          'nexus-hub':     '10.66.2.100',
          'localhost':     '127.0.0.1',
        };
        const ip = KNOWN[hostname.toLowerCase()];
        if (!ip) return write(`ping: ${hostname}: Name or service not known`, 'err');
        write(`PING ${hostname} (${ip}): 56 bytes of data`, 'sys');
        let count = 0;
        const interval = setInterval(() => {
          if (!document.body.contains(host)) { clearInterval(interval); return; }
          const rtt = (Math.random() * 4 + 0.8).toFixed(3);
          write(`64 bytes from ${ip}: icmp_seq=${count + 1} ttl=64 time=${rtt} ms`, 'ok');
          count++;
          if (count >= 4) {
            clearInterval(interval);
            write(`--- ${hostname} ping statistics ---`, 'sys');
            write(`4 packets transmitted, 4 received, 0% packet loss`, 'sys');
            if (hostname.toLowerCase() === 'sentinel-node') _mSet('m_ping');
          }
        }, 500);
      },

      hack: (args) => {
        const target = (args[0] || '').toLowerCase();
        const VALID = { 'crimson-net': '10.66.0.254', 'sentinel-node': '10.66.0.1', 'mainframe': '10.66.1.1' };
        if (!target || !VALID[target]) {
          write('Usage: hack <target>', 'err');
          write('Known targets: crimson-net  sentinel-node  mainframe', 'sys');
          return;
        }
        const ip = VALID[target];
        const lines = [
          [0,    `[INIT] Targeting ${target} (${ip}) ...`, 'sys'],
          [300,  '[SCAN] Port sweep: 22 80 443 6660 8080 9090 ...', 'sys'],
          [700,  '[SCAN] Open ports: 80/tcp  6660/tcp  9090/tcp', 'accent'],
          [1100, '[ENUM] Identifying service fingerprints...', 'sys'],
          [1500, `[ENUM] ${target} :: Atlas-NetD v3.1.2 // Crimson-Enc`, 'accent'],
          [1900, '[XPLOIT] Loading payload: buffer_overflow_v9.hex', 'sys'],
          [2300, '[XPLOIT] Injecting shellcode... ████████████████ 100%', 'sys'],
          [2700, '[AUTH] Brute-forcing session token...', 'sys'],
          [3100, '[AUTH] ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 78%', 'sys'],
          [3500, '[AUTH] ████████████████████████████████████ 100% — CRACKED', 'ok'],
          [3900, `[ACCESS] Shell established on ${target}`, 'ok'],
          [4200, `[EXFIL] Extracting encrypted data stream...`, 'sys'],
          [4600, '[EXFIL] 512 KB extracted — transfer complete.', 'ok'],
          [5000, `[DONE] Session on ${target} closed. Evidence purged.`, 'ok'],
        ];
        lines.forEach(([t, text, cls]) => setTimeout(() => write(text, cls), t));
        setTimeout(() => {
          if (target === 'crimson-net') _mSet('m_hack');
          if (window.Atlas) window.Atlas.notify(`INTRUSION: ${target} compromised.`, 5000);
        }, 5200);
      },

      missions: () => {
        const clr = window.Atlas ? window.Atlas.state.clearance : 'OPERATOR';
        writeHTML(`<span class="accent">══ ATLAS_CMD // CLEARANCE PROGRESSION ══</span>`);
        writeHTML(`<span style="color:var(--text-secondary)">Current clearance: <span style="color:var(--red-neon)">${clr}</span></span>`);
        write('', '');

        writeHTML(`<span style="color:var(--red-crimson)">EXECUTIVE CLEARANCE OBJECTIVES:</span>`);
        EXEC_MISSIONS.forEach(m => {
          const done = _mDone(m.id);
          const icon = done ? '✓' : '○';
          const col  = done ? '#4ade80' : 'var(--text-muted)';
          writeHTML(`  <span style="color:${col}">${icon}</span>  <span style="color:${done ? 'var(--text-primary)' : 'var(--text-muted)'}">${m.label}</span>  <span style="color:var(--text-muted);font-size:0.85em">[${m.hint}]</span>`);
        });

        const execAll = EXEC_MISSIONS.every(m => _mDone(m.id));
        if (execAll) {
          writeHTML(`  <span style="color:#4ade80">→ EXECUTIVE unlocked</span>`);
        }

        write('', '');
        writeHTML(`<span style="color:var(--red-crimson)">ROOT CLEARANCE OBJECTIVES: ${clr === 'OPERATOR' ? '(req EXECUTIVE)' : ''}</span>`);
        ROOT_MISSIONS.forEach(m => {
          const done = _mDone(m.id);
          const locked = clr === 'OPERATOR';
          const icon = done ? '✓' : (locked ? '🔒' : '○');
          const col  = done ? '#4ade80' : (locked ? 'var(--text-muted)' : 'var(--text-secondary)');
          writeHTML(`  <span style="color:${col}">${icon}</span>  <span style="color:${col}">${m.label}</span>  <span style="color:var(--text-muted);font-size:0.85em">[${m.hint}]</span>`);
        });
        const rootAll = ROOT_MISSIONS.every(m => _mDone(m.id));
        if (rootAll && clr !== 'ROOT') {
          writeHTML(`  <span style="color:#4ade80">→ ROOT unlocked</span>`);
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
        _mSet('m_neofetch');
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
      if (window.AtlasSound) window.AtlasSound.keyClick();
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
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const val = input.value.trim();
        const parts = val.split(/\s+/);
        
        if (parts.length === 1) {
          // Autocomplete command
          const cmdPart = parts[0];
          const matches = Object.keys(COMMANDS).filter(k => k.startsWith(cmdPart));
          if (matches.length === 1) {
            input.value = matches[0] + ' ';
          } else if (matches.length > 1) {
            write('Matches: ' + matches.join('  '), 'sys');
          }
        } else {
          // Autocomplete filename (last argument)
          const filePart = parts[parts.length - 1];
          const entries = VFS.ls(cwd).map(e => e.name);
          const matches = entries.filter(n => n.startsWith(filePart));
          if (matches.length === 1) {
            parts[parts.length - 1] = matches[0];
            input.value = parts.join(' ');
          } else if (matches.length > 1) {
            write('Matches: ' + matches.join('  '), 'sys');
          }
        }
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
        ctx.shadowBlur = 0;
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
      { name: 'encrypted_vault.txt', type: 'file', clearance: 'EXECUTIVE', content: 'RESTRICTED DATA // SIZ-CORP ENCRYPTION v4.0\n\n[FILE BLOB: 0x48657850...]\n\nNOTICE: This file is classified EXECUTIVE-level.\n\nLOG_FRAGMENT:\n- EXEC_KEY: "ORION_77"\n- ROOT_KEY: "VOID_OVERRIDE_00"\n- SENTINEL_NODE: ONLINE' },
    ],
    '/Documents': [
      { name: 'operator_notes.txt', type: 'file', content: 'Nothing to see here yet. The operator keeps their secrets close.' },
      { name: 'crimson_protocol.txt', type: 'file', content: 'PROTOCOL CRIMSON\n================\n\n1. All ingress is logged.\n2. All egress is encrypted.\n3. Trust nothing outside the shell.\n' },
    ],
    '/System': [
      { name: 'kernel.atlas', type: 'file', clearance: 'ROOT', content: 'ATLAS KERNEL v1.0.0 // ROOT ACCESS\n==================================\nCORE_HASH: 0xDEADBEEF_CAFEBABE\nINIT_VECTOR: 0xFF3131FF3131FF31\nSENTINEL_LINK: ACTIVE\nCRIMSON_NET: ENCRYPTED\n\n[CLASSIFIED: SIZ-CORP INTERNAL USE ONLY]' },
      { name: 'ops_directive.sys', type: 'file', clearance: 'EXECUTIVE', content: 'DIRECTIVE // OPERATION: NIGHTFALL\n==================================\nPhase 1 — Establish Neuro-Link uplink\nPhase 2 — Deploy sentinel nodes\nPhase 3 — Engage Crimson Protocol\n\nAUTHORIZED BY: SIZ-CORP EXECUTIVE COUNCIL' },
      { name: 'config.json', type: 'file', content: '{\n  "theme": "midnight",\n  "accent": "#FF3131",\n  "operator": "itzzzshxdow"\n}' },
    ],
    '/Logs': [
      { name: 'boot.log', type: 'file', content: '[2026-04-21 00:00:00] Atlas boot sequence initiated.\n[2026-04-21 00:00:01] Crimson Net handshake OK.\n[2026-04-21 00:00:02] Operator session unlocked.\n' },
    ],
  };

  const VFS = {
    data: (() => {
      // Version bump: clear stale VFS that predates clearance gating
      const VFS_VERSION = '2';
      if (localStorage.getItem('atlas_vfs_ver') !== VFS_VERSION) {
        localStorage.removeItem('atlas_vfs');
        localStorage.setItem('atlas_vfs_ver', VFS_VERSION);
      }
      return JSON.parse(localStorage.getItem('atlas_vfs')) || DEFAULT_FS;
    })(),
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
  // SENTINEL CHAT
  // =============================================================
  const SENTINEL_RESPONSES = {
    hello:    ["Connection established. How can I assist you, Operator?", "Neuro-Link handshake complete. State your directive."],
    hi:       ["Greetings, Operator. Sentinel online.", "Connection secured. What do you need?"],
    status:   ["All systems nominal. Crimson Net signal: 100%. Neuro-Link: STABLE.", "Atlas grid is green. No anomalies detected in current session."],
    help:     ["I can answer questions about system status, clearance levels, protocols, and active directives.", "Try asking about: status, clearance, protocol, files, or the Crimson Net."],
    clearance:["Current session clearance is reported by your operator console. Use `override` in the terminal to elevate.", "OPERATOR → EXECUTIVE → ROOT. Each tier unlocks additional classified files and system access."],
    protocol: ["PROTOCOL CRIMSON: All ingress logged. All egress encrypted. Trust nothing outside the shell.", "The Crimson Protocol is active. Sentinel nodes are monitoring all data streams."],
    files:    ["Classified files require EXECUTIVE or ROOT clearance. Use `cat` in Atlas_CMD after elevating your session.", "The VFS holds several restricted entries. Elevate your clearance to access them."],
    sentinel: ["I am SENTINEL — Atlas OS's neural intelligence layer. Encrypted, isolated, and loyal to the operator.", "Designation: SENTINEL. Purpose: secure operator advisory. Threat model: external only."],
    root:     ["ROOT access is the highest clearance tier. Override key: VOID_OVERRIDE_00. Use with caution.", "ROOT clearance unlocks full kernel access. Exercise discretion."],
    executive:["EXECUTIVE clearance is tier 2. Override key: ORION_77.", "Elevated to EXECUTIVE? You now have access to classified directives and the ops vault."],
  };

  function sentinelReply(input) {
    const q = input.toLowerCase().trim();
    for (const [key, replies] of Object.entries(SENTINEL_RESPONSES)) {
      if (q.includes(key)) return replies[Math.floor(Math.random() * replies.length)];
    }
    const fallback = [
      "Query logged. Insufficient data to generate a precise response.",
      "I'm processing your request through the Neuro-Link. No direct match found in my knowledge lattice.",
      "Interesting input, Operator. My current directives don't cover that domain.",
      "Signal unclear. Rephrase your query for better pattern matching.",
    ];
    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  function openSentinel() {
    const root = el('div', { class: 'app-sentinel' });

    const header = el('div', { class: 'sentinel-header' });
    const icon = el('i', { class: 'ph-fill ph-cpu' });
    const txt = el('div', { class: 'sentinel-header-text' });
    const title = el('div', { class: 'sentinel-header-title' }); title.textContent = 'SENTINEL';
    const sub = el('div', { class: 'sentinel-header-sub' }); sub.textContent = 'Neural Advisory Interface // Encrypted';
    txt.append(title, sub);
    const dot = el('div', { class: 'sentinel-status' });
    header.append(icon, txt, dot);

    const msgs = el('div', { class: 'sentinel-messages' });
    const typing = el('div', { class: 'sentinel-typing' }); typing.textContent = 'SENTINEL is thinking...';

    const inputRow = el('div', { class: 'sentinel-input-row' });
    const input = el('input', { class: 'sentinel-input', type: 'text', placeholder: 'Send a message to SENTINEL...' });
    const send = el('button', { class: 'sentinel-send' }); send.textContent = 'SEND';
    inputRow.append(input, send);

    root.append(header, msgs, typing, inputRow);

    function addMsg(text, who) {
      const wrap = el('div', { class: `sentinel-msg ${who}` });
      const label = el('div', { class: 'sentinel-msg-label' });
      label.textContent = who === 'user' ? 'OPERATOR' : 'SENTINEL';
      const bubble = el('div', { class: 'sentinel-msg-bubble' });
      bubble.textContent = text;
      wrap.append(label, bubble);
      msgs.insertBefore(wrap, typing);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function submit() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      addMsg(text, 'user');
      typing.classList.add('visible');
      msgs.scrollTop = msgs.scrollHeight;
      setTimeout(() => {
        typing.classList.remove('visible');
        addMsg(sentinelReply(text), 'ai');
      }, 700 + Math.random() * 600);
    }

    send.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });

    // Boot greeting
    setTimeout(() => addMsg("Sentinel online. Neuro-Link encrypted. How can I assist you, Operator?", 'ai'), 300);

    return WM.create({
      title: 'SENTINEL',
      icon: 'ph-fill ph-cpu',
      width: 500, height: 520,
      content: root,
      appKey: 'sentinel',
      onFocus: () => input.focus(),
    });
  }

  // =============================================================
  // SETTINGS APP
  // =============================================================
  function openSettings() {
    const root = el('div', { class: 'app-settings' });

    const SECTIONS = [
      { id: 'identity', label: 'IDENTITY',  icon: 'ph ph-user' },
      { id: 'display',  label: 'DISPLAY',   icon: 'ph ph-monitor' },
      { id: 'sound',    label: 'SOUND',     icon: 'ph ph-speaker-high' },
      { id: 'system',   label: 'SYSTEM',    icon: 'ph ph-gear' },
    ];

    const sidebar = el('div', { class: 'settings-sidebar' });
    const content = el('div', { class: 'settings-content' });
    root.append(sidebar, content);

    // Build nav
    const navItems = {};
    SECTIONS.forEach(({ id, label, icon }) => {
      const item = el('div', { class: 'settings-nav-item', 'data-section': id });
      const i = el('i', { class: icon });
      const span = el('span'); span.textContent = label;
      item.append(i, span);
      item.addEventListener('click', () => activateSection(id));
      sidebar.appendChild(item);
      navItems[id] = item;
    });

    const sections = {};
    function activateSection(id) {
      Object.values(navItems).forEach(n => n.classList.remove('active'));
      Object.values(sections).forEach(s => s.classList.remove('active'));
      navItems[id].classList.add('active');
      sections[id].classList.add('active');
    }

    // — IDENTITY —
    const secIdentity = el('div', { class: 'settings-section', id: 'sec-identity' });
    const idTitle = el('div', { class: 'settings-title' }); idTitle.textContent = 'IDENTITY';

    const nameRow = el('div', { class: 'settings-row' });
    const nameLbl = el('div', { class: 'settings-label' }); nameLbl.textContent = 'OPERATOR NAME';
    const nameInput = el('input', { class: 'settings-input', type: 'text', placeholder: 'itzzzshxdow' });
    nameInput.value = localStorage.getItem('atlas_operator') || 'itzzzshxdow';
    nameRow.append(nameLbl, nameInput);

    const saveName = el('button', { class: 'settings-save' }); saveName.textContent = 'SAVE';
    saveName.addEventListener('click', () => {
      const name = nameInput.value.trim() || 'itzzzshxdow';
      localStorage.setItem('atlas_operator', name);
      if (window.Atlas) window.Atlas.notify(`Operator name set: ${name}`);
    });

    const authRow = el('div', { class: 'settings-row' });
    const authLbl = el('div', { class: 'settings-label' }); authLbl.textContent = 'GOOGLE ACCOUNT';
    authRow.appendChild(authLbl);

    const authBtns = el('div', { class: 'settings-btn-row' });
    const signInBtn = el('button', { class: 'settings-btn' }); signInBtn.textContent = 'SIGN IN WITH GOOGLE';
    const signOutBtn = el('button', { class: 'settings-btn' }); signOutBtn.textContent = 'SIGN OUT';

    const authStatus = el('div', { class: 'settings-label' });
    authStatus.style.marginTop = '8px';

    function updateAuthUI() {
      const fb = window.AtlasFirebase;
      if (fb && fb.AtlasAuth) {
        const user = fb.AtlasAuth.currentUser();
        if (user) {
          authStatus.textContent = `Signed in as: ${user.displayName || user.email}`;
          signInBtn.style.display = 'none';
          signOutBtn.style.display = '';
          nameInput.value = localStorage.getItem('atlas_operator') || user.displayName || 'itzzzshxdow';
        } else {
          authStatus.textContent = 'Not signed in.';
          signInBtn.style.display = '';
          signOutBtn.style.display = 'none';
        }
      } else {
        authStatus.textContent = 'Firebase not ready.';
        signInBtn.style.display = 'none';
        signOutBtn.style.display = 'none';
      }
    }

    signInBtn.addEventListener('click', async () => {
      const fb = window.AtlasFirebase;
      if (!fb || !fb.AtlasAuth) return;
      try {
        const result = await fb.AtlasAuth.signIn();
        const user = result.user;
        if (!localStorage.getItem('atlas_operator')) {
          localStorage.setItem('atlas_operator', user.displayName || 'operator');
          nameInput.value = user.displayName || 'operator';
        }
        updateAuthUI();
        if (window.Atlas) window.Atlas.notify(`Authenticated: ${user.displayName || user.email}`);
      } catch (err) {
        if (window.Atlas) window.Atlas.notify('Sign-in failed or cancelled.');
      }
    });

    signOutBtn.addEventListener('click', async () => {
      const fb = window.AtlasFirebase;
      if (!fb || !fb.AtlasAuth) return;
      await fb.AtlasAuth.signOut();
      updateAuthUI();
      if (window.Atlas) window.Atlas.notify('Signed out of Google account.');
    });

    authBtns.append(signInBtn, signOutBtn);
    authRow.append(authBtns, authStatus);

    // Sync auth UI when Firebase reports state change
    window.addEventListener('atlas:authchange', updateAuthUI);
    updateAuthUI();

    secIdentity.append(idTitle, nameRow, saveName, authRow);

    // — DISPLAY —
    const secDisplay = el('div', { class: 'settings-section', id: 'sec-display' });
    const dispTitle = el('div', { class: 'settings-title' }); dispTitle.textContent = 'DISPLAY';

    const wpRow = el('div', { class: 'settings-row' });
    const wpLbl = el('div', { class: 'settings-label' }); wpLbl.textContent = 'WALLPAPER';
    wpRow.appendChild(wpLbl);

    const wpBtns = el('div', { class: 'settings-btn-row' });
    const currentWp = localStorage.getItem('atlas_wallpaper') || 'grid';
    ['grid', 'particles', 'blackhole'].forEach(mode => {
      const btn = el('button', { class: 'settings-btn' + (mode === currentWp ? ' active' : '') });
      btn.textContent = mode.toUpperCase();
      btn.addEventListener('click', () => {
        wpBtns.querySelectorAll('.settings-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (window.Atlas) window.Atlas.setWallpaper(mode);
      });
      wpBtns.appendChild(btn);
    });
    wpRow.appendChild(wpBtns);
    secDisplay.append(dispTitle, wpRow);

    // — SOUND —
    const secSound = el('div', { class: 'settings-section', id: 'sec-sound' });
    const sndTitle = el('div', { class: 'settings-title' }); sndTitle.textContent = 'SOUND';

    const sndRow = el('div', { class: 'settings-row' });
    const sndLbl = el('div', { class: 'settings-label' }); sndLbl.textContent = 'AMBIENT SOUNDS';
    sndRow.appendChild(sndLbl);

    const sndBtns = el('div', { class: 'settings-btn-row' });
    const sndOn = el('button', { class: 'settings-btn' + (window.AtlasSound && window.AtlasSound.isEnabled() ? ' active' : '') });
    sndOn.textContent = 'ENABLED';
    const sndOff = el('button', { class: 'settings-btn' + (window.AtlasSound && !window.AtlasSound.isEnabled() ? ' active' : '') });
    sndOff.textContent = 'DISABLED';

    sndOn.addEventListener('click', () => {
      if (window.AtlasSound && !window.AtlasSound.isEnabled()) window.AtlasSound.toggle();
      sndOn.classList.add('active'); sndOff.classList.remove('active');
    });
    sndOff.addEventListener('click', () => {
      if (window.AtlasSound && window.AtlasSound.isEnabled()) window.AtlasSound.toggle();
      sndOff.classList.add('active'); sndOn.classList.remove('active');
    });

    sndBtns.append(sndOn, sndOff);
    sndRow.appendChild(sndBtns);
    secSound.append(sndTitle, sndRow);

    // — SYSTEM —
    const secSystem = el('div', { class: 'settings-section', id: 'sec-system' });
    const sysTitle = el('div', { class: 'settings-title' }); sysTitle.textContent = 'SYSTEM';

    const rebootRow = el('div', { class: 'settings-row' });
    const rebootLbl = el('div', { class: 'settings-label' }); rebootLbl.textContent = 'ACTIONS';
    const rebootBtn = el('button', { class: 'settings-btn' }); rebootBtn.textContent = 'REBOOT';
    rebootBtn.addEventListener('click', () => location.reload());
    const clearBtn = el('button', { class: 'settings-btn' }); clearBtn.textContent = 'CLEAR VFS';
    clearBtn.addEventListener('click', () => {
      localStorage.removeItem('atlas_vfs');
      localStorage.removeItem('atlas_vfs_ver');
      if (window.Atlas) window.Atlas.notify('VFS cleared. Reboot to apply.');
    });
    const actRow = el('div', { class: 'settings-btn-row' });
    actRow.append(rebootBtn, clearBtn);
    rebootRow.append(rebootLbl, actRow);
    secSystem.append(sysTitle, rebootRow);

    // Mount all sections
    sections['identity'] = secIdentity;
    sections['display']  = secDisplay;
    sections['sound']    = secSound;
    sections['system']   = secSystem;
    content.append(secIdentity, secDisplay, secSound, secSystem);

    activateSection('identity');

    return WM.create({
      title: 'SETTINGS',
      icon: 'ph ph-gear',
      width: 540, height: 460,
      content: root,
      appKey: 'settings',
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
      ['OPERATOR', localStorage.getItem('atlas_operator') || 'itzzzshxdow'],
      ['CLEARANCE', window.Atlas ? window.Atlas.state.clearance : 'EXECUTIVE'],
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
      if (d.appKey === key && ['sysmonitor','files','sysinfo','browser','sentinel','settings'].includes(key)) {
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
      case 'sentinel':   return openSentinel();
      case 'settings':   return openSettings();
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
    localStorage.setItem('atlas_theme', mode);
  }

  // Restore persisted theme on load
  const _savedTheme = localStorage.getItem('atlas_theme');
  if (_savedTheme) setTheme(_savedTheme);

  return { launch, openTerminal, openSysMonitor, openBrowser, openFiles, openNotepad, openSysInfo, openSentinel, openSettings, themeCycle, setTheme, VFS };
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
