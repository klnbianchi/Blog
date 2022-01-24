const { client } = require("./client");
const { createComment } = require("./comment");

async function createPost({
  author_id,
  title,
  content,
  published_time,
  likes,
  status,
  comments = []
}) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
INSERT INTO post (author_id, title, content, published_time, likes, status)
VALUES ($1,$2,$3,$4,$5,$6)
RETURNING *;
`,
      [author_id, title, content, published_time, likes, status]
    );
    const commentList = await createComment(comments);

    return await addCommentToPost(post.id, commentList);
  } catch (err) {
    console.error(err);
  }
}

async function getAllPosts() {
  try {
    const { rows: allPosts } = await client.query(`
        SELECT *
        FROM post;
        `);

    return allPosts;
  } catch (err) {
    console.error(err);
  }
}

async function createPostComment(post_id, comment_id){
    try{
await client.query(`
INSERT INTO post_comment(post_id, comment_id)
VALUES ($1, $2);
`, [post_id, comment_id]);
    }catch(err){
        console.error(err);
    }
}

async function addCommentToPost(post_id, commentList) {
  try {
     const createPostCommentPromises = commentList.map(comment=>createPostComment(post_id,comment.id));
     await Promise.all(createPostCommentPromises);
     return await getPostById(post_id);
      }catch (err) {
    console.error(err);
  }
}

async function getPostById(id) {
  try {
    const {
      rows: [post],
    } = await client.query(`
      SELECT *
      FROM post
      WHERE id = $1;
      `,[id]);
    //add comment to post
const {rows: comments}= await client.query(`
SELECT comment.*
FROM comment
JOIN post_comment ON comment.id = post_comment.comment_id
WHERE post_comment.post_id = $1;
`,[id]);

post.comments = comments;

return post;
  } catch (err) {
    console.error(err);
  }
}

async function getPostByUser(id) {
  try {
    const { rows } = await client.query(
      `
      SELECT *
      FROM post
      WHERE author_id = $1;
      `,
      [id]
    );

    return rows;
  } catch (err) {
    console.error(err);
  }
}

function dbFields(fields) {
  const insert = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  const select = Object.keys(fields)
    .map((_, index) => `$${index + 1}`)
    .join(", ");

  const vals = Object.values(fields);
  return { insert, select, vals };
}

async function updatePost(id, { ...fields }) {
  const { insert, vals } = dbFields(fields);
  try {
    const {
      rows: [updatedPost],
    } = await client.query(
      `
      UPDATE post
      SET ${insert}
      WHERE id= ${id}
      RETURNING *;
      `,
      vals
    );

    return updatedPost;
  } catch (err) {
    console.error(err);
  }
}

async function destroyPost(id) {
  try {
    const {
      rows: [deletedPost],
    } = await client.query(
      `
      DELETE
      FROM post
      WHERE id = $1;
      `,
      [id]
    );

    return deletedPost;
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getPostByUser,
  updatePost,
  destroyPost,
  dbFields,
};
