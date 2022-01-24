const { client } = require("./client");
const { dbFields } = require("./posts");

async function getAllComments() {
  try {
    const { rows: allComments } = await client.query(`
SELECT *
FROM comment;
`);
    return allComments;
  } catch (err) {
    console.error(err);
  }
}

async function getAllPostComments(post_id) {
  try {
    const { rows: postcomments } = await client.query(
      `
        SELECT *
        FROM comment
        WHERE post_id = $1;
        `,
      [post_id]
    );

    return postcomments;
  } catch (err) {
    console.error(err);
  }
}

async function createComment({ author_id, post_id, content, is_approved }) {
  try {
    const {
      rows: [newComment],
    } = await client.query(
      `
INSERT INTO comment (author_id, post_id, content, is_approved)
VALUES ($1, $2, $3, $4)
RETURNING *;
`,
      [author_id, post_id, content, is_approved]
    );

    return newComment;
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

async function addCommentToPost(post_id, comment_id) {
  try {
      const{rows: comments}= await client.query(`
      SELECT comment.author_id, comment.content
      FROM comment
      JOIN post ON post.id = comment.post_id
      WHERE comment.id IN (${binds});
      `,commentIds);

      for (const comment of commentsToReturn){
          const commentstoAdd = comments.filter(comment=> comment.post_id === comment.id)
      }
  } catch (err) {
    console.error(err);
  }
}

async function getCommentsByUser(author_id){
    try{
const {rows: userComments}= await client.query(`
SELECT *
FROM comment
WHERE author_id = $1;
`,[author_id]);

return userComments
    }catch(err){
        console.error(err);
    }
}

async function editComment(id, { ...fields }) {
  try {
  } catch (err) {
    console.error(err);
  }
}

async function destroyComment(id) {
  try {
  } catch (err) {
    console.error(err);
  }
}

module.exports={
    createComment
}