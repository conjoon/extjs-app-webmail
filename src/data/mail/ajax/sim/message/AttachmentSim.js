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
 * Ext.ux.ajax.SimManager hook for {@link conjoon.cn_mail.model.mail.message.ItemAttachment}
 * and {@link conjoon.cn_mail.model.mail.message.DraftAttachment}
 * data.
 */
Ext.define('conjoon.cn_mail.data.mail.ajax.sim.message.AttachmentSim', {

    requires : [
        'conjoon.cn_mail.data.mail.ajax.sim.Init',
        'conjoon.cn_mail.data.mail.ajax.sim.message.AttachmentTable',
        'conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable'
    ]

}, function() {

    var AttachmentTable = conjoon.cn_mail.data.mail.ajax.sim.message.AttachmentTable;

    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url : /cn_mail\/MailAccounts\/(.+)\/MailFolders\/(.+)\/MessageItems\/(.+)\/Attachments(\/.*)?/im,

        doDelete : function(ctx) {

            console.log("DELETE Attachment", ctx.xhr.options);

            let me  = this,
                keys = me.extractCompoundKey(ctx.url),
                ret = {}, found;


            found = AttachmentTable.deleteAttachment(
                keys.mailAccountId, keys.mailFolderId, keys.parentMessageItemId, keys.id);

            ret.responseText = Ext.JSON.encode({
                success :true
            });

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });
            return ret;

        },

        doPost : function(ctx) {

            const me = this;

            let keys       = me.extractCompoundKey(ctx.url),
                attachment = {},
                rec        = {},
                ret        = {};

            console.log("POST Attachment", keys, ctx.xhr.options.records[0].data);

            for (var i in ctx.xhr.options.records[0].data) {
                if (!ctx.xhr.options.records[0].data.hasOwnProperty(i)) {
                    continue;
                }

                attachment[i] = ctx.xhr.options.records[0].data[i];
            }

            rec = AttachmentTable.createAttachment(
                keys.mailAccountId,
                keys.mailFolderId,
                keys.parentMessageItemId,
                attachment
            );

            conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.updateAllItemData(
                keys.mailAccountId,
                keys.mailFolderId,
                keys.parentMessageItemId,
                {hasAttachments : 1}
            );

            ret.responseText = Ext.JSON.encode({
                data : {
                    id                  : rec.id,
                    parentMessageItemId : rec.parentMessageItemId,
                    mailAccountId       : rec.mailAccountId,
                    mailFolderId        : rec.mailFolderId,
                    success             : true
                }
            });

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });
            return ret;
        },

        data: function(ctx) {
            const me = this;

            let keys = me.extractCompoundKey(ctx.url);

            var id  = keys.id,
                params  = ctx.params,
                filters = params.filter;

            if (id) {

                console.log("GET", "Attachment", id, params.mailAccountId,
                    params.mailFolderId, params.originalMessageItemId, new Date());
                return AttachmentTable.getAttachment(
                    keys.mailAccountId,
                    keys.mailFolderId,
                    keys.parentMessageItemId,
                    keys.id
                );

            } else if (!id)  {

                attachments = AttachmentTable.getAttachments(
                    keys.mailAccountId,
                    keys.mailFolderId,
                    keys.parentMessageItemId
                );
                console.log(
                    "GET", "Attachments for Message id",
                    keys.mailAccountId,
                    keys.mailFolderId,
                    keys.parentMessageItemId,
                    new Date(), attachments
                );
                return attachments;
            } else {
                return [{text : "NOT SUPPORTED"}];
            }
        },

        /**
         * Returns a numeric array with the following values:
         * mailAccountId, mailFolderId, id
         *
         * @param url
         * @returns {*[]}
         */
        extractCompoundKey : function(url) {

            let pt = url.split('/'),
                id = pt.pop().split('?')[0],
                parentMessageItemId, mailFolderId,mailAccountId;

            if (id == 'Attachments') {
                id = undefined;
                pt.push('foo');
            }

            parentMessageItemId = pt.pop();
            parentMessageItemId = pt.pop();
            mailFolderId = pt.pop();
            mailFolderId = pt.pop();
            mailAccountId = pt.pop();
            mailAccountId = pt.pop();

            return {
                mailAccountId : decodeURIComponent(mailAccountId),
                mailFolderId : decodeURIComponent(mailFolderId),
                parentMessageItemId : decodeURIComponent(parentMessageItemId),
                id : id ? decodeURIComponent(id) : undefined
            };
        }
    });

});