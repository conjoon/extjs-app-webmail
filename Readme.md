# app-cn_mail  [![Build Status](https://travis-ci.org/conjoon/app-cn_mail.svg?branch=master)](https://travis-ci.org/conjoon/app-cn_mail)
This **Sencha ExtJS** package is built with the [coon.js-library](https://github.com/coon.js) and provides a pluggable package
for adding an Email-client to the conjoon application.


## Naming
The following naming conventions apply:

#### Namespace
`conjoon.cn_mail.*`
#### Package name
`app-cn_mail`
#### Shorthand to be used with providing aliases
`cn_mail`

**Example:**
Class `conjoon.cn_mail.view.mail.MailDesktopViewModel` has the alias `viewmodel.cn_mail-maildesktopviewmodel`

## Tests
Tests are written with [Siesta](https://bryntum.com/siesta)

# Usage
## Requirements
 * This package requires the [lib-cn_comp](https://github.com/coon-js/lib-cn_comp) package of the [coon.js](https://github.com/coon-js) project.
 * This package requires the [theme-cn_default](https://github.com/conjoon/theme-cn_default) package of the [conjoon](https://github.com/conjoon) project.

When using this package without a backend implementation, make sure your app uses the [dev-cn_mailsim](https://github.com/conjoon/dev-cn_mailsim) package  of the [conjoon](https://github.com/conjoon) project.


# Required API
URL          | Method       | Parameters  | Success Status / Response | Failure Status / Response | Description 
------------ | -------------|-------------|---------------------------|---------------------------|-----------------------------
```cn_mail/MailAccounts``` | **GET** | - | Status 200 ```{success :  true, data : [{...}, {...}, ...] ``` | Status * ```{success : false}``` | Returns a list of all available Email-Accounts according to the model found in ```conjoon.cn_mail.model.mail.account.MailAccount```. Failed attempts to retrieve this list should return appropriate http Status-Code.
```cn_mail/MailAccounts/{mailAccountId}/MailFolders``` | **GET** | ```{mailAccountId}``` The id of the MailAccount for which the folders should be queried. |Status 200 ```{success : true, data : []}``` | Status * ```{success : false}``` | Returns a list of all folders for the MailAccount with the specified ```mailAccountId```, according to the model found in ```conjoon.cn_mail.model.mail.folder.MailFolder```; child-folders should be available in the ```data```-property of each folder.   Failed attempts to retrieve this list should return appropriate http Status-Code.
```cn_mail/MailAccounts/{mailAccountId}/MailFolders/{mailFolderId}/MessageItems``` | **GET** | ```{mailAccountId}``` The id of the MailAccount for which the folders should be queried; ```{mailFolderId}``` The id of the folder for which the messages should be returned.| Status 200 ```{success : true, data : []}```| Status * ```{success : false}``` | 
   