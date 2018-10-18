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
Ext.define('conjoon.cn_mail.data.mail.ajax.sim.message.MessageItemSim', {

    requires : [
        'conjoon.cn_mail.data.mail.ajax.sim.Init',
        'conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable'
    ]

}, function() {

    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url : /cn_mail\/MailAccounts\/(.+)\/MailFolders\/(.+)\/MessageItems(\/.*)?/im,

        doDelete : function(ctx) {

            const me     = this,
                  idPart = ctx.url.match(this.url)[1],
                  id     = idPart ? idPart.substring(1) : null;

            if (ctx.params.target === 'MessageBody') {
                Ext.raise("Not implemented");
            }


            if (!id) {
                console.log("DELETE MessageItem - no numeric id specified.");
                return {success : false};
            }

            console.log("DELETE MessageItem - ", id);

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

        doPost : function(ctx) {

            if (ctx.params.target === 'MessageBody') {
                return this.postMessageBody(ctx);
            }

        },

        doPut : function(ctx) {

            var me           = this,
                ret          = {},
                MessageTable = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable,
                values       = {};

            if (ctx.params.target === 'MessageBody') {
                Ext.raise("Not implemented");
            }

            for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }
                values[i] = ctx.xhr.options.jsonData[i];
            }

            MessageTable.updateMessageItem(ctx.xhr.options.jsonData.id, values);

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            return ret;
        },


        data: function(ctx) {

            var idPart  = ctx.url.match(this.url)[1],
                filters = ctx.params.filter,
                id,
                MessageTable = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable,
                messageItems = MessageTable.getMessageItems();

            if (ctx.params.target === 'MessageBody') {
                var pt = ctx.url.split('/');
                var id = pt.pop().split('?')[0],
                    mailFolderId = pt.pop(),
                    mailFolderId = pt.pop(),
                    mailAccountId = pt.pop(),
                    mailAccountId = pt.pop();

                return this.getMessageBody(mailAccountId, mailFolderId, id);
            }

            if (idPart) {debugger;
                id = idPart.substring(1).split('?')[0];
                return {data : Ext.Array.findBy(
                    messageItems,
                    function(messageItem) {
                        return messageItem.id === '' + id;
                    }
                )};
            } else if (filters) {
                filters       = Ext.decode(filters);
                id            = filters[0].value;
                mailAccountId = filters[1].value;
                var items = Ext.Array.filter(
                    messageItems,
                    function(messageItem) {
                        return messageItem.mailFolderId === id &&
                               messageItem.mailAccountId === mailAccountId;
                    }
                );

                return items;
            } else {
                return messageItems;
            }
        },

        getMessageBody : function(mailAccountId, mailFolderId, id) {

            return {success : true, data : conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable
                .getMessageBody(
                    mailAccountId,
                    mailFolderId,
                    id
                )};


        },


        postMessageBody : function(ctx) {

            console.log("POST MessageBody", ctx.xhr.options.jsonData);

            var me    = this,
                body  = {},
                ret   = {},
                newRec;

            for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }

                body[i] = ctx.xhr.options.jsonData[i];
            }


            if (!body.textPlain && body.textHtml) {
                body.textPlain = Ext.util.Format.stripTags(body.textHtml);
            } else {
                body.textHtml = body.textPlain;
            }

            newRec = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable
                .createMessageBody(body);


            ret.responseText = Ext.JSON.encode({success : true, data: {
                id        : newRec.id,
                parentMessageItemId : newRec.parentMessageItemId,
                mailFolderId  : newRec.mailFolderId,
                mailAccountId : newRec.mailAccountId,
                textPlain : newRec.textPlain,
                textHtml  : newRec.textHtml
            }
            });

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });
            return ret;
        },

    });



});