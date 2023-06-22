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

// Add postProcess to inject Grapesjs code
async function postProcess(tempath) {
    let dataVal = await fetch('http://localhost:3000/pageOne').then(response => { return response.json() })    // this dummy value works now to append one page.
    let editor = grapesjs.init({ headless: true });
    console.log(dataVal)
    editor.loadData(dataVal)
    let mainPage = `<template>${editor.getHtml()}</template> <style></style>`
    fs.appendFileSync(`${tempath}/src/views/Home.vue`, mainPage, (err) => {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
    });

    // write import into router's index.js
    var data = fs.readFileSync(`${tempath}/src/router/index.js`).toString().split("\n")
    let name = 'About'
    data.splice(0, 0, `import ${name}` + ` from '../views/${name}'`);
    var text = data.join("\n");

    fs.writeFileSync(`${tempath}/src/router/index.js`, text, function (err) {
        if (err) return err;
    });

    // write routes into router's index.js
    // make this a function and return line number
    let file = fs.readFileSync(`${tempath}/src/router/index.js`, "utf8");
    let arr = file.split(/\r?\n/);
    let lineNum = 0;
    arr.forEach((line, idx) => {
        if (line.includes("routes: [")) {
            lineNum = idx + 1;
        }
    });
    var data = fs.readFileSync(`${tempath}/src/router/index.js`).toString().split("\n");
    let value =
        `
    {
        path: '/',
        name: ${name},
        component: ${name}
    },
    `
    data.splice(lineNum, 0, value);
    var text = data.join("\n");

    fs.writeFileSync(`${tempath}/src/router/index.js`, text, function (err) {
        if (err) return err;
    });

    // this will be useful https://stackoverflow.com/questions/23036918/in-node-js-how-to-read-a-file-append-a-string-at-a-specified-line-or-delete-a


    return true;
}

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
