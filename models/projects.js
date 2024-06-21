const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdBy: { type: String, required: true },
    users: { type: Array },
})

const Projects = mongoose.model('Projects', projectSchema);

module.exports = Projects;