# app-cn_mail - Tests - Read Me

app-cn_mail uses [Siesta](http://bryntum.com) for Unit/UI testing.

Make sure you set the paths to the resources properly in the files index.html.template and
tests.config.js.template, then rename them:

```
index.html.template -> index.html
tests.config.js.template -> tests.config.js
```

# Requirements
The tests require [lib-cn_comp](https://github.com/coon-js/lib-cn_comp) and [lib-cn_core](https://github.com/coon-js/lib-cn_core). Make sure you adjust the paths to
this library in the index.js if both packages are not part of a regular local
package directory layout in a sencha workspace.
Additionally, you will need [dev-cn_mailsim](https://github.com/conjoon/dev-cn_mailsim).
This is a dev-package and usually not part of any package distribution. Make sure you place this
package in your local package directory to make sure tests can be processed.
