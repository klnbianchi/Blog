// code to build and initialize DB goes here
const { client } = require("./client");
const {createUser} = require('./');

async function dropTables() {
  try {
    console.log("Dropping all tables...");
    await client.query(`
DROP TABLE IF EXISTS followers;
DROP TABLE IF EXISTS post_tag;
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS comment;
DROP TABLE IF EXISTS post;
DROP TABLE IF EXISTS users;
`);
  } catch (err) {
    console.error("Error while dropping tables...");
    throw err;
  }
}

async function createTables() {
  console.log("Starting to create tables...");
  try {
    await client.query(`
  CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL
  );
  CREATE TABLE post(
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL,
    published_time TIMESTAMPTZ,
    likes INTEGER DEFAULT 0,
    status BOOLEAN DEFAULT false
  );
  CREATE TABLE comment(
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES post(id),
    content VARCHAR(255) NOT NULL,
    is_approved BOOLEAN DEFAULT false
  );
  CREATE TABLE tag(
    id SERIAL PRIMARY KEY,
    content VARCHAR(255)
  );
  CREATE TABLE post_tag(
    post_id INTEGER REFERENCES post(id),
    tag_id INTEGER REFERENCES tag(id)
  );
  CREATE TABLE followers(
    user1 INTEGER REFERENCES users(id),
    user2 INTEGER REFERENCES users(id)
  );

  `);
  } catch (err) {
    console.error("Error while creating tables...");
    throw err;
  }
}

async function buildTables() {
  try {
    client.connect();
    await dropTables();
    await createTables();
  } catch (error) {
    throw error;
  }
}

async function populateInitialData() {
  console.log("starting to create initial users...");
  try {
    const newUsers = [
      {
        email: "klnbianchi@gmail.com",
        password: "emmeandnolie",
        first_name: "Kendra",
        last_name: "Bianchi",
      },
      {
        email: "jersb9@gmail.com",
        password: "mywiferules",
        first_name: "Jeramie",
        last_name: "Bianchi",
      },
      {
        email: "nolieray@gmail.com",
        password: "mymomisthebest",
        first_name: "Nolan",
        last_name: "Bianchi",
      },
      {
        email: "emmerowan@gmail.com",
        password: "mynameisemme",
        first_name: "Emme",
        last_name: "Bianchi",
      },
    ];
    const users = await Promise.all(newUsers.map(createUser));
    console.log("Users created:");
    console.log(users);
    console.log("Finished creating users!");
  } catch (error) {
    console.error('Error creating users!')
    throw error;
  }
}

buildTables()
  .then(populateInitialData)
  .catch(console.error)
  .finally(() => client.end());
