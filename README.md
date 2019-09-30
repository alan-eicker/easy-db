# EasyDB

EasyDB is a user-friendly database utility that wraps Sqlite in an easy-to-use JavaScript API. What makes EasyDB so easy you ask? Well, you get all ot the great functionality of a Sqlite database without having to know or write SQL!

EasyDB is a wrapper utility that provides simple javascript functions for performing SQL commands like `CREATE`, `SELECT`, `UPDATE`, and `DELETE` without even having to write a single line of SQL.

## Setup

#### Install Sqlite

```
npm i -S sqlite
```

#### Import and Initialize EasyDB

This will create a database file called `database.sqlite` in your projects root directory.

```javascript
// db-connection.js

import EasyDB from 'easy-db';

const db = new EasyDB();
db.connect();

export default db;
```

You can then use your database instance by importing it.

```javascript
import db from './db-connection.js';
```

## Handling Query Responses

All Queries are asyncronous and can be handled in two different ways.

#### Promise

```javascript
db.select({ table: 'Products' })
  .then(res => {
    // do somthing with response
  })
  .catch(err => console.log(err));
```

#### Async/Await

```javascript
const result = await db.select({ table: 'Products' });
```

## API

As mentioned above, EasyDB's API allow you to run SQL commands like `CREATE`, `SELECT`, `UPDATE`, and `DELETE`. 

### `db.createTable`

Creates a new database table.

Parameters:

* table `String`
* columns `Object`

Returns:

* `Object`
  * created `Number`

```javascript
const response = await db.createTable('Products', {
  categoryId: 'number',
  name: 'string',
  description: 'string',
  price: 'float',
});

// Returns => { "created": 1 }
```

SQL generated by the above example.

```sql
CREATE TABLE Products (
  id INTEGER PRIMARY KEY,
  categoryId INTEGER,
  name VARCHAR,
  description VARCHAR,
  price REAL
)
```

**Data Types**

- **string** - The value is a text string
- **number** - The value is a integer (whole number)
- **float** - The value is a floating point (decimal)
- **blob** - The value is a blob of data, stored exactly as it was input

### `db.select`

Selects one or more records from a database table.

Parameters:

* Options `Object`
  * table `String`
  * columns `String`
  * filters `String` *Optional*

Returns:

* `Object`
  * data `Array|Object`

```javascript
// Returns all records with all columns
const response = await db.select({ table: 'Products' })

// Returns all records with only specified columns
const response = await db.select({
  table: 'Products',
  columns: 'categoryId, name, price',
})

const response = await db.select({
  table: 'Products',
  filters: 'categoryId = 100, price < 100.00',
})
```

SQL generated by the above examples.

```sql
SELECT * 
FROM Products;

SELECT categoryId, name, price 
FROM Products;

SELECT * 
FROM Products
WHERE categoryId = 100 AND price < 100.00;
```

### `db.insert`

Inserts one or more records into a database table.

Parameters:

* Options `Object`
  * table `String`
  * records `Array|Object`

Returns:

* `Object`
  * insertedIds `Array`

```javascript
// Inserts a single record
const response = await db.insert({
  table: 'Products',
  records: {
    categoryId: 100,
    name: 'iPad Pro - 12.9 inch - 256 GB',
    description: 'First generation 12.9 inch iPad Pro',
    price: 1149.99,
  },
});
 
// Returns => { insertedIds: [32445] }

// Inserts multiple records
const response = await db.insert({
  table: 'Products',
  records: [
    {
      categoryId: 100,
      name: 'iPad Pro - 12.9 inch - 256 GB',
      description: 'First generation 12.9 inch iPad Pro',
      price: 1149.99,
    },
    {
      categoryId: 100,
      name: 'Sony DVD Player',
      description: 'Used Sony DBD Player. Good condition.',
      price: 49.99,
    },
  ]
});

// Returns => { insertedIds: [32445, 45656] }
```

SQL generated by above example.

```sql
INSERT INTO Products (
  categoryId, 
  name, 
  description,
  price
) 
VALUES (
  100,
  'iPad Pro - 12.9 inch - 256 GB'
  'First generation 12.9 inch iPad Pro',
  1149.99
);
```

### `db.update`

Updates one or more records in a database table.

Parameters:

* Options `Object`
  * table `String`
  * updates `Array|Object`
  * filters `String` *Optional*

Returns:

* `Object`
  * changes `Number`

```javascript
// Updates a single record
const response = await db.update({
  table: 'Products',
  updates: {
    id: 33545,
    price: 1049.99,
  },
});

// Returns => { "changes": 1 }

// Updates multiple records
const response = await db.update({
  table: 'Products',
  updates: [
    {
      id: 33545,
      price: 1049.99,
    },
    {
      id: 34556,
      price: 35.99,
    },
  ],
});

// Updates all records that match the filter criteria
const response = await db.update({
  table: 'Products',
  updates: { status: 'out of stock' },
  filters: `inventoryQuantity = 0`,
});
```

SQL generated by above examples.

```sql
UPDATE Products SET price = 1049.99 WHERE id = 33545;

UPDATE Products SET price = 1049.99 WHERE id = 33545;
UPDATE Products SET price = 35.99 WHERE id = 34556;

UPDATE Products 
SET status = 'out of stock' 
WHERE inventoryQuantity = 0;
```

### `db.delete`

Deletes one or more records from a database table.

Parameters:

* Options `Object`
  * table `String`
  * ids `Array` *Optional*
  * filters `Object` *Optional*

Returns:

* `Object`
  * deleted `Number`

```javascript
// Deletes a single record from a table
const response = await db.delete({
  table: 'Products', 
  ids: 68282,
});

// Returns => { "deleted": 1 }

//  Deletes multiple records from a table
const response = await db.delete({
  table: 'Products',
  ids: [68282, 33559, 26657],
});

// Returns => { "deleted": 3 }

// you can also delete records based on specific filters
const response = await db.delete({
  table: 'Products',
  filters: `status = 'discontinued'`,
});

// Returns => { "deleted": 3 }
```

SQL generated by above example.

```sql
DELETE FROM Products
WHERE id = 68282;

DELETE FROM Products
WHERE status = 'discontinued';
```

### `db.combineAllTables`

Creates a object combining the data from all tables in your database.

For example, if our database has two tables, Users & Products, we can run `db.combineAllTables` to combine all of the data from those two tables into one JSON object.

```javascript
const megastate = await db.combineAllTables();
```

```json
{"Users":[{"id":12696,"name":"Samuel Jackson","email":"s.jackson@gmail.com"},{"id":19767,"name":"Steve Wilson","email":"s.wilson@gmail.com"},{"id":49329,"name":"Brett Small","email":"bsmall@yahoo.com"},{"id":51342,"name":"Sam Small","email":"sam.small@gmail.com"},{"id":55553,"name":"Bill Johnson","email":"bill_johnson@gmail.com"},{"id":57417,"name":"Greg Smith","email":"bsmith@gmail.com"},{"id":65495,"name":"Bill Johnson","email":"bill_johnson@gmail.com"},{"id":66725,"name":"Paul Black","email":"p.black@gmail.com"},{"id":95385,"name":"Bill Johnson","email":"bill_johnson@gmail.com"},{"id":98693,"name":"Bill Johnson","email":"bill_johnson@gmail.com"}],"Products":[{"id":33236,"categoryId":200,"name":"Tennis Ball Set","description":"4 tennis balls","price":7.99}]}
```

## Dropping Tables

Sometimes it is neccessary to drop old tables. To prevent accidental table drops, a CLI is available to assist you with dropping tables.

#### Set up a a CLI script

In your package.json

```json
{
  "scripts": {
    "drop": "node ./easy-db/cli"
  }
}
```

#### Run the CLI

In a terminal window

```
npm run drop
```

#### Follow the CLI prompts

The CLI will provide you with prompts to drop a table.

After you have select the table you want to drop and confirmed your selection, the CLI will execute the `DROP TABLE` command. Once finished, you will recieve confirmation from the CLI that the table has been dropped.

<img src="https://raw.githubusercontent.com/alaneicker/easy-db/master/cli-screen-1.png" width="550">

<img src="https://raw.githubusercontent.com/alaneicker/easy-db/master/cli-screen-2.png" width="550">

<img src="https://raw.githubusercontent.com/alaneicker/easy-db/master/cli-screen-3.png" width="550">

## Use Case: Node.js with GraphQL

The following example demonstrate how EasyDB can be integrated into a Node.js and GraphQL application.

```javascript
// typedefs.js

export default `
  type Query {
    products: [Product]
    product(id: Int): Product
  }
  type Mutation {
    insertProduct(
      body: [InsertProductInput]
    ): Status
    updateProduct(
      body: [UpdateProductInput]
    ): Status
    deleteProduct(
      ids: [Int]
    ): Status
    deleteDiscontinuedProducts: Status
  }
  type Product {
    id: Int
    categoryId: Int
    name: String
    price: Int
    description: String
  }
  type Status {
    insertedIds: [Int]
    deleted: Int
    changes: Int
    err: Error
  }
  type Error {
    message: String
  }
  input InsertProductInput {
    categoryId: Int!
    name: String!
    price: Int!
    description: String!
  }
  input UpdateProductInput {
    id: Int
    categoryId: Int
    name: String
    price: Int
    description: String
  }
`;
```

```javascript
// db-connection.js

import EasyDB from 'easy-db';

const db = new EasyDB();
db.connect();

export default db;
```

```javascript
// resolvers.js

import db from './db-connection';

const procucts = async () => {
  try {
    const { data } = await db.select({
      table: 'Products',
      columns: 'categoryId, name, price'
    });
    return data;
  } catch (err) {
    return { err };
  }
};

const product = async ({ id }) => {
  try {
    const { data } = await db.select({
      table: 'Products',
      filters: `id = ${id}`,
    });
    return data;
  } catch (err) {
    return { err };
  }
};

const insertProduct = async ({ records }) => {
  try {
    const status = await db.insert({
      table: 'Products',
      records,
    });
    return status;
  } catch (err) {
    return { err };
  }
};

const updateProduct = async ({ records }) => {
  try {
    const status = await db.update({
      table: 'Products',
      records,
    });
    return status;
  } catch (err) {
    return { err };
  }
};

const deleteProduct = async ({ ids }) => {
  try {
    const status = await db.delete({
      table: 'Products',
      ids,
    });
    return status;
  } catch (err) {
    return { err };
  }
};

const deleteDiscontinuedProducts = async () => {
  try {
    const status = await db.delete({
      table: 'Products',
      filters: `status = 'discountinued'`,
    });
    return status;
  } catch (err) {
    return { err };
  }
};

export {
  procucts,
  procuct,
  insertProduct,
  updateProduct,
  deleteProduct,
};
```

```javascript
// server.js 

import express from 'express';
import cors from 'cors';
import express_graphql from 'express-graphql';
import { buildSchema } from 'graphql';
import typedefs from './typedefs';
import * as rootValue from './resolvers';

const app = express();
const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV;
const schema = buildSchema(typedefs);

app.use('/graphql', cors(), express_graphql({
  schema,
  rootValue,
  graphiql: env === 'development',
}));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
```
