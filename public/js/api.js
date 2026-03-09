async function fetchLayerData(layerName) {
  const response = await fetch(`/api/${layerName}`);

  if (response.status === 404) {
    let message = `Layer ${layerName} is not available in DB`;
    try {
      const payload = await response.json();
      if (payload && payload.message) {
        message = payload.message;
      }
    } catch (_error) {
      message = `Layer ${layerName} is not available in DB`;
    }

    return {
      missing: true,
      layerName,
      message
    };
  }

  if (!response.ok) {
    throw new Error(`Failed to load layer ${layerName} (${response.status})`);
  }

  return {
    missing: false,
    layerName,
    data: await response.json()
  };
}

async function fetchDbMeta() {
  const response = await fetch("/api/meta");
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Không tải được metadata DB (${response.status})`);
  }
  return response.json();
}

window.layerApi = {
  fetchLayerData,
  fetchDbMeta
};
