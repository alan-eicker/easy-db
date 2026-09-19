# EasyDB

EasyDB is a lightweight SQLite wrapper that exposes a simple JavaScript API for common database operations without forcing you to hand-write SQL.

## Setup

Install the dependency:

```bash
npm install sqlite
```

Then create a connection module:

```javascript
import EasyDB from "easy-db";

const db = new EasyDB();
db.connect();

export default db;
```

This creates a SQLite database file named `database.sqlite` in the current working directory.

## Query response handling

All methods are asynchronous and can be used with promises or async/await:

```javascript
db.select({ table: "Products" })
  .then((res) => {
    console.log(res.data);
  })
  .catch((err) => console.error(err));
```

```javascript
const result = await db.select({ table: "Products" });
```

## API

### `db.createTable`

Creates a new table with an automatic `id INTEGER PRIMARY KEY` column.

```javascript
const response = await db.createTable("Products", {
  categoryId: "number",
  name: "string",
  description: "string",
  price: "float",
});

// => { created: true }
```

Supported data types:

- `string` => `TEXT`
- `number` or `integer` => `INTEGER`
- `float` or `double` => `REAL`
- `boolean` => `INTEGER`
- `blob` => `BLOB`

### `db.select`

Selects records from a table.

```javascript
const allProducts = await db.select({ table: "Products" });

const filteredProducts = await db.select({
  table: "Products",
  columns: "categoryId, name, price",
  filters: ["categoryId = 100", "price < 100.00"],
});
```

The preferred `filters` format is an array of SQL condition strings. For backward compatibility, the legacy comma-separated string format is still supported and is normalized into a SQL `WHERE ... AND ...` clause.

### `db.insert`

Inserts one or more rows into a table.

```javascript
const response = await db.insert({
  table: "Products",
  records: {
    categoryId: 100,
    name: "iPad Pro - 12.9 inch - 256 GB",
    description: "First generation 12.9 inch iPad Pro",
    price: 1149.99,
  },
});

// => { insertedIds: [32445] }
```

```javascript
const response = await db.insert({
  table: "Products",
  records: [
    {
      categoryId: 100,
      name: "iPad Pro - 12.9 inch - 256 GB",
      price: 1149.99,
    },
    {
      categoryId: 100,
      name: "Sony DVD Player",
      price: 49.99,
    },
  ],
});
```

### `db.update`

Updates rows by `id` or by a filter.

```javascript
const response = await db.update({
  table: "Products",
  updates: {
    id: 33545,
    price: 1049.99,
  },
});

// => { changes: 1 }
```

```javascript
const response = await db.update({
  table: "Products",
  updates: { status: "out of stock" },
  filters: ["inventoryQuantity = 0"],
});
```

### `db.delete`

Deletes rows by `id` or by a filter.

```javascript
const response = await db.delete({
  table: "Products",
  ids: [68282, 33559],
});

// => { deleted: 2 }
```

```javascript
const response = await db.delete({
  table: "Products",
  filters: ["status = 'discontinued'"],
});
```

### `db.combineAllTables`

Returns an object keyed by table name, containing each table's rows.

```javascript
const megastate = await db.combineAllTables();
```

## Notes and improvements

This library now includes a few important fixes:

- table creation no longer corrupts the column list
- `connect()` supports a custom database path and returns the SQLite promise
- `update()` and `delete()` no longer leak filter state across records
- package metadata points to the actual library entry
- boolean and text mappings are normalized to SQLite-friendly values

## CLI usage

The CLI is still available for dropping tables interactively:

```bash
npm run drop
```

The project includes a small example app in the `example` folder for local experimentation.
