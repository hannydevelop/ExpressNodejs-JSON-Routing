const express = require('express');
var router = express.Router();
var db = require('../db.json')

router.get('/choice', (req, res) => {
    //get an array of choices
    res.json(db.choices)
});

router.get('/choice/1', (req, res) => {
    //get an array of first choice only
    res.json(db.choices[0])
});

router.get('/choice/2', (req, res) => {
    //get an array of second choice only
    res.json(db.choices[1])
});

router.get('/choice/inner', (req, res) => {
    //get value from first choice parameter
    res.json(db.choices[1].title)
    //this can be used getting first or second choice parameter
});

router.get('/outer', (req, res) => {
    //get value not in an array
    res.json(db.completeness)
});

router.post('/choice', (req, res) => {
    const choice = req.body
    //this can be tested with postman
    res.json(choice)
});

router.get('/', (req, res) => {
    // set response header
    res.writeHead(200, { 'Content-Type': 'text/html' });

    // set response content    
    res.write('<html><body><p>Greetings from stop amazing!</p></body></html>');
    res.end();
});

module.exports = router;