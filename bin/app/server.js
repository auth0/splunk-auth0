(function() {
  var fs              = require('fs');
  var path            = require('path');
  var splunkjs        = require('splunk-sdk');
  var Auth0           = require('auth0');

  var Async           = splunkjs.Async;
  var ModularInputs   = splunkjs.ModularInputs;
  
  var Logger          = ModularInputs.Logger;
  var Event           = ModularInputs.Event;
  var Scheme          = ModularInputs.Scheme;
  var Argument        = ModularInputs.Argument;
  var utils           = ModularInputs.utils;

  exports.getScheme = function () {
    var scheme = new Scheme('Auth0');

    scheme.description = 'Streams events of logs in the specified Auth0 account.';
    scheme.useExternalValidation = true;
    scheme.useSingleInstance = false; // Set to false so an input can have an optional interval parameter

    scheme.args = [
      new Argument({
        name:             'domain',
        dataType:         Argument.dataTypeString,
        description:      'Auth0 domain (for example contoso.auth0.com)',
        requiredOnCreate: true,
        requiredOnEdit:   false
      }),
      new Argument({
        name:             'clientId',
        dataType:         Argument.dataTypeString,
        description:      'Auth0 Client ID',
        requiredOnCreate: true,
        requiredOnEdit:   false
      }),
      new Argument({
        name:             'clientSecret',
        dataType:         Argument.dataTypeString,
        description:      'Auth0 Client Secret',
        requiredOnCreate: true,
        requiredOnEdit:   false
      })
    ];

    return scheme;
  };

  exports.validateInput = function (definition, done) {
    var auth0 = new Auth0({
      domain:       definition.parameters.domain,
      clientID:     definition.parameters.clientId,
      clientSecret: definition.parameters.clientSecret
    });

    auth0.getAccessToken(function (err) {
      clearTimeout(auth0._accessTokenTimer);
      done(err);
    });
  };

  exports.streamEvents = function (name, singleInput, eventWriter, done) {
    // Get the checkpoint directory out of the modular input's metadata
    var checkpointDir = this._inputDefinition.metadata['checkpoint_dir'];
    var checkpointFilePath  = path.join(checkpointDir, singleInput.domain + '-log-checkpoint.txt');

    var logCheckpoint = '';
    try {
      logCheckpoint = utils.readFile('', checkpointFilePath);
    }
    catch (e) {
      // If there's an exception, assume the file doesn't exist. Create the checkpoint file with an empty string
      fs.appendFileSync(checkpointFilePath, '');
    }

    // Call Auth0 API
    var auth0 = new Auth0({
      domain:       singleInput.domain,
      clientID:     singleInput.clientId,
      clientSecret: singleInput.clientSecret
    });

    var working = true;

    Async.whilst(
      function () {
        return working;
      },
      function (callback) {
        try {
          auth0.getLogs({
            take: 200, // The maximum value supported by the Auth0 API
            from: logCheckpoint
          },
          function (err, logs) {
            if (err) {
              Logger.error(name, 'auth0.getLogs: ' + err.message, eventWriter._err);
              return callback(err);
            }

            if (logs.length === 0) {
              working = false;
              Logger.info(name, 'Indexed was finished');
              return callback();
            }

            var errorFound = false;

            for (var i = 0; i < logs.length && !errorFound; i++) {

              try {
                var event = new Event({
                  stanza:     singleInput.domain,
                  sourcetype: 'auth0_logs',
                  data:       JSON.stringify(logs[i]), // Have Splunk index our event data as JSON
                });
                
                eventWriter.writeEvent(event);
                logCheckpoint = logs[i]._id;

                Logger.info(name, 'Indexed an Auth0 log with _id: ' + logCheckpoint);
              }
              catch (e) {
                errorFound = true;
                working = false; // Stop streaming if we get an error
                Logger.error(name, e.message, eventWriter._err);
                fs.writeFileSync(checkpointFilePath, logCheckpoint); // Write to the checkpoint file
                
                // We had an error, die
                return done(e);
              }
            }
            
            fs.writeFileSync(checkpointFilePath, logCheckpoint);
            callback();
          });
        }
        catch (e) {
          callback(e);
        }
      },
      function (err) {
        done(err);
      }
    );
  };

  ModularInputs.execute(exports, module);
})();
