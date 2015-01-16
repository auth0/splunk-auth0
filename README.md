### Setup

Just install the package from [Splunk Apps](https://apps.splunk.com/app/1884).
* You must use a platform that supports Nodejs (which ships in the box for Splunk).
* Make sure the `SPLUNK_HOME` environment variable is pointing to the root directory of your Splunk instance.
* If your Splunk Web is located behind a proxy server, please configure the [HTTP(S)_PROXY environment variable](http://docs.splunk.com/Documentation/Splunk/latest/Admin/Specifyaproxyserver).

### Usage

1. Open the Splunk web interface and go to `Settings -> Data -> Data inputs`
2. Add new data input for Auth0 app specifying `name`, `domain`, `global client ID`, `global client secret` and `interval` _(under "More settings" section)_

> Global client ID and secret can be found from https://docs.auth0.com/api

### Troubleshooting

* File location for latest log checkpoint: `$SPLUNK_HOME/var/lib/splunk/modinputs/auth0/{AUTH0_DOMAIN}-log-checkpoint.txt`
* Log files:
	* `$SPLUNK_HOME/var/log/splunk/audit.log`
	* `$SPLUNK_HOME/var/log/splunk/splunkd.log`

### Erase data

1. Open the Splunk web interface, go to `Settings -> Data -> Data inputs -> Auth0` and delete the data input
2. Delete log checkpoint file: `$SPLUNK_HOME/var/lib/splunk/modinputs/auth0/{AUTH0_DOMAIN}-log-checkpoint.txt`
3. Perform one of the following searches:
	* Remove all Auth0 events: `sourcetype="auth0_logs" | delete`
	* Remove specific data input events: `source=auth0://{DATA_INPUT_NAME} | delete`

> If you have insufficient privileges to delete events (and presuming you are admin), go to `Settings -> Users and authentication -> Access controls -> Roles -> admin` and add the `delete_by_keyword` capability under `Capabilities` section.

### Generate and publish new package

1. Install `gnutar` | [instructions](http://day-to-day-stuff.blogspot.com.ar/2013/11/installing-gnutar-on-maverick.html)
2. Make sure to update version number from `default/app.conf` file.
3. Push your changes to GitHub and execute the following commands:

```
# include dependencies
cd bin/app/
rm -rf ./node_modules && npm install --production

# generate spl package
cd ../../..
alias tar='gnutar'
tar cv splunk-auth0/ -X splunk-auth0/.tarignore > splunk-auth0.tar
gzip splunk-auth0.tar
mv splunk-auth0.tar.gz splunk-auth0.spl
```

4. You are ready to upload the new `splunk-auth0.spl` package to https://apps.splunk.com/app/1884/edit/#/hosting/new

> More info see [Splunk Documentation - Package your app or add-on](http://docs.splunk.com/Documentation/Splunk/6.2.1/AdvancedDev/PackageApp)

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.
