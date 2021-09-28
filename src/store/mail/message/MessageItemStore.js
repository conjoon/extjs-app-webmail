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
 * Base store for managing {@link conjoon.cn_mail.model.mail.message.MessageItem}.
 *
 *
 */
Ext.define("conjoon.cn_mail.store.mail.message.MessageItemStore", {

    extend: "Ext.data.BufferedStore",

    requires: [
        "conjoon.cn_mail.model.mail.message.MessageItem",
        "conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey"
    ],

    alias: "store.cn_mail-mailmessageitemstore",

    model: "conjoon.cn_mail.model.mail.message.MessageItem",

    remoteSort: true,

    remoteFilter: true,

    pageSize: 50,

    autoLoad: false,

    sorters: [{
        property: "date",
        direction: "DESC"
    }],


    /**
     * @inheritdoc
     * Overriden to make sure that this store instance allows only one sorter
     */
    applySorters: function (sorters) {

        var me = this;

        if (sorters && sorters.length !== 0 &&
            ((me.getSorters(false) && me.getSorters(false).length !== 0) ||
            sorters.length !== 1)) {
            Ext.raise({
                sorters: sorters,
                msg: "Only one sorter allowed for MessageItem store"
            });
        }

        return me.callParent(arguments);
    },


    /**
     * Tries to return the index of the record represented by the compoundKey.
     * Returns -1 if not found.
     * NOTE:
     * This does NOT consider the PageMap' feeder if this store is used with the Livegrid feature.
     * To search the PageMap along with it Feeds, use this grid's livegrid-feature's
     * getRecordBy() method.
     *
     * @param {conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey} compoundKey
     *
     * @return -1 if not found, otherwise the index of the record in the store.
     *
     * @throws if compoundKey is not an instance of conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
     */
    findByCompoundKey: function (compoundKey) {

        if (!(compoundKey instanceof conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey)) {
            Ext.raise({
                msg: "\"compoundKey\" must be an instance of conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey",
                compoundKey: compoundKey
            });
        }

        const me = this;

        return me.findExact("localId", compoundKey.toLocalId());
    },


    /**
     * Exclusive afterEdit for fields cn_celeted/cn_moved/answered of a message item,
     * since those are usually not followed by a call to commit()/save() since they
     * are only applied on the client (in this case also for "answered").
     * Makes sure owning grid is notified of those field changes without having
     * to commit the whole record.
     *
     * @param {Ext.data.Model} record The model instance that was edited.
     * @param {String[]} [modifiedFieldNames] (private)
     *
     * @see extjs-app-webmail#81
     */
    afterEdit: function (record, modifiedFieldNames) {

        if (!modifiedFieldNames ||
             (modifiedFieldNames.indexOf("cn_moved") === -1 &&
              modifiedFieldNames.indexOf("cn_deleted") === -1 &&
              modifiedFieldNames.indexOf("answered") === -1
             )) {
            return;
        }

        const me = this;

        if (me.contains(record)) {
            me.fireEvent("update", me, record, "edit", modifiedFieldNames);
        }
    }

});