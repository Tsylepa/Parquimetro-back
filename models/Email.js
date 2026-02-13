const mongoose = require("mongoose");

const { Schema } = mongoose;

const emailSchema = new Schema(
  {
    enc: {
      type: String,
      required: true,
    },
    email: [String],
  },
  {
    timestamps: true,
    collection: "emails", // Specify the collection name
  }
);

const Email = mongoose.model("Email", emailSchema);

module.exports = {
  Email,
  emailSchema,
};
