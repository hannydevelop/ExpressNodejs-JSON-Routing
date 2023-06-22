# ExpressNodejs-JSON-Routing
A simple project utilizing routing JSON file with Expressjs/Nodejs

```js
// Import dependencies
import * as fs from 'fs';
import { fileURLToPath } from 'url'
import createDirectoryContents from './utils/directory.js'
import createProject from './utils/project.js'
import * as path from 'path';
import grapesjs from 'grapesjs'
import fetch from 'node-fetch';
import  low   from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync.js'
import bodyParser from 'body-parser';
import express from 'express'
import cors from 'cors'

const adapter = new FileSync('db.json')
const db = low(adapter)

// Declare const for template directory 
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get current directory
const CURR_DIR = process.cwd();

var app = express();

/* CRUD Request for db */
app.use(bodyParser.json());
app.use(cors ({origin: "http://localhost:9000"}));

// Get a single project with its id.
app.get('/projects/:id', (req, res) => {
    const projects = db.get("projects").find((p) => p.id === req.params.id)
    res.send(projects)
})

// Get all projects.
app.get('/projects', (req, res) => {
    const projects = db.get("projects").value();
    res.send(projects)
})

// Add a project
app.post('/add', (req, res) => {
    const project = req.body;
    let lastProject = db.get("projects").takeRight(1).value()[0];
    project.id = lastProject.id + 1;
    db.get("projects").push(project).write();
    res.send(project);
})

// Edit a post
app.put('/update/:id', (req, res) => {
    let id = parseInt(req.params.id);
    db.get("projects").find({id: id}).assign(req.body).write();
    res.json("successfully edited post")
})

// Delete a post
app.delete('/delete/:id', (req, res) => {
    let id = parseInt(req.params.id);
    db.get("projects").remove({id: id}).write();
    res.json("successfully deleted post")
})

app.post('/publish', (req, res) => {
    let projectName = req.body.projectName;
    let projectType = req.body.projectType;
    let tartgetPath = path.join(CURR_DIR, projectName);
    let templatePath = path.join(__dirname, 'templates', projectType);

    // Call createProject in inquirerPrecss
    if (!createProject(tartgetPath)) {
        return;
    }

    // Call createDirectoryContents
    createDirectoryContents(templatePath, projectName);

    postProcess(tartgetPath);
})

app.listen(4000, () => console.log('server started successfully at port : 4000....'));

```

This above contains all information on how to use lowDB ^1.0.0
