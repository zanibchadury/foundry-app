const { pool } = require("../config/db");

const CATEGORIES = ["Product", "Tool", "Service", "Community", "Research"];

async function listIdeas(req, res, next) {
  try {
    const { category, sort } = req.query;
    let sql = "SELECT * FROM ideas";
    const params = [];

    if (category && CATEGORIES.includes(category)) {
      sql += " WHERE category = ?";
      params.push(category);
    }

    sql += sort === "new" ? " ORDER BY created_at DESC" : " ORDER BY votes DESC, created_at DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
}

async function getIdea(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT * FROM ideas WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Idea not found" });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function createIdea(req, res, next) {
  try {
    const { title, description, category, author } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: "title, description and category are required" });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `category must be one of: ${CATEGORIES.join(", ")}` });
    }

    const [result] = await pool.query(
      "INSERT INTO ideas (title, description, category, author, votes) VALUES (?, ?, ?, ?, 0)",
      [title, description, category, author || "Anonymous"]
    );

    const [rows] = await pool.query("SELECT * FROM ideas WHERE id = ?", [result.insertId]);
    res.status(201).json({ message: "Idea submitted", data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updateIdea(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, category, status } = req.body;

    const [existing] = await pool.query("SELECT * FROM ideas WHERE id = ?", [id]);
    if (existing.length === 0) return res.status(404).json({ message: "Idea not found" });

    const updated = {
      title: title ?? existing[0].title,
      description: description ?? existing[0].description,
      category: category ?? existing[0].category,
      status: status ?? existing[0].status,
    };

    await pool.query(
      "UPDATE ideas SET title = ?, description = ?, category = ?, status = ? WHERE id = ?",
      [updated.title, updated.description, updated.category, updated.status, id]
    );

    const [rows] = await pool.query("SELECT * FROM ideas WHERE id = ?", [id]);
    res.json({ message: "Idea updated", data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function deleteIdea(req, res, next) {
  try {
    const [result] = await pool.query("DELETE FROM ideas WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Idea not found" });
    res.json({ message: "Idea deleted" });
  } catch (err) {
    next(err);
  }
}

async function upvoteIdea(req, res, next) {
  try {
    const [result] = await pool.query("UPDATE ideas SET votes = votes + 1 WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Idea not found" });

    const [rows] = await pool.query("SELECT * FROM ideas WHERE id = ?", [req.params.id]);
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { listIdeas, getIdea, createIdea, updateIdea, deleteIdea, upvoteIdea, CATEGORIES };
