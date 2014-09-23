### Setup

1. Set the `SPLUNK_HOME` environment variable to the root directory of your Splunk instance
2. Copy this whole `splunk-auth0` folder to `$SPLUNK_HOME/etc/apps`
3. Open a terminal at `$SPLUNK_HOME/etc/apps/splunk-auth0/bin/app`
4. Ensure execute permissions for startup script: `chmod u+x ../auth0.sh`
4. Run `npm install`
5. Restart Splunk: `$SPLUNK_HOME/bin/splunk restart`

### Usage

1. Open the Splunk web interface and go to `Settings -> Data -> Data inputs`
2. Add new data input for Auth0 app specifying `name`, `domain`, `client ID`, `client secret` and `interval` _(under "More settings" section)_

### Troubleshooting

* File location for latest log checkpoint: `$SPLUNK_HOME/var/lib/splunk/modinputs/{AUTH0_DOMAIN}-log-checkpoint.txt`
* Log files:
	* `$SPLUNK_HOME/var/log/splunk/audit.log`
	* `$SPLUNK_HOME/var/log/splunk/splunkd.log`

### Erase data

1. Open the Splunk web interface, go to `Settings -> Data -> Data inputs -> Auth0` and delete the data input
2. Delete log checkpoint file: `$SPLUNK_HOME/var/lib/splunk/modinputs/{AUTH0_DOMAIN}-log-checkpoint.txt`
3. Perform one of the following searches:
	* Remove all Auth0 events: `sourcetype="auth0_logs" | delete`
	* Remove specific data input events: `source=auth0://{DATA_INPUT_NAME} | delete`

> If you have insufficient privileges to delete events (and presuming you are admin), go to `Settings -> Users and authentication -> Access controls -> Roles -> admin` and add the `delete_by_keyword` capability under `Capabilities` section.

### TODO

- [x] Check for Logger.info() output
- [x] Data input: validate Auth0 keys (domain, clientID, clientSecret)
- [x] Default dashboard: support multi-tenancy (include a drop-down list to choose the tenant)
- [x] Dashboards page: show default dashboard instead of dashboards grid
- [ ] Default dashboard: include more charts
