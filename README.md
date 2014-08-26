### Setup

1. Set the `SPLUNK_HOME` environment variable to the root directory of your Splunk instance
2. Copy this whole `splunk-auth0` folder to `$SPLUNK_HOME/etc/apps`
3. Open a terminal at `$SPLUNK_HOME/etc/apps/splunk-auth0/bin/app`
4. Ensure execute permissions for startup script: `chmod u+x ../auth0.sh`
4. Run `npm install`
5. Restart Splunk: `$SPLUNK_HOME/bin/splunk restart`

### Usage

1. Go to `Settings -> Data -> Data inputs`
2. Add new data input for Auth0 app specifying `name`, `domain`, `client ID`, `client secret` and `interval` _(under "More settings" section)_
