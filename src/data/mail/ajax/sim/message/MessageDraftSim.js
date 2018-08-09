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

        url  : /cn_mail\/MessageDraft(\/\d+)?/,

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
                values        = {};

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

            MessageTable.updateMessageDraft(ctx.xhr.options.jsonData.id, values);

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            return ret;

        },

        doPost : function(ctx) {

            console.log("POST MessageDraft", ctx.xhr.options.jsonData);

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

            draft = MessageTable.createMessageDraft(draft);

            ret.responseText = Ext.JSON.encode({
                id            : draft.id,
                mailFolderId  : draft.mailFolderId,
                success       : true
            });

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
                MessageTable  = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable,
                messageDrafts;

            if (idPart) {
                id = parseInt(idPart.substring(1), 10);
                return MessageTable.getMessageDraft(id);
            } else if (filters) {
                messageDrafts = MessageTable.getMessageDrafts();
                filters = Ext.decode(filters);
                id      = filters[0].value;
                return Ext.Array.filter(messageDrafts, function(draft) {
                    return draft.mailFolderId === id;
                });
            } else {
                return MessageTable.getMessageDrafts();
            }
        }
    });


});