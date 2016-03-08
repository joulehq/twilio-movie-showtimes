/**
 * This is the boilerplate repository for creating Twilio Joules which can be used as a webhook.
 */

/*
 * The handler function for all API endpoints.
 * The `event` argument contains all input values.
 *    event.httpMethod, The HTTP method (GET, POST, PUT, etc)
 *    event.{pathParam}, Path parameters as defined in your .joule.yml
 *    event.{queryStringParam}, Query string parameters as defined in your .joule.yml
 */
var Response = require('joule-node-response');
var Showtimes = require('./showtimes');
var twilio = require('twilio');
var TwimlResponse = require('twilio').TwimlResponse;

var CONST = {
  initialState: 'start',
  timeout: 10,
  finishOnKey: '#',
  baseUrl: 'https://api.joule.run/jmathai/twilio-movie-showtimes',
  twimlSayOptions: {
      voice:'woman'
  }
};


var start = function(event, response) {
  var twimlResponse = new TwimlResponse();

  twimlResponse.gather({
      finishOnKey: '#',
      action: CONST.baseUrl+'/theaters'
    }, function() {
      this.say('Hello, I\'m Rachel. Enter your zipcode and I will look up movie showtimes for you.', CONST.twimlSayOptions);
    }
  );
  response.send(twimlResponse.toString());
};

var theaters = function(event, response) {
  var zipcode = event.post['Digits']
      , showtimes = new Showtimes(zipcode, {})
      , twimlResponse = new TwimlResponse();
  console.log(zipcode);
  showtimes.getTheaters(function(err, theaters) {
    if(err) {
      console.log(err);
      twimlResponse.say('Oh no! I don\'t know what happened. I\'ll redirect you to the main menu.', CONST.twimlSayOptions);
      response.send(twimlResponse.toString());
      return;
    }

    var res = [];
    for(var i=0; i<theaters.length; i++) {
      if(i > 4) {
        break;
      }
      res.push({id: theaters[i].id, name: theaters[i].name});
    }

    twimlResponse.say('Looks like I found ' + theaters.length + ' theaters in your area. Here are the top ' + res.length + '.', CONST.twimlSayOptions);
    twimlResponse.gather({
      finishOnKey: '#',
      action: CONST.baseUrl+'/movies?zipcode='+zipcode
    }, function() {
      var counter = 1;
      for(var j=0; j<res.length; j++) {
        this.say('Press ' + counter + ' for ' + res[j].name, CONST.twimlSayOptions);
        if(j <= res.length-1) {
          this.pause({length: 1});
        }
        counter++;
      }
    });

    response.send(twimlResponse.toString());
  });
};

var movies = function(event, response) {
  var showtimes = new Showtimes(event.query['zipcode'], {})
      , twimlResponse = new TwimlResponse();
  showtimes.getTheaters(function(err, theaters) {
    var movies
        , theater;
    if(err) {
      console.log(err);
      twimlResponse.say('Oh no! I don\'t know what happened. I\'ll redirect you to the main menu.', CONST.twimlSayOptions);
      response.send(twimlResponse.toString());
      return;
    }
    
    var counter = 1;
    for(var i in theaters) {
      if(counter == event.post['Digits']) {
        theater = theaters[i];
        movies = theater['movies'];
        break;
      }
      counter++;
    }

    twimlResponse.say('I found ' + movies.length + ' movies playing at ' + theater.name + '. Here are the top 5. You can press the movie\'s number at any time and I\'ll send you a link to purchase tickets.', CONST.twimlSayOptions);
    twimlResponse.gather({
      finishOnKey: '#',
      action: CONST.baseUrl+'/showtimes?theater='+theater.id
    }, function() {
      var counter = 1;
      for(var j=0; j<movies.length; j++) {
        this.say('Press ' + counter + ' for ' + movies[j].name, CONST.twimlSayOptions);
        if(j <= movies.length-1) {
          this.pause({length: 1});
        }
        
        if(j > 4) {
          break;
        }
        counter++;
      }
    });

    response.send(twimlResponse.toString());
  });

};

var showtimes = function(event, response) {
  var movie
      , twimlResponse = new TwimlResponse();


  showtimes.getTheater(event.query['theater'], function(err, theater) {
    var movies = theater.movies
        , movie
        , showtimes
        , counter = 1;
    for(var i in movies) {
      if(counter == event.post['Digits']) {
        movie = movies[i];
        showtimes = movie.showtimes;
        break;
      }
    }
  });
};

exports.handler = function(event, context) {
  var response = new Response()
      , thisState = CONST.initialState
      , thisStateMap;

  if(event.path.length > 0) {
    thisState = event.path[0];
  }

  response.setContext(context);
  response.setContentType('application/xml');
  
  switch(thisState) {
    case 'start':
      start(event, response);
      break;
    case 'theaters':
      theaters(event, response);
      break;
    case 'movies':
      movies(event, response);
      break;
    case 'showtimes':
      sms(event, response);
      break;
  }
};
