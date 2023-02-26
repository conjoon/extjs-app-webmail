# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.0.15](https://github.com/conjoon/extjs-app-webmail/compare/v1.0.14...v1.0.15) (2023-02-26)


### Bug Fixes

* blocked bg-images do not trigger external content warning ([3075123](https://github.com/conjoon/extjs-app-webmail/commit/3075123c60db372374d0d72856ba96f2d8753ca3)), closes [conjoon/extjs-app-webmail#284](https://github.com/conjoon/extjs-app-webmail/issues/284)

### [1.0.14](https://github.com/conjoon/extjs-app-webmail/compare/v1.0.13...v1.0.14) (2023-02-21)


### Bug Fixes

* replying to email fails after sorting a large grid ([b488fd7](https://github.com/conjoon/extjs-app-webmail/commit/b488fd7cd759e978a8adf0151df69e43326dca21)), closes [conjoon/extjs-app-webmail#270](https://github.com/conjoon/extjs-app-webmail/issues/270)

### [1.0.13](https://github.com/conjoon/extjs-app-webmail/compare/v1.0.12...v1.0.13) (2023-02-18)


### Features

* add basic support for stateful MailFolderTree ([fa04b3c](https://github.com/conjoon/extjs-app-webmail/commit/fa04b3c2a9c39c674e59e26e43c7cdbbd3a506b0))
* apply component state configuration in postLaunchHook() ([74c11af](https://github.com/conjoon/extjs-app-webmail/commit/74c11af5bd21635a7f0fb2a52e759ab60fa4e40d))

### [1.0.12](https://github.com/conjoon/extjs-app-webmail/compare/v1.0.11...v1.0.12) (2023-02-17)


### Bug Fixes

* onMailDesktopViewShow's internal callback cancels events ([b280801](https://github.com/conjoon/extjs-app-webmail/commit/b280801171373420dcb413f8dab2e55e76e17564)), closes [conjoon/extjs-app-webmail#283](https://github.com/conjoon/extjs-app-webmail/issues/283)
* opening a message with erroneous key-fragments triggers error ([9e58c00](https://github.com/conjoon/extjs-app-webmail/commit/9e58c00782337d8d66124e77b74af0c1a69d5636)), closes [conjoon/extjs-app-webmail#282](https://github.com/conjoon/extjs-app-webmail/issues/282)

### [1.0.11](https://github.com/conjoon/extjs-app-webmail/compare/v1.0.10...v1.0.11) (2023-02-17)


### Bug Fixes

* onMailAccountActiveChange triggers error if editor with error state is opened ([00a2ba4](https://github.com/conjoon/extjs-app-webmail/commit/00a2ba42dbdfae64eed38bfb25837c68136d7fdf)), closes [conjoon/extjs-app-webmail#274](https://github.com/conjoon/extjs-app-webmail/issues/274)

### [1.0.10](https://github.com/conjoon/extjs-app-webmail/compare/v1.0.9...v1.0.10) (2023-02-16)


### Bug Fixes

* child-folders not loaded when MailDesktopView is not opened via route ([a49a347](https://github.com/conjoon/extjs-app-webmail/commit/a49a347575e06acf8120bba079873b4dab040269)), closes [conjoon/extjs-app-webmail#256](https://github.com/conjoon/extjs-app-webmail/issues/256)
* icons for mail folder missing upon first expand ([abddf6d](https://github.com/conjoon/extjs-app-webmail/commit/abddf6d70a4060e9a39075d71da4e0b8d9eccb7d)), closes [conjoon/extjs-app-webmail#281](https://github.com/conjoon/extjs-app-webmail/issues/281)
* **tests:** test for accounts available/mail folders load pending is failing ([cb8e94e](https://github.com/conjoon/extjs-app-webmail/commit/cb8e94e74acc15657aae39a4c86527e9948e53c2))

### [1.0.9](https://github.com/conjoon/extjs-app-webmail/compare/v1.0.8...v1.0.9) (2023-02-16)

### [1.0.8](https://github.com/conjoon/extjs-app-webmail/compare/v1.0.7...v1.0.8) (2023-02-14)


### Bug Fixes

* error thrown when MailAccountWizard is destroyed and configs are loaded ([b43cc78](https://github.com/conjoon/extjs-app-webmail/commit/b43cc783cd4e5d1bd85b9b0a71e07c2df2e8d122)), closes [conjoon/extjs-app-webmail#280](https://github.com/conjoon/extjs-app-webmail/issues/280)

### [1.0.7](https://github.com/conjoon/extjs-app-webmail/compare/v1.0.6...v1.0.7) (2023-02-12)


### Bug Fixes

* reading pane button enabled when MailAccountWizard is active ([c9d3d7b](https://github.com/conjoon/extjs-app-webmail/commit/c9d3d7bd5103237ce2e9565be949b5a0cb8aeb4a)), closes [conjoon/extjs-app-webmail#278](https://github.com/conjoon/extjs-app-webmail/issues/278)

### [1.0.6](https://github.com/conjoon/extjs-app-webmail/compare/v1.0.5...v1.0.6) (2023-02-12)


### Bug Fixes

* protocol handler for mailto does not consider instance's pathname ([bd4a8e9](https://github.com/conjoon/extjs-app-webmail/commit/bd4a8e987a253b1a872dcc01636a5d6ac94a9c6d)), closes [conjoon/extjs-app-webmail#268](https://github.com/conjoon/extjs-app-webmail/issues/268)

### [1.0.5](https://github.com/conjoon/extjs-app-webmail/compare/v1.0.4...v1.0.5) (2023-02-12)


### Bug Fixes

* button for toggling gridlist gets activated when MailAccountWizard is shown ([9c9748f](https://github.com/conjoon/extjs-app-webmail/commit/9c9748f9eb224ff3ac6b56f5c5d3eb9e30c88ac4)), closes [conjoon/extjs-app-webmail#277](https://github.com/conjoon/extjs-app-webmail/issues/277)

### [1.0.4](https://github.com/conjoon/extjs-app-webmail/compare/v1.0.3...v1.0.4) (2023-02-11)


### Features

* show MailAccountWizard when MailDesktopView is shown ([7ed305f](https://github.com/conjoon/extjs-app-webmail/commit/7ed305fc2b8a6ae71930375bc5dfc9c1e0b5e80b)), closes [conjoon/extjs-app-webmail#276](https://github.com/conjoon/extjs-app-webmail/issues/276)


### Bug Fixes

* accountsLoaded is not set to true if response for accounts was empty ([69c8ba8](https://github.com/conjoon/extjs-app-webmail/commit/69c8ba8d13a224629f21387e55833b47dcf8e2ed)), closes [conjoon/extjs-app-webmail#276](https://github.com/conjoon/extjs-app-webmail/issues/276)

### [1.0.3](https://github.com/conjoon/extjs-app-webmail/compare/v1.0.2...v1.0.3) (2023-02-08)


### Bug Fixes

* reply/forward a message applies wrong default account ([4c8f840](https://github.com/conjoon/extjs-app-webmail/commit/4c8f840fe0618135fd3d225d2e54f5173e4b592f)), closes [conjoon/extjs-app-webmail#273](https://github.com/conjoon/extjs-app-webmail/issues/273)
* value of accountCombo not applied to messageDraft ([f0419d3](https://github.com/conjoon/extjs-app-webmail/commit/f0419d3ab5d37beea6415ac087b1f6674912d791)), closes [conjoon/extjs-app-webmail#273](https://github.com/conjoon/extjs-app-webmail/issues/273)

### [1.0.2](https://github.com/conjoon/extjs-app-webmail/compare/v1.0.1...v1.0.2) (2023-02-07)


### Features

* inbox_user and outbox_user default to email address of new account ([0f615da](https://github.com/conjoon/extjs-app-webmail/commit/0f615da75046fa43d50baec1a6f108a934672f33)), closes [conjoon/extjs-app-webmail#272](https://github.com/conjoon/extjs-app-webmail/issues/272)


### Bug Fixes

* inbox_type not available for "other" Mail Accounts ([b00c93d](https://github.com/conjoon/extjs-app-webmail/commit/b00c93deccf00b9f8a36ae68801e23103a65a74c)), closes [conjoon/extjs-app-localmailaccount#11](https://github.com/conjoon/extjs-app-localmailaccount/issues/11)

### [1.0.1](https://github.com/conjoon/extjs-app-webmail/compare/v1.0.0...v1.0.1) (2023-01-28)

## [1.0.0](https://github.com/conjoon/extjs-app-webmail/compare/v0.4.0...v1.0.0) (2023-01-28)


### Features

* add "activemailaccountavailable"-event ([f62bd8a](https://github.com/conjoon/extjs-app-webmail/commit/f62bd8a4954ef1c499b4d8731618b4c819fb9e52)), closes [conjoon/conjoon#23](https://github.com/conjoon/conjoon/issues/23)
* add loadMailAccounts() for loading accounts nodes including mailboxes ([4c32d1c](https://github.com/conjoon/extjs-app-webmail/commit/4c32d1c93423d15c3a50913e929bebe08182cba4)), closes [conjoon/conjoon#23](https://github.com/conjoon/conjoon/issues/23)
* add MailAccountWizard for registering new Mail Accounts ([4652db9](https://github.com/conjoon/extjs-app-webmail/commit/4652db99eec56cfe3599e5e2c49150f9872e4e4c)), closes [conjoon/conjoon#23](https://github.com/conjoon/conjoon/issues/23)
* MailDesktopViewController considers multiple available MailAccounts ([636ebd7](https://github.com/conjoon/extjs-app-webmail/commit/636ebd7b3a492df101bb0f1f4c491ed06a009403)), closes [conjoon/conjoon#23](https://github.com/conjoon/conjoon/issues/23)
* only active MailAccounts considered w/ new messages ([01c9263](https://github.com/conjoon/extjs-app-webmail/commit/01c9263a25560ec79a4957026b212aaf4e993ea3)), closes [conjoon/conjoon#23](https://github.com/conjoon/conjoon/issues/23)
* package considers MailAccountHandler as injectable dependency ([579e3ad](https://github.com/conjoon/extjs-app-webmail/commit/579e3adc4b2fd6349765bcd5dc9a6baaa8859e44)), closes [conjoon/conjoon#23](https://github.com/conjoon/conjoon/issues/23)
* subscriptions specified with MailAccounts sent with URL ([99cd371](https://github.com/conjoon/extjs-app-webmail/commit/99cd3713b90f355f509e992d2c77dc896c2172c0)), closes [conjoon/conjoon#23](https://github.com/conjoon/conjoon/issues/23)


### Bug Fixes

* accountCombo requires default value to be NULL if mailAccountId is undefined ([7906a16](https://github.com/conjoon/extjs-app-webmail/commit/7906a167798a71058b685c3022dcabd8afd098af)), closes [conjoon/conjoon#23](https://github.com/conjoon/conjoon/issues/23)
* active state of MailAccount not properly reflected on MessageEditor ([668ca35](https://github.com/conjoon/extjs-app-webmail/commit/668ca35828498013a3fe1d15dae18911a1e10f40)), closes [conjoon/conjoon#23](https://github.com/conjoon/conjoon/issues/23)
* creating new message possible even if no active MailAccount exists ([612e084](https://github.com/conjoon/extjs-app-webmail/commit/612e0844bffa0e8f6d9de6dc3dc750d1eb7fce4f))
* error thrown when view has MailAccount w/o address objects ([a485dff](https://github.com/conjoon/extjs-app-webmail/commit/a485dffd8445a68d8ceb8c7e0639e1227fe63fe4)), closes [conjoon/conjoon#23](https://github.com/conjoon/conjoon/issues/23)
* filter for MessageEntityProxy cannot be purged ([c3f37bf](https://github.com/conjoon/extjs-app-webmail/commit/c3f37bfef0f50f4d96b4c997a2c8a1d1e9a975fc)), closes [conjoon/conjoon#23](https://github.com/conjoon/conjoon/issues/23)
* first arg of accountavailable event is not the Wizard ([0dd74b1](https://github.com/conjoon/extjs-app-webmail/commit/0dd74b13383078d7814ecd463b72dcd1bba632f8)), closes [conjoon/conjoon#23](https://github.com/conjoon/conjoon/issues/23)
* missing img in preset-config triggers error ([060b0e8](https://github.com/conjoon/extjs-app-webmail/commit/060b0e836078e54dd837437c745d3e09d322d1fe)), closes [conjoon/conjoon#23](https://github.com/conjoon/conjoon/issues/23)
* no accounts queried when "active" disabled/enabled during runtime ([83abf4c](https://github.com/conjoon/extjs-app-webmail/commit/83abf4c0f48b6d223d495c101cde80074f904cb1)), closes [conjoon/conjoon#23](https://github.com/conjoon/conjoon/issues/23)
* test does not remove subscription for MailboxRunner ([cb6a862](https://github.com/conjoon/extjs-app-webmail/commit/cb6a86227a2a9b09b7910f1f06458d0883a17c6b)), closes [conjoon/conjoon#23](https://github.com/conjoon/conjoon/issues/23)
* **tests:** add missing tests ([4f52ef4](https://github.com/conjoon/extjs-app-webmail/commit/4f52ef466e16f8c8a43484f9c55f7c07f715748a))

## [0.4.0](https://github.com/conjoon/extjs-app-webmail/compare/v0.3.1...v0.4.0) (2022-12-15)


### Features

* add requestConfigurator as dependency< to BaseProxy ([6ec5f3b](https://github.com/conjoon/extjs-app-webmail/commit/6ec5f3bb5888a032256eddad6ef719d6997b67fc)), closes [conjoon/extjs-app-webmail#255](https://github.com/conjoon/extjs-app-webmail/issues/255)
* add requestConfigurator as external dependency ([1ae72cd](https://github.com/conjoon/extjs-app-webmail/commit/1ae72cd5e29607b65a531cf03d4b49dd6990735d)), closes [conjoon/extjs-app-webmail#255](https://github.com/conjoon/extjs-app-webmail/issues/255)


### Bug Fixes

* callParent() in async method throws runtime error after transpiling w/ babel ([a3af1dd](https://github.com/conjoon/extjs-app-webmail/commit/a3af1ddb469719218511055d1265d359c0a89836))
* **tests:** tests not considering ioc bindings ([0b81c1f](https://github.com/conjoon/extjs-app-webmail/commit/0b81c1f3ec1bc8b55e9e6b3174e0cfb07aca1620)), closes [conjoon/extjs-app-webmail#255](https://github.com/conjoon/extjs-app-webmail/issues/255)
* **tests:** when testing MessageEditor, tests fail if window has not focus ([9d79063](https://github.com/conjoon/extjs-app-webmail/commit/9d79063586f372c1bcce33c00a258922c7309340))
* when loading attachments, additional options are not passed to request ([7812ccf](https://github.com/conjoon/extjs-app-webmail/commit/7812ccf0ae4a208011bfab165648ea64e3e575ab))

### [0.3.1](https://github.com/conjoon/extjs-app-webmail/compare/v0.3.0...v0.3.1) (2022-11-14)


### Bug Fixes

* plugin fails if application is not used in a secure context (https) ([07f38d0](https://github.com/conjoon/extjs-app-webmail/commit/07f38d0656e68528f33fa876e3d4c8fbc1149157))

## [0.3.0](https://github.com/conjoon/extjs-app-webmail/compare/v0.2.1...v0.3.0) (2022-11-14)


### Features

* add protocol handler for mailto ([801da10](https://github.com/conjoon/extjs-app-webmail/commit/801da1098e65813b51260252a43101ff16533e4b)), closes [conjoon/extjs-app-webmail#250](https://github.com/conjoon/extjs-app-webmail/issues/250)

### [0.2.1](https://github.com/conjoon/extjs-app-webmail/compare/v0.2.0...v0.2.1) (2022-06-01)


### Bug Fixes

* slash "/" not encoded when part of mailFolderId ([49fd1fd](https://github.com/conjoon/extjs-app-webmail/commit/49fd1fdd5557f05105963f6524ed91dfdf206bbd)), closes [conjoon/extjs-app-webmail#242](https://github.com/conjoon/extjs-app-webmail/issues/242)

## [0.2.0](https://github.com/conjoon/extjs-app-webmail/compare/v0.1.1...v0.2.0) (2022-05-15)


### Features

* "target"-parameter can be omitted when destroying MessageItems ([19fe641](https://github.com/conjoon/extjs-app-webmail/commit/19fe6414582e2f8640b910236509bf38254b6122)), closes [conjoon/rest-api-description#3](https://github.com/conjoon/rest-api-description/issues/3)
* add confirm dialog before MessageEditor gets closed ([0f60069](https://github.com/conjoon/extjs-app-webmail/commit/0f60069f8668045898b0f48a9252379b2630feef)), closes [conjoon/extjs-app-webmail#112](https://github.com/conjoon/extjs-app-webmail/issues/112)
* add desktop notification for new email messages ([7ab7552](https://github.com/conjoon/extjs-app-webmail/commit/7ab75523015b6fd5f22e346134b58000fd356a60)), closes [conjoon/extjs-app-webmail#150](https://github.com/conjoon/extjs-app-webmail/issues/150)
* add functionality for lazy loading the previewText ([46c680c](https://github.com/conjoon/extjs-app-webmail/commit/46c680c5047c024ce380dc8ffba4077761bfa515)), closes [conjoon/extjs-app-webmail#142](https://github.com/conjoon/extjs-app-webmail/issues/142)
* add functionality for lazy loading the previewText ([39d0e56](https://github.com/conjoon/extjs-app-webmail/commit/39d0e56c5e49461a226474e8410a3b7541de396e)), closes [conjoon/extjs-app-webmail#142](https://github.com/conjoon/extjs-app-webmail/issues/142)
* add image matching "from"-address of email sender to header in MessageView ([0b9b823](https://github.com/conjoon/extjs-app-webmail/commit/0b9b823e08ad1f0aeddc7c723120cf506ebc979a)), closes [conjoon/conjoon#12](https://github.com/conjoon/conjoon/issues/12)
* add writer for MessageItem-related entities ([8d78101](https://github.com/conjoon/extjs-app-webmail/commit/8d781012055b3e051fd9eb114af46c510728ad58)), closes [conjoon/rest-api-email#3](https://github.com/conjoon/rest-api-email/issues/3)
* client allows for getting drafts/items/MessageBodies w/o target-parameter ([2a94470](https://github.com/conjoon/extjs-app-webmail/commit/2a94470a433dadd806db3aff332387e9bc9b389f)), closes [conjoon/rest-api-description#3](https://github.com/conjoon/rest-api-description/issues/3)
* fetch recent emails and add them to the grid ([3140a11](https://github.com/conjoon/extjs-app-webmail/commit/3140a1177461e39b4a720c8a3c8e8cd4326d03d3)), closes [conjoon/extjs-app-webmail#144](https://github.com/conjoon/extjs-app-webmail/issues/144)
* make onclick of notification popup focus the owning window ([debccc4](https://github.com/conjoon/extjs-app-webmail/commit/debccc46f9288019abbcb89758ecd981e24180b2)), closes [conjoon/extjs-app-webmail#150](https://github.com/conjoon/extjs-app-webmail/issues/150)
* package sends value for document.title once MainView is activated ([9c12a0c](https://github.com/conjoon/extjs-app-webmail/commit/9c12a0c634897cb8ded5bff6d2ad0f681920c5a9)), closes [conjoon/conjoon#7](https://github.com/conjoon/conjoon/issues/7)
* refactor lazy loading of email previews into grid feature ([e85524a](https://github.com/conjoon/extjs-app-webmail/commit/e85524a838da2d0554ac977e18386c6f1b70eb58)), closes [conjoon/extjs-app-webmail#142](https://github.com/conjoon/extjs-app-webmail/issues/142)
* segmented button for switching between html/plain is now single button ([e831829](https://github.com/conjoon/extjs-app-webmail/commit/e831829b63eadb7eeee90f4aecb2578fb6b14baf)), closes [conjoon/extjs-app-webmail#236](https://github.com/conjoon/extjs-app-webmail/issues/236)
* updating a MessageBody does not require a target-parameter anymore ([9519790](https://github.com/conjoon/extjs-app-webmail/commit/9519790cff7dec8e95aeda8ec546030a5913d88b)), closes [conjoon/rest-api-description#3](https://github.com/conjoon/rest-api-description/issues/3)


### Bug Fixes

* add attachment button in menu does not work ([c6c3721](https://github.com/conjoon/extjs-app-webmail/commit/c6c3721c69d8ca9a4d65cfda393e121e3f53665a)), closes [conjoon/extjs-app-webmail#186](https://github.com/conjoon/extjs-app-webmail/issues/186)
* add fields "answered" and "recent" to list of not-persistable fields ([b052f4f](https://github.com/conjoon/extjs-app-webmail/commit/b052f4ff9272679859fb24f97d7514c8a61d32ae)), closes [conjoon/rest-api-description#3](https://github.com/conjoon/rest-api-description/issues/3)
* add missing headers to API call ([c598ff4](https://github.com/conjoon/extjs-app-webmail/commit/c598ff4ac1b5e1428be76f9eca7da6cd605660ef)), closes [conjoon/extjs-app-webmail#142](https://github.com/conjoon/extjs-app-webmail/issues/142)
* AttachmentList should show correct icon class for mime type ([aff37af](https://github.com/conjoon/extjs-app-webmail/commit/aff37af307be25eb248e7f4a1bde124956912cc8)), closes [conjoon/extjs-app-webmail#135](https://github.com/conjoon/extjs-app-webmail/issues/135)
* attachments must re-appear in the list if DELETE fails ([21b0ee0](https://github.com/conjoon/extjs-app-webmail/commit/21b0ee0d027d0c1b5412e15d176ffb9520c6f3d8)), closes [conjoon/extjs-app-webmail#196](https://github.com/conjoon/extjs-app-webmail/issues/196)
* closing email message using container mask triggers error ([fddf62c](https://github.com/conjoon/extjs-app-webmail/commit/fddf62c7e15a83d97f227841c0a06b8549756d73)), closes [conjoon/extjs-app-webmail#227](https://github.com/conjoon/extjs-app-webmail/issues/227)
* confirm-close-dialog is triggered after message was sent ([b7113cc](https://github.com/conjoon/extjs-app-webmail/commit/b7113cc1ba84ab705101a8460571bf8a4ea9b4fb)), closes [conjoon/extjs-app-webmail#206](https://github.com/conjoon/extjs-app-webmail/issues/206)
* consider new formula "lastSavedMessage" in existing tests ([99ecbf5](https://github.com/conjoon/extjs-app-webmail/commit/99ecbf540d2d44eba1f77ce1210f433a28ed729f)), closes [conjoon/php-ms-imapuser#49](https://github.com/conjoon/php-ms-imapuser/issues/49)
* css-class for "reply" indicator in MessageGrid is wrongly named ([7378cba](https://github.com/conjoon/extjs-app-webmail/commit/7378cba3ebdb03a8211d590863e1dad6d7d6b983)), closes [conjoon/extjs-app-webmail#221](https://github.com/conjoon/extjs-app-webmail/issues/221)
* deleting attachments will throw an error in AttachmentWriter ([c9c313f](https://github.com/conjoon/extjs-app-webmail/commit/c9c313f73f79e0aba0bd670beca0be710a043440)), closes [conjoon/php-ms-imapuser#40](https://github.com/conjoon/php-ms-imapuser/issues/40)
* deleting multiple messages using rowflymenu triggers error ([7202f04](https://github.com/conjoon/extjs-app-webmail/commit/7202f04e2b347c4ca980be4c3479bb5f2aef5f3a)), closes [conjoon/extjs-app-webmail#147](https://github.com/conjoon/extjs-app-webmail/issues/147)
* do not return false in listener for "cn_mail-mailmessagegridload"-event ([25a3a3f](https://github.com/conjoon/extjs-app-webmail/commit/25a3a3f35d3bbe79b291546f4c1e2aa06e0e2122)), closes [conjoon/extjs-app-webmail#161](https://github.com/conjoon/extjs-app-webmail/issues/161)
* enable "show/hide mail-folder"-button ([2d192b0](https://github.com/conjoon/extjs-app-webmail/commit/2d192b0557268b8e6dc9e5560d709f002b290958)), closes [conjoon/extjs-app-webmail#131](https://github.com/conjoon/extjs-app-webmail/issues/131)
* fix tests where id in response is not properly considered ([7a461d8](https://github.com/conjoon/extjs-app-webmail/commit/7a461d8b5db9ff76d8a08745fedf1aeee2dc69a7)), closes [conjoon/php-ms-imapuser#40](https://github.com/conjoon/php-ms-imapuser/issues/40)
* foreground-color of subject in light mode not readable ([9ea8060](https://github.com/conjoon/extjs-app-webmail/commit/9ea806058fa46696e4b43187c1c24633ebc3148c)), closes [conjoon/extjs-theme-material#12](https://github.com/conjoon/extjs-theme-material/issues/12)
* make sure confirm dialog before closing is called properly ([80fb6c7](https://github.com/conjoon/extjs-app-webmail/commit/80fb6c70265d5f30b0c8954e28f824969b76ee83)), closes [conjoon/extjs-app-webmail#112](https://github.com/conjoon/extjs-app-webmail/issues/112)
* make sure seedFolders() checks array before accessing it ([23c1376](https://github.com/conjoon/extjs-app-webmail/commit/23c1376d3c390a64952de92f40fcbae540e4db58)), closes [conjoon/extjs-app-webmail#157](https://github.com/conjoon/extjs-app-webmail/issues/157)
* make sure test work with latest API changes ([9279e49](https://github.com/conjoon/extjs-app-webmail/commit/9279e49cd0bcfbf2a53d7a2192eec4ef09fb13d4)), closes [conjoon/rest-api-description#3](https://github.com/conjoon/rest-api-description/issues/3)
* pendingLazies must not persist when store reloads for different mailbox ([998540b](https://github.com/conjoon/extjs-app-webmail/commit/998540b2921dd66947dd318c83f5ad83d2609275)), closes [conjoon/extjs-app-webmail#216](https://github.com/conjoon/extjs-app-webmail/issues/216)
* prevent relative urls to be clickable in iframe ([99f49d8](https://github.com/conjoon/extjs-app-webmail/commit/99f49d83193dccca32f73d6a3aab912a5a408088)), closes [conjoon/extjs-app-webmail#225](https://github.com/conjoon/extjs-app-webmail/issues/225)
* **reg:** action "markunread" was accidently removed in recent ammend ([695508c](https://github.com/conjoon/extjs-app-webmail/commit/695508c38fdf2f902f215b17878be5587b20b9d2))
* remove object key/value shorthands which are not resolved by build ([b2d35fc](https://github.com/conjoon/extjs-app-webmail/commit/b2d35fcabc6918070126dcf1565eacf0f4bc179e)), closes [conjoon/extjs-app-webmail#153](https://github.com/conjoon/extjs-app-webmail/issues/153)
* return value of destroyed attachment must be data for the owning message ([197a3f2](https://github.com/conjoon/extjs-app-webmail/commit/197a3f23817bdbbe6b327ebb119bf58dc7b793b1)), closes [conjoon/php-ms-imapuser#40](https://github.com/conjoon/php-ms-imapuser/issues/40)
* root property for MessageItemList API-call must be set properly ([87d0e34](https://github.com/conjoon/extjs-app-webmail/commit/87d0e3445d214f6d42d932538acea2cf20880672)), closes [conjoon/extjs-app-webmail#142](https://github.com/conjoon/extjs-app-webmail/issues/142)
* saving a message and immediate closing triggers close confirm dialog ([0b1d6bf](https://github.com/conjoon/extjs-app-webmail/commit/0b1d6bfbc3a07417e83567d7ba74279fffa1e51f)), closes [conjoon/extjs-app-webmail#208](https://github.com/conjoon/extjs-app-webmail/issues/208)
* seedFolders is trying to access undefined TreeModel ([6dce0a1](https://github.com/conjoon/extjs-app-webmail/commit/6dce0a174fb3b099ff2704368899b65656631162)), closes [conjoon/extjs-app-webmail#157](https://github.com/conjoon/extjs-app-webmail/issues/157)
* Sencha CMD not able to transpile certain object property shorthands ([8f849d1](https://github.com/conjoon/extjs-app-webmail/commit/8f849d12c9b472e507e813fe20f07a4bae927eb7)), closes [conjoon/extjs-app-webmail#205](https://github.com/conjoon/extjs-app-webmail/issues/205)
* tests.config.js missing in tests folder ([d5ca1b6](https://github.com/conjoon/extjs-app-webmail/commit/d5ca1b6c9d984f54403356c672a5ca66732c2b89)), closes [conjoon/extjs-app-webmail#199](https://github.com/conjoon/extjs-app-webmail/issues/199)
* updating only a message triggers request for saving the MessageBody ([2a05c50](https://github.com/conjoon/extjs-app-webmail/commit/2a05c50105e5f9085dcf3b90ec568de7aca3b1c5)), closes [conjoon/extjs-app-webmail#223](https://github.com/conjoon/extjs-app-webmail/issues/223)
* various flags of a MessageDraft are discarded when saving an edited message ([f1e4e9e](https://github.com/conjoon/extjs-app-webmail/commit/f1e4e9efaad7b6ca4b733c44aaff3c341489a1d2)), closes [conjoon/php-ms-imapuser#49](https://github.com/conjoon/php-ms-imapuser/issues/49)
