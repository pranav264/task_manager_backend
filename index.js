const express = require('express');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT;

const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);

app.listen(port, () => {
    console.log(`Server is listening at port: ${port}`);
})