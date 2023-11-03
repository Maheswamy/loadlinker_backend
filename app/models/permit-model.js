const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const permitSchema = new Schema({
  state: String,
});

const Permit = model("Permit", permitSchema);

module.exports = Permit;
