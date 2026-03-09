const featureInfoEl = document.getElementById("feature-info");
const dbMetaEl = document.getElementById("db-meta");

function escapeHtml(raw) {
  return String(raw)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resetFeatureInfo() {
  if (!featureInfoEl) {
    return;
  }
  featureInfoEl.innerHTML = '<p class="info-empty">Bấm vào đối tượng để xem thuộc tính.</p>';
}

function renderFeatureInfo(properties) {
  if (!featureInfoEl) {
    return;
  }

  const entries = Object.entries(properties || {});
  if (entries.length === 0) {
    resetFeatureInfo();
    return;
  }

  featureInfoEl.innerHTML = entries
    .map(([key, value]) => {
      const text = value === null || value === undefined ? "" : String(value);
      return `
        <div class="info-row">
          <span class="info-key">${escapeHtml(key)}</span>
          <span class="info-value">${escapeHtml(text)}</span>
        </div>
      `;
    })
    .join("");
}

function showLoadError(message) {
  if (!featureInfoEl) {
    return;
  }
  featureInfoEl.innerHTML = `<p class="load-error">${escapeHtml(message)}</p>`;
}

function markLayerUnavailable(layerName, message) {
  const input = document.querySelector(`input[data-layer="${layerName}"]`);
  if (!input) {
    return;
  }

  input.checked = false;
  input.disabled = true;

  const labelText = input.parentElement ? input.parentElement.querySelector("span") : null;
  if (labelText) {
    labelText.textContent = `${layerName} (thiếu trong DB)`;
    if (message) {
      labelText.title = message;
    }
  }
}

function formatGeneratedTime(isoString) {
  if (!isoString) {
    return "";
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  return date.toLocaleString("vi-VN", { hour12: false });
}

function renderColumns(columns) {
  if (!columns || columns.length === 0) {
    return '<p class="meta-muted">Không có thông tin cột.</p>';
  }

  return `
    <ul class="meta-columns">
      ${columns
        .map((column) => {
          const nullable = column.is_nullable === "YES" ? "null" : "not null";
          return `<li><code>${escapeHtml(column.column_name)}</code> <span>${escapeHtml(
            column.data_type
          )}</span> <em>${nullable}</em></li>`;
        })
        .join("")}
    </ul>
  `;
}

function renderSampleRows(sampleRows) {
  if (!sampleRows || sampleRows.length === 0) {
    return '<p class="meta-muted">Không có dữ liệu mẫu.</p>';
  }

  return sampleRows
    .map((row, index) => {
      return `
        <details class="meta-sample-row">
          <summary>Mẫu #${index + 1}</summary>
          <pre>${escapeHtml(JSON.stringify(row, null, 2))}</pre>
        </details>
      `;
    })
    .join("");
}

function renderStatsBlock(title, rows, keyName) {
  if (!rows || rows.length === 0) {
    return "";
  }

  return `
    <div class="meta-stat-block">
      <h4>${escapeHtml(title)}</h4>
      <ul>
        ${rows
          .map((row) => {
            const keyValue = row[keyName] === null || row[keyName] === undefined ? "(rỗng)" : row[keyName];
            return `<li><span>${escapeHtml(keyValue)}</span><strong>${escapeHtml(row.count)}</strong></li>`;
          })
          .join("")}
      </ul>
    </div>
  `;
}

function renderLayerDetails(layer) {
  if (!layer) {
    return '<p class="meta-muted">Không có dữ liệu bảng.</p>';
  }

  return `
    <div class="meta-layer-card">
      <div class="meta-layer-body">
        <div class="meta-kv"><span>Layer</span><strong>${escapeHtml(layer.layer)}</strong></div>
        <div class="meta-kv"><span>Bảng</span><code>${escapeHtml(layer.table)}</code></div>
        <div class="meta-kv"><span>Trạng thái</span><strong class="${
          layer.exists ? "ok" : "missing"
        }">${layer.exists ? "Có" : "Thiếu"}</strong></div>
        <div class="meta-kv"><span>Bản ghi</span><strong>${escapeHtml(layer.count)}</strong></div>
        <div class="meta-kv"><span>Kiểu hình học</span><strong>${escapeHtml(
          layer.geometryType || "-"
        )}</strong></div>
        <div class="meta-kv"><span>SRID</span><strong>${escapeHtml(layer.srid || "-")}</strong></div>
        <div class="meta-kv"><span>Cột hình học</span><strong>${escapeHtml(
          layer.geometryColumn || "-"
        )}</strong></div>
        <h5>Cột dữ liệu</h5>
        ${renderColumns(layer.columns)}
        <h5>Dữ liệu mẫu</h5>
        ${renderSampleRows(layer.sampleRows)}
      </div>
    </div>
  `;
}

function renderDbMeta(meta) {
  if (!dbMetaEl) {
    return;
  }

  const summaryRows = [
    ["DB", meta.database],
    ["Host", meta.host],
    ["Port", meta.port],
    ["Schema", meta.schema],
    ["Cập nhật", formatGeneratedTime(meta.generatedAt)]
  ];

  const layers = Array.isArray(meta.layers) ? meta.layers : [];
  const defaultLayerIndex = Math.max(
    0,
    layers.findIndex((layer) => layer.exists)
  );

  const statsBlocks = [
    renderStatsBlock("Phân bố nature của building", meta.stats?.buildingNature, "nature"),
    renderStatsBlock("Phân bố số làn của road", meta.stats?.roadLanes, "nblanes")
  ].filter(Boolean);

  dbMetaEl.innerHTML = `
    <div class="meta-summary">
      ${summaryRows
        .map(([key, value]) => {
          return `<div class="meta-kv"><span>${escapeHtml(key)}</span><strong>${escapeHtml(
            value || "-"
          )}</strong></div>`;
        })
        .join("")}
    </div>
    <div class="meta-layer-picker">
      <label for="meta-layer-select">Chọn bảng</label>
      <select id="meta-layer-select" class="meta-select">
        ${
          layers.length === 0
            ? '<option value="">Không có bảng</option>'
            : layers
                .map((layer, index) => {
                  const label = layer.table || layer.layer || `Layer ${index + 1}`;
                  return `<option value="${index}">${escapeHtml(label)}</option>`;
                })
                .join("")
        }
      </select>
    </div>
    <div id="meta-layer-details" class="meta-selected"></div>
    <div class="meta-stats">${
      statsBlocks.length > 0 ? statsBlocks.join("") : '<p class="meta-muted">Chưa có thống kê bổ sung.</p>'
    }</div>
  `;

  const selectEl = dbMetaEl.querySelector("#meta-layer-select");
  const detailsEl = dbMetaEl.querySelector("#meta-layer-details");

  if (!selectEl || !detailsEl) {
    return;
  }

  function updateSelectedLayer() {
    const selectedIndex = Number(selectEl.value);
    const selectedLayer = Number.isInteger(selectedIndex) ? layers[selectedIndex] : null;
    detailsEl.innerHTML = renderLayerDetails(selectedLayer);
  }

  if (layers.length > 0) {
    selectEl.value = String(defaultLayerIndex);
  }

  updateSelectedLayer();
  selectEl.addEventListener("change", updateSelectedLayer);
}

function showDbMetaError(message) {
  if (!dbMetaEl) {
    return;
  }
  dbMetaEl.innerHTML = `<p class="load-error">${escapeHtml(message)}</p>`;
}

window.layerUi = {
  renderFeatureInfo,
  resetFeatureInfo,
  showLoadError,
  markLayerUnavailable,
  renderDbMeta,
  showDbMetaError
};
