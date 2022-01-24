// code to build and initialize DB goes here
const { client } = require("./client");
const { createUser } = require("./");
const { createPost, getPostById } = require("./posts");
const {createComment} = require("./comment");

async function dropTables() {
  try {
    console.log("Dropping all tables...");
    await client.query(`
DROP TABLE IF EXISTS followers;
DROP TABLE IF EXISTS post_tag;
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS post_comment;
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
  CREATE TABLE post_comment(
    post_id INTEGER REFERENCES post(id),
    comment_id INTEGER REFERENCES comment(id)
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

async function createInitialUsers() {
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
    console.error("Error creating users!");
    throw error;
  }
}

async function createInitialPosts (){
  try{
    console.log('Starting to create initial posts...')
    const newPosts = [
      {
        author_id: 1,
        title: 'My first post',
        content: 'This post is about creating a new post...',
        published_time: '2022-01-24 19:10:25',
        likes:0,
        status: true
      },
      {
        author_id: 2,
        title: 'I am posting!',
        content: 'testing testing 123...',
        published_time: '2022-01-24 19:10:29',
        likes:0,
        status: true
      }

    ]
    const posts = await Promise.all(newPosts.map(createPost));
    console.log('Posts created:');
    console.log(posts);
    console.log('Finished creating posts!');

    const testing = await getPostById(1);
    console.log(testing, "!!!!!")
  }catch(error){
    console.error('Error creating posts!');
    throw error;
  }
}

async function createInitialComments(){
  try{
    console.log('Starting to create comments');
    const commentsToCreate=[
      {
        author_id: 4,
        post_id:1,
        content:'Wow, this is a great post!',
        is_approved: true
      },
      {
        author_id: 3,
        post_id:1,
        content:'Here is another comment on this post',
        is_approved: true
      },

    ]

    const comments = await Promise.all(commentsToCreate.map(createComment));
    console.log('Comments created:')
    console.log(comments);
    console.log('Finished creating comments:')
    
    
  }catch(error){
    console.error('Error creating comments!');
    throw error;
  }
}
async function populateInitialData(){
  try{
    await createInitialUsers();
    await createInitialPosts();
    await createInitialComments();
  }catch(error){
    throw error;
  }
}

buildTables()
  .then(populateInitialData)
  .catch(console.error)
  .finally(() => client.end());
