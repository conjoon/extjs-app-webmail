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

### Available API Implementations
A simplistic RESTful PHP backend that can be used with single sign-ons to existing IMAP Servers can be found at [php-cn_imapuser](https://github.com/conjoon/php-cn_imapuser).

### Required API
The following API calls are made from `extjs-app-webmail`

* `cn_mail/MailAccounts` | **GET**
    * **Parameters:** -
    * Returns a list of all available Email-Accounts according to the model found in `conjoon.cn_mail.model.mail.account.MailAccount`. Failed attempts to retrieve this list should return appropriate http Status-Code.
    * Success Status / Response: Status 200 `{success :  true, data : [{...}, {...}, ...] `
    * Failure Status / Response: Status * `{success : false}`

*  `cn_mail/MailAccounts/{mailAccountId}/MailFolders` | **GET**
* **Parameters:**
    * `{mailAccountId}` (required): The id of the MailAccount for which the folders should be queried.
* Returns a list of all folders for the MailAccount with the specified `mailAccountId`, according to the model found in `conjoon.cn_mail.model.mail.folder.MailFolder`; child-folders should be available in the `data`-property of each folder.   Failed attempts to retrieve this list should return appropriate http Status-Code.
* Success Status / Response: Status 200 `{success : true, data : []}`
* Failure Status / Response: Status * `{success : false}`

* `cn_mail/MailAccounts/{mailAccountId}/MailFolders/{mailFolderId}/MessageItems` | **POST**
    * **Parameters:**
        * `{mailAccountId}` (required): The id of the MailAccount for which the Message should be queried;
        * `{mailFolderId}` (required): The id of the folder for which the Message should be returned;
        * `{messageItemId}` (required): The id of the Message to return;
        * `{target}` (required): if `{target=MessageBody}` is set, only the the MessageBody should be created and returned; if `{target=MessageItem}` is set, only MessageItem-informations should be created and returned;
    * Returns the created MessageBody or MessageItem for the specified parameters.
    * Success Status / Response: Status 200 `{success : true, data : {}}`
    * Failure Status / Response: Status * `{success : false}`; if the parameter `{target}` is missing, a *400 - Bad Request* should be returned

*  `cn_mail/MailAccounts/{mailAccountId}/MailFolders/{mailFolderId}/MessageItems?{start}&limit&{sort}` | **GET**
    * **Parameters:**
        * `{mailAccountId}` (required): The id of the MailAccount for which the folders should be queried;
        * `{mailFolderId}` (required): The id of the folder for which the messages should be returned;
        * `{start}` (required): The first index of the list to return;
        * `{limit}` (required): The number of items to return;
        * `{sort}` an array with sorting informations the client requests, e.g.: `sort=[{property : date, direction : DESC}]`
    * Returns a list of all MessageItems for the MailAccount with the specified `mailAccountId` found in the mailbox with the id `mailFolderId`, according to the model found in `conjoon.cn_mail.model.mail.message.MessageItem`; Failed attempts to retrieve this list should return appropriate http Status-Code. This response returns a list of MessageItems in the boundaries of `start` and `start + limit`; meta-information in the response need to contain the current number of unread messages in the queried mailbox along with the mailbox's identifier (`mailFolderId`) and the associated account (`mailAccountId`) itself.
    * Success Status / Response: Status 200 `{success : true, total : (int), meta : {unreadCount : (int), mailFolderId : (string), mailAccountId : (string)}, data : []}`
    * Failure Status / Response: Status * `{success : false}`

* `cn_mail/MailAccounts/{mailAccountId}/MailFolders/{mailFolderId}/MessageItems/{messageItemId}` | **GET**
    * **Parameters:**
        * `{mailAccountId}` (required): The id of the MailAccount for which the Message should be queried;
        * `{mailFolderId}` (required): The id of the folder for which the Message should be returned;
        * `{messageItemId}` (required): The id of the Message to return;
        * `{target}` (required): if `{target=MessageBody}` is set, only the the MessageBody should be returned; if `{target=MessageItem}` is set, only MessageItem-informations should be returned;
    * Returns the MessageItem or MessageBody for the specified parameters.
    * Success Status / Response: Status 200 `{success : true, data : {}}`
    * Failure Status / Response: Status * `{success : false}`; if the parameter `{target}` is missing, a *400 - Bad Request* should be returned

* `cn_mail/MailAccounts/{mailAccountId}/MailFolders/{mailFolderId}/MessageItems/{messageItemId}` | **PUT**
    * **Parameters:**
        * `{mailAccountId}` (required): The id of the MailAccount for which the Message should be queried;
        * `{mailFolderId}` (required): The id of the folder for which the Message should be returned;
        * `{messageItemId}` (required): The id of the Message to return;
        * `{target}` (required): `{target=MessageItem}`
        * `{origin}` (required): `{origin=create}` - Required for MessageDrafts to determine if they were initially created
        * `{action}` (required): `{action=move}` - Required to determine if a move operation is requested by the client
        * The following data can be submitted:
        * `seen (true/false)` sets the \Seen flag for the specified Message (for `{target=MessageItem}`)
        * `flagged (true/false)` sets the \Flagged flag for the specified Message  (for `{target=MessageItem}`)
        * `draft (true/false)` sets the \Draft flag for the specified Message  (for `{target=MessageItem}`)
        * `mailFolderId (String)` requests a move operation for the specified Message  (for `{target=MessageItem}` along with `{action=move}`)
        * For `{target=MessageDraft}`, data described in the `conjoon.cn_mail.model.mail.message.MessageDraft` can be submitted
    * Success Status / Response:
        * Status 200 `{success : true, data :{id : (string), mailFolderId : (string), mailAccountId : (string), seen : (bool), flagged : (bool)}}` If the operation was successfull, the data must contain the id, the mailFolderId and the mailAccountId representing the compound key of the message, along with the properties `seen` and/or `flagged` and their newly set value. If a new mailFolderId was submitted with the request, the response must contain a json-encoded MessageItem. See below.
        * Status 200 `{success : true, data :{[json encoded MessageItem along with preview-text]}}` If the operation was successful, the data must contain a json encoded MessageItem along with the preview-text.
    * Failure Status / Response: Status * `{success : false}`; if the parameter `{target}` is not valid, or the request payload is invalid, a *400 - Bad Request* should be returned. If a move operation for a MessageItem was requested, and the submitted `mailFolderId` is the same as the current for the target MessageItem, a *400 - Bad Request* should be returned.

##Dev
### Naming
The following naming conventions apply:

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