/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Base tree model for extjs-app-webmail mail package.
 *
 * The schema used by this model is {@link conjoon.cn_mail.data.mail.BaseSchema}
 */
Ext.define("conjoon.cn_mail.model.mail.BaseTreeModel", {

    extend: "coon.core.data.BaseTreeModel",

    /**
     * We need to enforce a different id-field here since subclasses specify
     * different idProperties, but reuse the default idProperty ("id") for
     * containing data sent by the backend. This seems to be an issue with ExtJS.
     * We need to explicitely implement the idProperty in subclasses, now.
     */
    idProperty: "__id__",

    requires: [
        "conjoon.cn_mail.data.mail.BaseSchema"
    ],

    schema: "cn_mail-mailbaseschema",

    /**
     * Overridden to enforce setting idProperty
     */
    constructor: function () {

        const me = this;

        if (me.idProperty === "__id__") {
            Ext.raise({
                msg: "\"idProperty\" of coon.core.data.BaseTreeModel needs to be explicitly set",
                idProperty: me.idProperty
            });
        }

        me.callParent(arguments);
    }

});
