
exports.handler = function (event, context) {

    context = context || {
        succeed: function() {console.log('succeed')},
        fail: function() {console.log('fail')}
    }

    try {

        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.d0747b60-f451-4571-aafe-7bfae72e5e43") {
             context.fail("Invalid Application ID");
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};


function onLaunch (launchRequest, session, callback) {
    getWelcomeResponse(callback);
}

function onIntent (intentRequest, session, callback) {

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    if ("HowManyPlayersIntent" === intentName) {
        readScript(callback, intent);
    } else {
        throw "Invalid intent";
    }
}

function getWelcomeResponse (callback) {

    var howManyPlayers ='<speak> How many players would you like to play with?</speak>';

    callback({}, buildSpeechletResponse(howManyPlayers, "no", false));
}

function readScript (callback, intent) {

    var sessionAttributes = {};

    var numPlayers = intent.slots.numPlayers.value;

    console.log('*** numplayers %s', numPlayers);

    var redPlayers;

    if (numPlayers == '5' || numPlayers == '6') {
        redPlayers = '2';

    } else if (numPlayers == '7' || numPlayers == '8' || numPlayers == '9') {
        redPlayers = '3';

    } else if (numPlayers == '10') {
        redPlayers = '4';

    } else {
        console.log('****** unable to categorize number of players');
    }

    var shouldEndSession = true;

    var speechOutput = '<speak> Reading for {numPlayers}. \
        Everyone close your eyes and put your thumbs down. \
        <break time="1s"/> \
        All red players open your eyes and put your thumbs up. \
        There should be exactly {redPlayers} of you. \
        <break time="5s"/> \
        Red players close your eyes. \
        <break time="1s"/> \
        Mordred put your thumb down. \
        All other reds, keep your thumbs up. \
        <break time="1s"/> \
        Merlin, open your eyes. You should see {visibleReds} thumbs. \
        Mordred is hidden from you. \
        <break time="5s"/> \
        Merlin, close your eyes. \
        <break time="1s"/> \
        The assassin, put your thumb down. \
        Merlin, put your thumb up. \
        <break time="1s"/> \
        Merlin and Morgana should have their thumbs up. \
        <break time="1s"/> \
        Percival, open your eyes. You should see two thumbs. \
        One is Merlin, your ally. The other is Morgana, your enemy. \
        <break time="3s"/> \
        Percival, close your eyes. \
        <break time="1s"/> \
        Everyone put your thumbs down. \
        <break time="1s"/> \
        Take your hand back, and open your eyes. \
        </speak>'
        .replace('{numPlayers}', numPlayers)
        .replace('{redPlayers}', redPlayers)
        .replace('undefined', 'oops')
        .replace('{visibleReds}', (redPlayers - 1));

    if (parseInt(numPlayers) > 10 || parseInt(numPlayers) < 5) {
        speechOutput = "<speak>Please say a number between five and ten.</speak>";
        shouldEndSession = false;
    }

    if (numPlayers == '?') {
        speechOutput = "<speak>Can you please say that number again?</speak>";
        shouldEndSession = false;
    }

    var repromptText = "You should have listened the first time.";

    console.log('speechOutput %s', speechOutput);

    callback(sessionAttributes,
        buildSpeechletResponse(speechOutput, repromptText, shouldEndSession));
}

function buildSpeechletResponse (output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse (sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}