# @conjoon/extjs-app-webmail 
This Sencha ExtJS NPM package is built with the [coon.js-library](https://github.com/coon.js) and provides a webmail client
implementation for the [conjoon](https://github.com/conjoon/conjoon) application.

## Installation
```
npm install --save-dev @conjoon/extjs-app-webmail
```
If you want to develop with this package, run the `build:dev`-script afterwards:
```bash
npm run build:dev
```
Testing environment will then be available via

```bash
npm test
```

## Usage
When using this package without a backend implementation, make sure your app uses the [extjs-dev-webmailsim](https://github.com/conjoon/extjs-dev-webmailsim) package  of the [conjoon](https://github.com/conjoon) project.

### Required Services
This package requires a service that complies with the REST API described in `rest-imap` which can be found
in the [REST API description](https://github.com/conjoon/rest-api-descriptions) of the conjoon project.

The url of this service can be configured in the configuration file for this package.

```json
{
    "service": {
        "rest-imap": {
            "base" : "https://localhost/rest-imap/api/v1"
        }
    }
} 
```
Please refer to the documentation of [extjs-lib-core](https://github.com/coon-js/extjs-lib-core) on how to
create package-specific configurations.

### Dev Notes

#### Namespace
`conjoon.cn_mail.*`
#### Package name
`extjs-app-webmail`
#### Shorthand to be used with providing aliases
`cn_mail`

**Example:**
Class `conjoon.cn_mail.view.mail.MailDesktopViewModel` has the alias `viewmodel.cn_mail-maildesktopviewmodel`

## Tests
Tests are written with [Siesta](https://bryntum.com/siesta)