const express = require("express");
const router = express.Router();

const {
  listIdeas,
  getIdea,
  createIdea,
  updateIdea,
  deleteIdea,
  upvoteIdea,
} = require("../controllers/idea.controller");

router.get("/", listIdeas);
router.post("/", createIdea);
router.get("/:id", getIdea);
router.put("/:id", updateIdea);
router.delete("/:id", deleteIdea);
router.post("/:id/upvote", upvoteIdea);

module.exports = router;
