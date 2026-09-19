import sqlite from "sqlite";

const getDataType = (type = "") => {
  switch (String(type).toLowerCase()) {
    case "":
    case "null":
      return "NULL";
    case "string":
    case "text":
      return "TEXT";
    case "number":
    case "integer":
    case "int":
      return "INTEGER";
    case "float":
    case "double":
    case "decimal":
      return "REAL";
    case "boolean":
      return "INTEGER";
    case "blob":
      return "BLOB";
    default:
      return "TEXT";
  }
};

const normalizeFilterString = (filters) => {
  if (!filters) {
    return "";
  }

  const filterClauses = Array.isArray(filters)
    ? filters
    : typeof filters === "string"
      ? filters
          .split(/,(?=(?:[^']*'[^']*')*[^']*$)/)
          .map((filter) => filter.trim())
          .filter(Boolean)
      : [];

  return filterClauses.length ? `WHERE ${filterClauses.join(" AND ")}` : "";
};

class EasyDB {
  constructor(dbPath = `${process.cwd()}/database.sqlite`) {
    this.dbPath = dbPath;
    this.dbPromise = null;
  }

  connect(dbPath = this.dbPath) {
    this.dbPath = dbPath;
    this.dbPromise = sqlite.open(this.dbPath);
    console.log(`Connected to database: ${this.dbPath}`);
    return this.dbPromise;
  }

  async createTable(tableName, tableColumns = {}) {
    try {
      if (!tableName || !tableColumns || typeof tableColumns !== "object") {
        throw new Error("A table name and columns object are required.");
      }

      const db = await this.dbPromise;
      const columnEntries = Object.entries(tableColumns);
      const columns = ["id INTEGER PRIMARY KEY"];

      columnEntries.forEach(([key, value]) => {
        if (key === "id") {
          return;
        }

        columns.push(`${key} ${getDataType(value)}`);
      });

      await db.run(`CREATE TABLE ${tableName} (${columns.join(", ")})`);
      return { created: true };
    } catch (err) {
      console.log(
        `Error: Database table ${tableName} could not be created`,
        err,
      );
      return { err };
    }
  }

  async combineAllTables() {
    try {
      const db = await this.dbPromise;
      const result = await db.all(`
        SELECT name FROM sqlite_master
        WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
      `);

      const tables = result.map((table) => table.name);
      const combinedData = {};

      for (const table of tables) {
        combinedData[table] = await db.all(`SELECT * FROM ${table}`);
      }

      return combinedData;
    } catch (err) {
      return { err };
    }
  }

  async select({ table, columns = "*", filters, isArray = true }) {
    try {
      const db = await this.dbPromise;
      const whereClause = normalizeFilterString(filters);
      const data = await db[isArray ? "all" : "get"](`
        SELECT ${columns}
        FROM ${table}
        ${whereClause}
      `);

      return { data };
    } catch (err) {
      console.log(`Error: could not select from table ${table}`, err);
      return { err };
    }
  }

  async insert({ table, records }) {
    try {
      const db = await this.dbPromise;
      const rows = Array.isArray(records) ? records : [records];

      const results = await Promise.all(
        rows.map((record) => {
          const row = {
            id: Math.floor(Math.random() * 90000) + 10000,
            ...record,
          };
          const values = Object.values(row);
          const columns = Object.keys(row).join(",");
          const placeholders = Array(values.length).fill("?").join(",");

          return db.run(
            `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
            values,
          );
        }),
      );

      const insertedIds = results.map((result) => result.lastID);
      console.log("Record created successfully");
      return { insertedIds };
    } catch (err) {
      console.log("Error: New record could not be created", err);
      return { err };
    }
  }

  async update({ table, updates, filters }) {
    try {
      const db = await this.dbPromise;
      const updateList = Array.isArray(updates) ? updates : [updates];

      const queryPromise = await Promise.all(
        updateList.map(async (update) => {
          const { id, ...cols } = update;
          const values = Object.values(cols);
          const columns = Object.keys(cols)
            .map((key) => `${key} = ?`)
            .join(", ");

          if (!columns) {
            return { changes: 0 };
          }

          const whereClause =
            id !== undefined && id !== null
              ? `WHERE id = ${id}`
              : normalizeFilterString(filters);

          return db.run(
            `
            UPDATE ${table}
            SET ${columns}
            ${whereClause}
          `,
            values,
          );
        }),
      );

      const changes = queryPromise.reduce(
        (total, result) => total + (result.changes || 0),
        0,
      );
      console.log("Record updated successfully");
      return { changes };
    } catch (err) {
      console.log("Error: Record could not be updated", err);
      return { err };
    }
  }

  async delete({ table, ids, filters }) {
    try {
      const db = await this.dbPromise;
      let deleted = 0;

      if (ids) {
        const idList = Array.isArray(ids) ? ids : [ids];
        const result = await Promise.all(
          idList.map((id) => db.run(`DELETE FROM ${table} WHERE id = ${id}`)),
        );

        deleted += result.reduce(
          (total, next) => total + (next.changes || 0),
          0,
        );
      }

      if (filters) {
        const { changes } = await db.run(`
          DELETE FROM ${table}
          ${normalizeFilterString(filters)}
        `);
        deleted += changes || 0;
      }

      console.log("Record successfully deleted");
      return { deleted };
    } catch (err) {
      console.log("Error: Record could not be deleted", err);
      return { err };
    }
  }
}

export default EasyDB;
