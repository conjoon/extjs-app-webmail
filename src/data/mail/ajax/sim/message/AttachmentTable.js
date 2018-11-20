/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
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
 *
 */
Ext.define('conjoon.cn_mail.data.mail.ajax.sim.message.AttachmentTable', {

    singleton : true,

    attachments : null,

    largestAttachmentId : 0,

    getRandom : function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },


    createAttachment : function(mailAccountId, mailFolderId, parentMessageItemId, attachmentData) {

        var me            = this,
            key           =  mailAccountId + '-' + mailFolderId + '-' + parentMessageItemId;

        if (!me.attachments) {
            me.attachments = {};
        }

        if (!me.attachments[key]) {
            me.attachments[key] = [];
        }

        attachmentData.id = ++me.largestAttachmentId;

        me.attachments[key].push(attachmentData);

        conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.updateAllItemData(
            mailAccountId, mailFolderId, parentMessageItemId, {}
        );

        return attachmentData;
    },

    deleteAttachment : function(mailAccountId, mailFolderId, parentMessageItemId, id) {

        if (arguments.length < 4) {
            Ext.raise("Unexpected missing arguments.");
        }


        let me  = this,
            key = mailAccountId + '-' + mailFolderId + '-' + parentMessageItemId,
            found = 0;

        if (!me.attachments) {
            me.attachments = {};
        }

        if (me.attachments[key]) {
            let attach = me.attachments[key];
            for (let i = attach.length - 1; i >= 0; i--) {
                if (attach[i].id == id) {
                    found++;
                    attach.splice(i, 1);
                }
            }
        }

        if (found > 0) {
            conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.updateAllItemData(
                mailAccountId, mailFolderId, parentMessageItemId, {});
            if (me.attachments[key].length == 0) {
                me.attachments[key] = null;
            }
        }

        return found;
    },


    getAttachments : function(mailAccountId, mailFolderId, parentMessageItemId) {
        var me         = this,
            attachments = null,
            rec,
            key = mailAccountId + '-' + mailFolderId + '-' + parentMessageItemId;

        let wasEmpty = false;

        if (!me.attachments) {
            wasEmpty = true;
            me.attachments = {};
        }

        if (me.attachments.hasOwnProperty(key)) {
            return me.attachments[key];
        }

        return null;
    },


    createRandomAttachments : function(mailAccountId, mailFolderId, parentMessageItemId) {

        const me = this,
              key = [mailAccountId, mailFolderId, parentMessageItemId].join('-');

        let attachmentNames = [
                "IMG3701",
                "documents",
                "REPOSITORYPARTSTUFF_packed.type.full7897",
                "images",
                "architecture_draft"
            ],
            attachmentTypes = [
                {type : 'application/pdf', extension : 'pdf'},
                {type : 'image/jpg',       extension : 'jpg'},
                {type : 'application/x-rar-compressed', extension : 'rar'},
                {type : 'application/zip', extension : 'zip'},
                {type : 'text/plain', extension : 'txt'}
            ],
            attachmentSizes = [
                '24233',
                '23532553253',
                '6588668',
                '23434',
                '46337773'
            ], rec;

        if (!me.attachments) {
            me.attachments = {};
        }


        for (var i = 0, len = me.getRandom(0, 5); i < len; i++) {

            if (!me.attachments[key]) {
                me.attachments[key] = [];
            }

            rec = {
                id                  : ++me.largestAttachmentId,
                parentMessageItemId : parentMessageItemId,
                mailFolderId        : mailFolderId,
                mailAccountId       : mailAccountId,
                text                : attachmentNames[me.getRandom(0, 4)] + '.' +
                attachmentTypes[me.getRandom(0, 4)].extension,
                type                : attachmentTypes[me.getRandom(0, 4)].type,
                size                : attachmentSizes[me.getRandom(0, 4)]
            };

            me.attachments[key].push(rec);
        }


        return me.attachments[key];

    },


    getAttachmentAt : function(pos) {

        const me = this;

        let ind = 0;

        for (let messageItemId in me.attachments) {
            for (let i = 0, len = me.attachments[messageItemId].length; i < len; i++) {
                if (ind === pos) {
                    return me.attachments[messageItemId][i];
                }
                ind++;
            }
        }

        return null;
    },


    getAttachment : function(mailAccountId, mailFolderId, parentMessageItemId, attachmentId) {

        var me            = this,
            messageItemId = parentMessageItemId,
            key           = mailAccountId + '-' + mailFolderId + '-' + parentMessageItemId;

        if (!me.attachments) {
            me.attachments = {};
        }


        if (me.attachments[key]) {
            for (var i = 0, len = me.attachments[key].length; i < len; i++) {
                if (me.attachments[key][i].id == attachmentId) {
                    return me.attachments[key][i];
                }
            };
        }

        return null;
    }


});