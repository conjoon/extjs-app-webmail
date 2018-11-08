/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Ext.ux.ajax.SimManager hook for {@link conjoon.cn_mail.model.mail.message.MessageItem}
 * data.
 */
Ext.define('conjoon.cn_mail.data.mail.ajax.sim.message.MessageDraftSim', {

    requires : [
        'conjoon.cn_mail.data.mail.ajax.sim.Init',
        'conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable'
    ]

}, function() {

    Ext.ux.ajax.SimManager.register({
        type : 'json',

        //url  : /cn_mail\/MessageAccounts(\/\d+)?/,

        url : /cn_mail\/MailAccounts\/(.+)\/MailFolders\/(.+)\/MessageDrafts(\/.+)?/im,


        doDelete : function(ctx) {

            const me     = this,
                idPart = ctx.url.match(this.url)[1],
                id     = idPart ? idPart.substring(1) : null;

            if (!id) {
                console.log("DELETE MessageDraft - no numeric id specified.");
                return {success : false};
            }

            console.log("DELETE MessageDraft - ", id);

            let ret = {}, found = false;

            MessageTable = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable;
            messageItems = MessageTable.getMessageItems();

            for (var i = messageItems.length - 1; i >= 0; i --) {
                if (messageItems[i].id === id) {
                    messageItems.splice(i, 1);
                    found = true;
                    break;
                }
            }

            if (!found) {
                return {success : false};
            }

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            return ret;
        },

        doPut : function(ctx) {

            console.log("PUT MessageDraft", ctx.xhr.options.jsonData);

            var me            = this,
                ret           = {},
                MessageTable  = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable,
                values        = {},
                keys          = me.extractCompoundKey(ctx.url);

            for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }
                values[i] = ctx.xhr.options.jsonData[i];
            }

            if (values['subject'] === 'TESTFAIL') {
                ret.responseText = Ext.JSON.encode({
                    success : false
                });
                return ret;

            }

            MessageTable.updateMessageDraft(
                keys.mailAccountId,
                keys.mailFolderId,
                keys.id,
                values
            );

            let draft = MessageTable.getMessageDraft(
                ctx.xhr.options.jsonData.mailAccountId,
                ctx.xhr.options.jsonData.mailFolderId,
                ctx.xhr.options.jsonData.id
            );

            delete values.localId;

            for (var i in values) {
                if (draft[i]) {
                    values[i] = draft[i];
                }
            }

            ret.responseText = Ext.JSON.encode({
                success: true,
                data : values
            });

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            return ret;

        },

        doPost : function(ctx) {
            console.log("POST MessageDraft", ctx, ctx.xhr.options.jsonData);

            var me            = this,
                draft         = {},
                ret           = {},
                MessageTable  = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable;

    for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }

                if (i == 'to' || i == 'cc' || i == 'bcc') {
                    draft[i] = Ext.JSON.decode(ctx.xhr.options.jsonData[i]);
                } else {
                    draft[i] = ctx.xhr.options.jsonData[i];
                }
            }

            if (draft['subject'] === 'TESTFAIL') {
                ret.responseText = Ext.JSON.encode({
                    success : false
                });
                return ret;

            }


            draft = MessageTable.createMessageDraft(draft.mailAccountId, draft.mailFolderId, draft);

            ret.responseText = Ext.JSON.encode({
                success: true,
                data : {
                    id: draft.id,
                    mailFolderId: draft.mailFolderId,
                    mailAccountId: draft.mailAccountId
            }});


            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            return ret;
        },

        data: function(ctx) {

            var me = this,
                idPart  = ctx.url.match(this.url)[1],
                filters = ctx.params.filter,
                mailAccountId, mailFolderId, id,
                MessageTable  = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable,
                messageDrafts;

            let keys = me.extractCompoundKey(ctx.url);

            mailAccountId = keys.mailAccountId,
            mailFolderId  = keys.mailFolderId,
            id            = keys.id;

            return {data : MessageTable.getMessageDraft(mailAccountId, mailFolderId, id)};

        /*} else if (filters) {
                messageDrafts = MessageTable.getMessageDrafts();
                filters = Ext.decode(filters);
                id      = filters[0].value;
                return Ext.Array.filter(messageDrafts, function(draft) {
                    return draft.mailFolderId === id;
                });
            } else {
                return MessageTable.getMessageDrafts();
            }*/
        },


        /**
         * Returns a numeric array with the following values:
         * mailAccountId, mailFolderId, id
         *
         * @param url
         * @returns {*[]}
         */
        extractCompoundKey : function(url) {

            var mailAccountId, mailFolderId, id,
                pt = url.split('/'),
                id = pt.pop().split('?')[0],
                mailFolderId = pt.pop(),
                mailFolderId = pt.pop(),
                mailAccountId = pt.pop(),
                mailAccountId = pt.pop();

            return {
                mailAccountId : decodeURIComponent(mailAccountId),
                mailFolderId  : decodeURIComponent(mailFolderId),
                id            :decodeURIComponent(id)
            };
        }
    });


});