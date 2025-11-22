const apiBase = '/api/links';

function el(q) { return document.querySelector(q); }
function elAll(q) { return Array.from(document.querySelectorAll(q)); }

if (location.pathname === '/' ) {
  const tbody = el('#linksTbody');
  const emptyState = el('#emptyState');
  const targetInput = el('#target');
  const customCode = el('#customCode');
  const submitBtn = el('#submitBtn');
  const refreshBtn = el('#refreshBtn');
  const searchInput = el('#search');

  async function fetchLinks() {
    try {
      const res = await fetch(apiBase);
      const rows = await res.json();
      renderRows(rows);
    } catch (err) {
      console.error(err);
    }
  }

  function truncate(s, n=60){ return s.length>n? s.slice(0,n-1)+'…': s; }

  function renderRows(rows) {
    tbody.innerHTML = '';
    if (!rows || rows.length===0) {
      emptyState.classList.remove('hidden');
      return;
    }
    emptyState.classList.add('hidden');
    for (const r of rows) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-2 align-top font-mono">${r.code}</td>
        <td class="p-2 align-top"><a class="underline" href="${r.target}" target="_blank">${truncate(r.target,80)}</a></td>
        <td class="p-2 align-top">${r.clicks}</td>
        <td class="p-2 align-top">${r.last_clicked ? new Date(r.last_clicked).toLocaleString() : '-'}</td>
        <td class="p-2 align-top">
          <button data-copy="${r.code}" class="copyBtn mr-2 px-2 py-1 border rounded">Copy</button>
          <a class="mr-2 px-2 py-1 border rounded" href="/code/${r.code}">Stats</a>
          <button data-delete="${r.code}" class="delBtn px-2 py-1 bg-red-100 rounded">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    }
    elAll('.delBtn').forEach(b => b.onclick = async e => {
      const code = e.target.dataset.delete;
      if (!confirm(`Delete ${code}?`)) return;
      await fetch(`${apiBase}/${code}`, { method: 'DELETE' });
      await fetchLinks();
    });
    elAll('.copyBtn').forEach(b => b.onclick = e => {
      const code = e.target.dataset.copy;
      navigator.clipboard.writeText(window.location.origin + '/' + code);
      alert('Copied: ' + window.location.origin + '/' + code);
    });
  }

  submitBtn.onclick = async (ev) => {
    ev.preventDefault();
    submitBtn.disabled = true;
    const target = targetInput.value.trim();
    const code = customCode.value.trim();
    const body = { target };
    if (code) body.code = code;

    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      });
      if (res.status === 201) {
        targetInput.value = '';
        customCode.value = '';
        await fetchLinks();
        alert('Link created');
      } else {
        const err = await res.json();
        alert('Error: ' + (err.error || 'unknown'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
    submitBtn.disabled = false;
  };

  refreshBtn.onclick = fetchLinks;
  searchInput.oninput = async (e) => {
    const q = e.target.value.toLowerCase();
    const res = await fetch(apiBase);
    const rows = await res.json();
    const filtered = rows.filter(r => r.code.toLowerCase().includes(q) || r.target.toLowerCase().includes(q));
    renderRows(filtered);
  }

  fetchLinks();
}

if (location.pathname.startsWith('/code/')) {
  const main = el('#main');
  const code = location.pathname.split('/code/')[1];
  async function fetchOne() {
    try {
      const res = await fetch(`/api/links/${code}`);
      if (res.status === 404) {
        main.innerText = 'Not found';
        return;
      }
      const row = await res.json();
      main.innerHTML = `
        <div class="text-sm text-gray-600">Code: <span class="font-mono">${row.code}</span></div>
        <div class="mt-2">Target: <a href="${row.target}" target="_blank" class="underline">${row.target}</a></div>
        <div class="mt-2">Clicks: <strong>${row.clicks}</strong></div>
        <div class="mt-2">Last clicked: <strong>${row.last_clicked ? new Date(row.last_clicked).toLocaleString() : '-'}</strong></div>
        <div class="mt-4">
          <a class="px-3 py-2 border rounded" href="/">Back</a>
        </div>
      `;
    } catch (err) {
      main.innerText = 'Error loading';
    }
  }
  fetchOne();
}
