# @conjoon/extjs-app-webmail Documentation

**extjs-app-webmail** is a **coon.js** package and is tagged as such in the
`package.json`:

```json
{
  "coon-js": {
    "package": {
      "autoLoad":  {
        "registerController": true
      },
      "config" : "${package.resourcePath}/extjs-app-webmail.conf.json"
    }
  }
}
```

By default, this package's configuration can be found in this package's `resources` folder
in a file named `extjs-app-webmail.conf.json`.

### Required Services
This package requires a service that complies with the REST API described in `rest-api-email` which can be found
in the [REST API description](https://github.com/conjoon/rest-api-description) of the **conjoon**-project.

#### Mocking required Services
When using this package without a backend implementation, your app can use the
[extjs-dev-webmailsim](https://github.com/conjoon/extjs-dev-webmailsim) package  of
the [conjoon-project](https://github.com/conjoon).


## What goes into a `extjs-app-webmail` configuration?

The configuration file for this package is built from various key/value-pairs, configuring the behavior
and appearance of the email client:

```json
{
  "title": "Email",
  "plugins": {
    "components": [
      {
        "cmp": "cn_mail-mailmessagegrid",
        "fclass": "conjoon.cn_mail.view.mail.message.grid.feature.PreviewTextLazyLoad",
        "event": "cn_init"
      }
    ],
    "controller": [
      {
        "xclass": "conjoon.cn_mail.app.plugin.NewMessagesNotificationPlugin",
        "args": [
          {
            "interval": 240000
          }
        ]
      }
    ]
  },
  "resources": {
    "images": {
      "notifications": {
        "newEmail": "resources/images/notification/newmail.png"
      }
    },
    "sounds": {
      "notifications": {
        "newEmail": "resources/sounds/notification/newmail.wav"
      }
    },
    "templates": {
      "html": {
        "editor": "resources/templates/html/editor.html.tpl",
        "reader": "resources/templates/html/reader.html.tpl"
      }
    }
  },
  "service": {
    "rest-api-email": {
      "base": "https://ddev-ms-email.ddev.site/rest-api-email/api/v0/"
    }
  }
}
```

#### Static resources<a name="staticResources"></a>
The configuration allows for static resources to be configured, making it possible to change the
appearance of the email client. The dot-notation for the configuration options is as follows:

- `title` - The title of the package. This is used for assembling navigation entries, or changing the
  `document.title` of the browser instance the application runs in. This package notifies interested
  observers with this title whenever view of the package gets activated and gains the focus. 
- `resources.images.notifications.newEmail` - an icon to show with the desktop notification when new email messages are coming in.
- `resources.sounds.notifications.newEmail` - a notification sound to play when new email messages are coming in.
- `templates.html.editor` - an html-template to use with the message editor.
- `templates.html.reader` - an html-template to use with the message reader.

#### Plugins
There are several plugins preconfigured for **extjs-app-webmail**. Please consult the documentation
of the plugins for providing constructor arguments.
 - `conjoon.cn_mail.view.mail.message.grid.feature.PreviewTextLazyLoad` - a plugin for lazy loading
email message preview texts in the grid, making sure that envelope information of available messages
are loaded and rendered first. 
 - `conjoon.cn_mail.app.plugin.NewMessagesNotificationPlugin` - a plugin for automatically querying mailboxes 
for new messages. Plays notification sounds when new messages have been received. If allowed by the user, 
desktop notifications are shown for new messages, too. The default interval
for looking up new messages is set to 240000 ms. Additional resources for this plugin can be configured 
with the [static resources](#staticResources).
 - `conjoon.cn_mail.app.plugin.MailtoProtocolHandlerPlugin` - a plugin for registering **extjs-app-webmail**
as a [protocol handler](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/registerProtocolHandler/Web-based_protocol_handlers) for `mailto`-links.

#### Rest API
- `service` - Endpoint configuration for this package. Used to create required URLs for outgoing
  HTTP-requests. Holds the key `rest-api-email.base` that must hold the base URL where the endpoints for 
  email related operations as described in [rest-api-mail](https://github.com/conjoon/rest-api-description) can be found.
