const db = require("../config/db");

async function hasLayerTable(tableName) {
  const normalizedTableName = tableName.replaceAll('"', "");
  const { rows } = await db.query("SELECT to_regclass($1) AS table_ref", [
    `public.${normalizedTableName}`
  ]);

  return rows[0].table_ref !== null;
}

async function getLayerGeoJSON(tableName) {
  const exists = await hasLayerTable(tableName);
  if (!exists) {
    return null;
  }

  const query = `
    SELECT jsonb_build_object(
      'type', 'FeatureCollection',
      'features', COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(
              ST_Transform(
                ST_SetSRID(
                  ST_Translate(t.geom, -229329, 287018),
                  32648
                ),
                4326
              )
            )::jsonb,
            'properties', to_jsonb(t) - 'geom'
          )
          ORDER BY t.gid
        ),
        '[]'::jsonb
      )
    ) AS geojson
    FROM ${tableName} t;
  `;

  const { rows } = await db.query(query);
  return rows[0].geojson;
}

module.exports = { getLayerGeoJSON };
