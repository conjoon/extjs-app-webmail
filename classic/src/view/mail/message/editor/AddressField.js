/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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
 * TagField implementation for use as address field in the
 * {@link conjoon.cn_mail.view.mail.message.editor.MessageEditor}
 */
Ext.define("conjoon.cn_mail.view.mail.message.editor.AddressField", {

    extend: "Ext.form.field.Tag",

    requires: [
        "conjoon.cn_mail.model.mail.message.EmailAddress"
    ],

    alias: "widget.cn_mail-mailmessageeditoraddressfield",

    cls: "cn_mail-mailmessageeditoraddressfield",

    displayField: "name",
    valueField: "address",

    config: {
        addressType: undefined
    },

    store: {
        data: [],
        model: "conjoon.cn_mail.model.mail.message.EmailAddress"
    },

    queryMode: "local",
    forceSelection: false,
    triggerOnClick: false,
    createNewOnEnter: true,
    hideTrigger: true,
    createNewOnBlur: false,

    initComponent: function () {
        var me          = this,
            addressType = me.getAddressType();

        if (addressType === "cc" || addressType === "bcc") {
            me.tagItemTextCls = Ext.baseCSSPrefix +
                                "tagfield-item-text x-fa " +
                                addressType;
        }


        me.callParent(arguments);
    }

});
