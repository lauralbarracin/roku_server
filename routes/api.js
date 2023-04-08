const express = require('express');
const router = express.Router();

//import the sql package
const sql = require('mysql');
const creds = require('../config/user');

//create a pool of potential connections and use the 
//sql user credentials to connect to your instnce of MySql
//on your machine
const pool = sql.createPool(creds);

router.get('/', (req, res) => {
  res.json({
    message: 'hit ums API root'
  });
})

// try to authenticate a user via the login route 
router.post("/login", (req, res) => {
  console.log('hit the login route')
  console.log('user data:', req.body);
  pool.getConnection(function (err, connection) {
    if (err) throw err;

    connection.query(`SELECT username, user_password FROM tbl_users WHERE username="${req.body.username}"`, function (error, results) {
      connection.release();

      if (error) throw error;

      let result = {
        message: ''
      }

      if (results.length == 0) {
        // no matching username..maybe provide a sign up from/button?
        result.message = 'no user';
      } else if (results[0].user_password !== req.body.password) {
        // no matching password..mark the password field on the client side
        result.message = 'wrong password'
      } else {
        result.message = 'success',

          //get rid of the user password
          delete results[0].password;
        result.user = results[0];
      }

      // Dont use the connection here, it has been returned to the pool
      res.json(result);
    });

  });

})

router.get('/users', (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) throw err;

    connection.query('SELECT * FROM tbl_users', function (error, results) {
      connection.release();

      if (error) throw error;

      results.forEach(user => {
        delete user.password;
        delete user.fname;
        delete user.lname;

      
      })

      res.json(results);
    });

  });
})

//retrieve all users from a database
router.get('/users/:user', (req, res) => {
  console.log(req.params.user);
  pool.getConnection(function (err, connection) {
    if (err) throw err; // not connected!

    // Use the connection
    connection.query(`SELECT * FROM users WHERE id=${req.params.user}`, function (error, results) {
      // When done with the connection, release it.
      connection.release();

      // Handle error after the release.
      if (error) throw error;


      //remove any sensitive info from the database(s)
      delete results[0].passwords;
      delete results[0].fname;
      delete results[0].lname;


      //Add a temp avatar if there isn't one
      if (results[0].avatar == null) {
        results[0].avatar = "temp_avatar.jpg";
      }
      console.log(results);


      // Don't use the connection here, it has been returned to the pool.
      res.json(results);
    });
  });
})
//retrieve one user from a database based on that user's ID or another field


module.exports = router;