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
    let data = await parseData(usersFile);

      // Return with a message if the user already exists - do nothing
    if (data.users.find(x => x.username === username)) {
      return res.status(400).json({ message: 'User already exists' })
    }

    else { // Create user if it does not exist
      data.users.push({ username: username, password: password, score: score });
      await saveData(usersFile, data);
      return res.status(201).json({ message: 'Successfully created user', body: req.body });
    }

  } catch (error) {
    return res.status(500).json({ statusCode: 500, message: 'Internal server error', error: error.message });
  }
})

router.delete('/', async function (req, res, next) {
  try {
    const { username } = req.body;
    let data = parseData(usersFile);
    let dataToKeep = data.users.filter(x => x.username !== username);

    // Send a bad request - user to delete does not exist
    if (!data.users.find(x => x.username === username))
      res.status(400).json({ message: 'User does not exist or has been deleted in a prior action', user: req.body })

    else { // Delete user
      data.users = dataToKeep;
      saveData(usersFile, data);
      res.status(200).json({ message: 'Successfully deleted user:', user: req.body });
    }

  } catch (error) {
    console.log(error);
  }
})

module.exports = router;
