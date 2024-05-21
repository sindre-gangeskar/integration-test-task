var express = require('express');
var router = express.Router();

const path = require('path');
const fs = require('fs');
const usersFile = path.resolve(__dirname, '../data/users.json');

const { parseData, saveData } = require('../data/js/custom');

/* GET home page. */
router.get('/', function (req, res, next) {
  try {
    const data = parseData(usersFile);
    if (data)
      res.status(200).json(data.users);

    else res.status(404).json({ message: 'Failed retrieving users - could not be found' });

  } catch (error) {
    if (error)
      console.log(error);
    res.status(500).json({ statusCode: 500, message: 'Internal server error', error: error })
  }
});

router.post('/', async function (req, res, next) {
  try {
    const { username, password, score } = req.body;
    let data = parseData(usersFile);

    if (data.users.find(x => x.username === username))
      res.status(400).json({ message: 'User already exists' });

    else {
      data.users.push({ username: username, password: password, score: score });
      saveData(usersFile, data);
      res.status(201).json({ message: 'Successfully created user', body: req.body });
    }

  } catch (error) {
    console.log(error);
  }
})

router.delete('/', async function (req, res, next) {
  try {
    const { username } = req.body;
    let data = parseData(usersFile);
    let dataToKeep = data.users.filter(x => x.username !== username);
    
    if (!data.users.find(x => x.username === username))
      res.status(400).json({ message: 'User does not exist or has been deleted in a prior action', user: req.body })
    
    else {
      data.users = dataToKeep;
      saveData(usersFile, data);
      res.status(200).json({ message: 'Successfully deleted user:', user: req.body });
    }

  } catch (error) {
    console.log(error);
  }
})

module.exports = router;
