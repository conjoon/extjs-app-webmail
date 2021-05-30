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
 * Base model for app-cn_mail representing the body of a message that gets
 * loaded upon request. This is usually the case if a MessageItem is selected
 * for inspecting its contents. Instead of sending large chunks of message bodies
 * with a message item, this data is encapsulated in a separate model.
 *
 * - text (raw text of the message)
 * - textHtml (textHtml of the message)
 */
Ext.define("conjoon.cn_mail.model.mail.message.MessageBody", {

    extend: "conjoon.cn_mail.model.mail.message.CompoundKeyedModel",

    requires: [
        "coon.core.data.field.CompoundKeyField"
    ],

    entityName: "MessageBody",


    fields: [{
        name: "textPlain",
        type: "string"
    }, {
        name: "textHtml",
        type: "string"
    }, {
        // we are hardcoding a messageDraftId-field here, although the
        // a MessageBody related with any item might NOT be a draft.
        // however, we keep this field here to make sure
        // associations (MessageDraft <-> MessageBody) work in both directions
        persist: false,
        name: "messageDraftId",
        type: "string",
        reference: {
            parent: "MessageDraft"
        },
        unique: true,
        validators: "presence"
    }],


    /**
     * @inheritdoc
     */
    getAssociatedCompoundKeyedData: function () {
        const me = this;

        let data =  me.getMessageDraft && me.getMessageDraft() ? [me.getMessageDraft()] : [];

        data = data.concat(
            me.getMessageItem && me.getMessageItem()
                ? [me.getMessageItem() ] : []
        );


        return data;
    },


    /**
     * Overridden to make sure existing associations are checked. Sessions
     * might invalidate stubs and force the loading of FKs without the FKs
     * being applied to the left side beforehand. In this case, we simply apply
     * the compound key of the MessageDraft.
     *
     * @param {Object} options
     *
     * @return {Ext.data.operation.Read}
     */
    load: function (options) {

        const me      = this,
            assoc   = me.getAssociatedCompoundKeyedData();

        options = options || {};

        options.params = options.params || {};

        if (assoc && assoc.length === 1 && assoc[0].entityName === "MessageDraft") {
            Ext.applyIf(options.params, assoc[0].getCompoundKey().toObject());
        }

        return me.callParent([options]);
    }
});