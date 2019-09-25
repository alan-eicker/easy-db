import db from './db-connection';

const megastate = async () => {
  const megastate = await db.combineAllTables();
  return megastate;
}

const users = async () => {
  const { data } = await db.select('Users', ['*']);
  return data;
};

const user = async ({ id }) => {
  const { data } = await db.selectOne('Users', ['*'], { id });
  return data;
};

const insertUser = async ({ body }) => {
  const response = await db.insert('Users', body);
  return response;
};

const updateUser = async ({ body }) => {
  const response = await db.updateById('Users', body);
  return response;
};

const deleteUser = async ({ ids }) => {
  const response = await db.deleteById('Users', ids);
  return response;
};

export {
  users,
  user,
  insertUser,
  updateUser,
  deleteUser,
  megastate,
};