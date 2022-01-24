const { client } = require("./client");
const bcrypt = require("bcrypt");
const { dbFields } = require("./posts");

async function createUser({ email, password, first_name, last_name }) {
  const SALT_COUNT = 10;
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO users(email, password, first_name, last_name)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `,
      [email, hashedPassword, first_name, last_name]
    );

    delete user.password;
    return user;
  } catch (err) {
    console.error(err);
  }
}

async function getUser({ email, password }) {
  try {
    const user = await getUserbyEmail(email);
    const hashedPassword = user.password;

    const compare = await bcrypt.compare(password, hashedPassword);

    if (!compare) {
      return;
    }

    delete user.password;
    return user;
  } catch (err) {
    console.error(err);
  }
}

async function getUserById(id) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
SELECT *
FROM users
WHERE id = $1;
`,
      [id]
    );
    delete user.password;
    return user;
  } catch (err) {
    console.error(err);
  }
}

async function getUserbyEmail(email) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
SELECT *
FROM users
WHERE email = $1;
`,
      [email]
    );

    return user;
  } catch (err) {
    console.error(err);
  }
}

async function editUser(id, { ...fields }) {
  const { insert, vals } = dbFields(fields);
  try {
    const user = await getUserById(id);
    const hashedPassword = user.password;
    const compare = await bcrypt.compare(password, hashedPassword);

    if (!compare) {
      return;
    }
    const {
      rows: [updateUser],
    } = await client.query(
      `
    UPDATE users
    SET ${insert}
    WHERE id = ${id}
    RETURNING *;
    `,
      vals
    );

    return updateUser;
  } catch (err) {
    console.error(err);
  }
}

async function destoryUser(id) {
  try {
    const {
      rows: [deletedUser],
    } = await client.query(
      `
      DELETE
      FROM users
      WHERE id = $1;
      `,
      [id]
    );

    return deletedUser;
  } catch (err) {
    console.error(err);
  }
}
module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserbyEmail,
  editUser,
  destoryUser,
};
