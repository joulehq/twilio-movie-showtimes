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

var CONST = {
  initialState: 'start',
  timeout: 10,
  finishOnKey: '#',
  baseUrl: 'https://api.joule.run/jmathai/twilio-movie-showtimes'
};
var stateMap = {
  start: {
    action: 'gather',
    say: 'Press one or two',
    url: CONST.baseUrl+'/greet'
  },
  greet: {
    action: 'say',
    say: 'You entered a value'
  }
};

var TwimlGenerator = function() {
  this.generate = function (action, say, url) {
    switch(action) {
      case 'gather':
        return '<?xml version="1.0" encoding="UTF-8"?> <Response> <Gather timeout="10" finishOnKey="*" action="'+url+'"> <Say>'+say+'</Say> </Gather> </Response>';
      case  'say':
        return '<?xml version="1.0" encoding="UTF-8"?> <Response> <Say>'+say+'</Say></Response>';
    }
  };
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
      , twimlGenerator = new TwimlGenerator()
      , thisState = CONST.initialState
      , thisStateMap;

  if(event.path.length > 0 && typeof(stateMap[event.path[0]]) !== 'undefined') {
    thisState = event.path[0];
  }

  response.setContext(context);
  response.setContentType('application/xml');

  thisStateMap = stateMap[thisState];
  response.send(twimlGenerator.generate(thisStateMap.action, thisStateMap.say, thisStateMap.url));
};
