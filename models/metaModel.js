const db = require("../config/db");

const LAYER_TABLES = [
  { layer: "bounds", table: "bounds" },
  { layer: "building", table: "building" },
  { layer: "garbadge", table: "garbadge" },
  { layer: "road", table: "road" },
  { layer: "instruction-generated", table: "instruction-generated" }
];

function quoteIdent(identifier) {
  return `"${String(identifier).replaceAll('"', '""')}"`;
}

function tableRefName(tableName) {
  return `public.${quoteIdent(tableName)}`;
}

async function getTableMetadata(tableName) {
  const quotedTable = quoteIdent(tableName);
  const regclassQuery = await db.query("SELECT to_regclass($1) AS table_ref", [
    tableRefName(tableName)
  ]);
  const exists = regclassQuery.rows[0].table_ref !== null;

  if (!exists) {
    return {
      exists: false,
      count: 0,
      geometryColumn: null,
      geometryType: null,
      srid: null,
      columns: [],
      sampleRows: []
    };
  }

  const countQuery = await db.query(`SELECT COUNT(*)::int AS count FROM ${quotedTable}`);
  const geometryQuery = await db.query(
    `SELECT f_geometry_column, type, srid
     FROM geometry_columns
     WHERE f_table_schema = 'public' AND f_table_name = $1
     LIMIT 1`,
    [tableName]
  );
  const columnsQuery = await db.query(
    `SELECT column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [tableName]
  );
  const sampleRowsQuery = await db.query(
    `SELECT to_jsonb(t) - 'geom' AS row_data
     FROM ${quotedTable} t
     LIMIT 3`
  );

  return {
    exists: true,
    count: countQuery.rows[0].count,
    geometryColumn: geometryQuery.rows[0] ? geometryQuery.rows[0].f_geometry_column : null,
    geometryType: geometryQuery.rows[0] ? geometryQuery.rows[0].type : null,
    srid: geometryQuery.rows[0] ? geometryQuery.rows[0].srid : null,
    columns: columnsQuery.rows,
    sampleRows: sampleRowsQuery.rows.map((item) => item.row_data)
  };
}

async function getDbMeta() {
  const layerMeta = [];

  for (const item of LAYER_TABLES) {
    const metadata = await getTableMetadata(item.table);
    layerMeta.push({
      layer: item.layer,
      table: item.table,
      ...metadata
    });
  }

  let buildingNature = [];
  let roadLanes = [];
  const buildingExistsQuery = await db.query("SELECT to_regclass($1) AS table_ref", [
    tableRefName("building")
  ]);
  const roadExistsQuery = await db.query("SELECT to_regclass($1) AS table_ref", [
    tableRefName("road")
  ]);

  if (buildingExistsQuery.rows[0].table_ref !== null) {
    const buildingNatureQuery = await db.query(
      `SELECT nature, COUNT(*)::int AS count
       FROM building
       GROUP BY nature
       ORDER BY count DESC`
    );
    buildingNature = buildingNatureQuery.rows;
  }

  if (roadExistsQuery.rows[0].table_ref !== null) {
    const roadLanesQuery = await db.query(
      `SELECT nblanes, COUNT(*)::int AS count
       FROM road
       GROUP BY nblanes
       ORDER BY nblanes`
    );
    roadLanes = roadLanesQuery.rows;
  }

  return {
    database: process.env.DB_NAME || "spatial_garbage",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    schema: "public",
    generatedAt: new Date().toISOString(),
    layers: layerMeta,
    stats: {
      buildingNature,
      roadLanes
    }
  };
}

module.exports = {
  getDbMeta
};
