/* ============================
DEFAULT IMPORTS
============================ */
const express = require('express');
const app = express();
const port = 5000;

/* ============================
IMPORT MODULES
============================ */
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const bodyParser = require('body-parser');
const Users = require('./data/users.json');

/* ============================
MIDDLEWARE
============================ */
const apiMiddleware = (req, res, next) => {
  // get the header token
  let token = req.headers['authorization'];

  if (token) {
    // attempt to decode the token
    try {
      let decoded = jwt.decode(token, app.get('jwtTokenSecret'));

      // set value
      req.user = {
        id: decoded.iss,
        email: decoded.email
      };

      // proceed with next operation
      next();
    } catch (err) {
      res.status(400).send({
        error: `Invalid or missing token.`
      });
    }
  } else {
    res.status(401).send({
      error: `Invalid or missing token.`
    });
  }
};

/* ============================
CONFIGURATIONS
============================ */
app.use(bodyParser.json());
app.set('jwtTokenSecret', 'expressjs-api-secret');

/* ============================
ENDPOINTS
============================ */
app.get('/', (req, res) => {
  let dateTime = new Date();

  res.send({
    time: dateTime.getTime()
  });
});

/* ============================
ENDPOINTS - AUTH - LOGIN
============================ */
app.post('/auth/login', (req, res) => {
  // validate if payload contains data
  if (req.body.email && req.body.password) {

    // find the user in the json data
    let findUser = Users.users.find((user) => {
      return (user.email === req.body.email) ? user : false
    });

    if (findUser) {
      // compare the encrypted password
      bcrypt.compare(req.body.password, findUser.password, (err, result) => {
        if (result === true) {
          let expiration = new Date();
          expiration.setDate(expiration.getDate() + 7); // + 7 days

          // create JSON web token
          let token = jwt.encode({
              iss: findUser.id,
              email: findUser.email,
              exp: expiration.getTime()
            },
            app.get('jwtTokenSecret')
          );

          // send data
          res.send({
            token: token,
            expires: expiration,
          });
        } else {
          res.status(403).send({
            error: `Invalid email and/or password.`
          });
        }
      });

    } else {
      res.status(404).send({
        error: `Could not find user '${req.body.email}'.`
      });
    }

  } else {
    res.status(401).send({
      error: `Invalid email and/or password.`
    });
  }
});

/* ============================
ENDPOINTS - AUTH - VERIFY
============================ */
app.get('/auth/verify', apiMiddleware, (req, res) => {
  res.send({
    data: true
  });
});


/* ============================
ENDPOINTS - API - USER
============================ */
app.get('/users/me', apiMiddleware, (req, res) => {
  res.send(req.user);
});

/* ============================
PORT LISTENING
============================ */
app.listen(port);
console.log(`Listening on port ${port}.`);
