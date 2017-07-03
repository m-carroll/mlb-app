const express = require('express'),
      app = express(),
      path = require('path'),
      request = require('request'),
      bodyParser = require('body-parser'),
      xmlparser = require('xml2json'),
      probables = require('mlbprobablepitchers'),
      PORT = process.env.PORT || 8888;

app.use(bodyParser.urlencoded({ extended: false}))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})
// app.use(express.static(__dirname + './../frontend/build'))

function padDigit(n) {
  return n < 10 ? '0' + n : String(n)
}

let date = new Date(),
    baseMLBURL = 'http://gd2.mlb.com/components/game/mlb/',
    baseMLBURLToday = `${baseMLBURL}/year_${date.getFullYear()}/month_${padDigit(date.getMonth()+1)}/day_${padDigit(date.getDate())}/`

app.get('/', (req, res) => {
})

app.get('/games/:id', (req, res) => {
  const linescore = {empty: true},
        boxscore = {empty: true},
        atBats = {empty: true},
        currBatter = {empty: true},
        gameID = req.params.id

  linescore = getLinescore(gameID, () => {
    boxscore = getBoxscore(gameID, () => {
      atBats = getAtBats(gameID, () => {
        currBatter = getBatter(gameID, () => {
          res.json({boxscore, atBats, currBatter, linescore})
        })
      })
    })
  })
})

// app.get('/preview/:id', (req, res) => {
//   resetGameData()
//   request(baseMLBURLToday + req.params.id + '/linescore.xml', (error, response, body) => {
//     if (error) {
//       console.log('error in /preview', error)
//       return
//     }
//     try {
//       res.json(JSON.parse(xmlparser.toJson(body)))
//     } catch(err) {
//       console.log('error in /preview', err)
//     }
//   })
// })

app.get('/updatenavbar', (req, res) => {
  request(baseMLBURLToday +'miniscoreboard.json', (error, response, body) => {
    if (error) {
      console.log('error in updatenavbar', error)
      return
    }
    res.send(JSON.parse(body).data.games.game)
  })
})

app.get('/gamesfordate/:datestring', (req, res) => {
  const splitDate = req.params.datestring.split('_')
  date = new Date(splitDate[0], Number(splitDate[1])-1, splitDate[2])
  const reqURL = `${baseMLBURL}/year_${date.getFullYear()}/month_${padDigit(date.getMonth()+1)}/day_${padDigit(date.getDate())}/`
  request(`${reqURL}miniscoreboard.json`, (error, response, body) => {
    if (error) {
      console.log('error in gamesfordate', error)
      return res.json([])
    }
    let games = []
    try{ 
      games = JSON.parse(body).data.games.game
    } catch (e) {
      console.log('error in gamesfordate', e)
    }
    res.json(Array.isArray(games) ? games : [])
  })
})

function getLinescore(gameID, callback) {
  request(baseMLBURLToday + gameID + '/linescore.xml', (error, response, body) => {
    if (error) {
      console.log('error in getLinescore', error)
      if (callback) callback()
      return
    }
    try {
      const linescore = JSON.parse(xmlparser.toJson(body)).game
      if (callback && linescore.status !== 'Preview') callback()
      return linescore
    } catch(e) {
      console.log('error in getLinescore', e)
    }
  })
}

function getBoxscore(gameID, callback) {
  const baseURL = baseMLBURLToday +  gameID
  request(baseURL + '/boxscore.xml', (err, res, body) => {
    if (err) {
      console.log('error in getBoxscore', err)
      if (callback) callback()
      return
    }
    try {
      if (callback) callback()
      return JSON.parse(xmlparser.toJson(body)).boxscore
    } catch (err) {
      console.log('error in getBoxscore', err)
    }
  })
}

function getAtBats(gameID, callback) {
  request(baseMLBURLToday + gameID + '/inning/inning_all.xml', (error, response, body) => {
    if (error) {
      console.log('error in getAtBats', error)
      if (callback) callback()
      return
    }
    try {
      if (callback) callback()
      return JSON.parse(xmlparser.toJson(body)).game
    } catch(e) {
      console.log('error in getAtBats', e)
    }
  })
}

function getBatter(gameID, callback) {
  request(baseMLBURLToday + gameID + '/plays.json', (error, response, body) => {
    if (error) {
      console.log('error in getBatter', error)
      if (callback) callback()
      return
    }
    try {
      if (callback) callback()
      return JSON.parse(body).data
    } catch (e) {
      console.log('error in getBatter', e)
      return {empty: true}
    }
  })
}


// app.get('*', function (req, res) {
//     res.sendFile(path.resolve((__dirname + './../frontend/build/index.html')));
// });

app.listen(8080, () => {
    console.log('Server running on: 8080');
    console.log('Kill server with CTRL + C');
});

// app.listen(PORT, () => {
//     console.log('Server running on:' + PORT);
//     console.log('Kill server with CTRL + C');
// });
