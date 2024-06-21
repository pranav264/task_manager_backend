const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    projectId: { type: String, required: true },
    createdBy: { type: String, required:true },
    status: { type: String, required: true },
    users: { type: Array },
})

const Tasks = mongoose.model('Tasks', taskSchema);

module.exports = Tasks;