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
var response = require('joule-node-response');

exports.handler = function(event, context) {
  if(typeof(event.Body) === "undefined") {
    response.error400(context, 'No Body passed in');
    return;
  }
  response.successRaw(context, "<Response><Sms>"+event.Body+"</Sms></Response>");
};
