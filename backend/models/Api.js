const mongoose = require('mongoose');

const apiSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add an API name'],
    },
    description: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Api', apiSchema);
