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

        doPut : function(ctx) {

            console.log("PUT MessageDraft", ctx.xhr.options.jsonData);

            var me            = this,
                ret           = {},
                MessageTable  = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable,
                messageDrafts = MessageTable.getMessageDrafts();

            var draft = Ext.Array.findBy(messageDrafts, function(draft) {
                return draft.id === '' + ctx.xhr.options.jsonData.id;
            });

            for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }
                messageDrafts[i] = ctx.xhr.options.jsonData[i];
            }

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
                MessageTable  = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable,
                messageDrafts = MessageTable.getMessageDrafts();
                id            = MessageTable.getNextMessageDraftKey();

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

            draft.id = id;
            draft.mailFolderId  = '4';
            messageDrafts.push(draft);

            ret.responseText = Ext.JSON.encode({
                id            : id,
                mailFolderId  : '4',
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
                messageDrafts = MessageTable.getMessageDrafts();

            if (idPart) {
                id = parseInt(idPart.substring(1), 10);
                return Ext.Array.findBy(messageDrafts, function(draft) {
                    return draft.id === '' + id;
                });
            } else if (filters) {

                filters = Ext.decode(filters);
                id      = filters[0].value;
                return Ext.Array.filter(messageDrafts, function(draft) {
                    return draft.mailFolderId === id;
                });
            } else {
                return messageItems;
            }
        }
    });


});