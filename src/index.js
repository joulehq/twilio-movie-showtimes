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

var CONST = {
  initialState: 'start',
  timeout: 10,
  finishOnKey: '#',
  baseUrl: 'https://api.joule.run/jmathai/twilio-movie-showtimes'
};

var start = function(event, response) {
  response.send('<?xml version="1.0" encoding="UTF-8"?> <Response> <Gather timeout="10" finishOnKey="#" action="'+CONST.baseUrl+'/greet"> <Say voice="alice">Hello, I\'m Rachel. Enter your zipcode and I will look up movie showtimes for you.</Say> </Gather> </Response>');
};

var greet = function(event, response) {
  var showtimes = new Showtimes(event.post['Digits'], {});
  showtimes.getTheaters(function(err, theaters) {
    if(err) {
      console.log(err);
      response.send('<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">Oh no! I don\'t know what happened.</Say></Response>');
    }
    
    var res = [];
    for(var i in theaters) {
      if(i > 4) {
        break;
      }
      res.push({id: theaters[i].id, name: theaters[i].name});
    }

    var out = '<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">Looks like I found ' + theaters.length + ' theaters in your area. Here are the top ' + res.length + '.</Say>';
    for(var j in res) {
      out += '<Say>' + res[j].name.replace(/[^0-9a-zA-Z ]/, '') + '</Say>';
      if(j <= res.length-1) {
        out += '<Pause length="3"/>';
      }
    }
    out += '</Response>';

    response.send(out);
  });
};

/*
<?xml version="1.0" encoding="UTF-8"?>




<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="woman">Good morning. How do you do?</Say>
    <Pause length="5"/>
    <Redirect method="POST">https://twiliowebapisample.endjin.com/api/Sample</Redirect>
</Response>
*/

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
    case 'greet':
      greet(event, response);
  }
};
