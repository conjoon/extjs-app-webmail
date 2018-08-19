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
 *
 */
Ext.define('conjoon.cn_mail.data.mail.ajax.sim.message.AttachmentTable', {

    singleton : true,

    attachments : null,

    largestAttachmentId : 0,

    getRandom : function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },


    createAttachment : function(attachmentData) {

        var me            = this,
            messageItemId = attachmentData.messageItemId;

        if (!me.attachments) {
            me.attachments = {};
        }

        if (!me.attachments[messageItemId]) {
            me.attachments[messageItemId] = [];
        }

        attachmentData.originalId = ++me.largestAttachmentId;
        attachmentData.id         = 'dev_sys_conjoon_org' + '-' + attachmentData.originalId;

        me.attachments[messageItemId].push(attachmentData);

        conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.updateAllItemData(messageItemId, {});

        return attachmentData;
    },

    deleteAttachment : function(attachmentId) {

        var me = this,
            messageItemId,
            attachmentIndex;

        if (!me.attachments) {
            me.attachments = {};
        }

        for (var i in me.attachments) {
            if (!me.attachments.hasOwnProperty(i)) {
                continue;
            }

            if (!me.attachments[i]) {
                continue;
            }

            for (var a = 0, len = me.attachments[i].length; a < len; a++) {

                if (me.attachments[i][a].id == attachmentId) {
                    messageItemId   = i;
                    attachmentIndex = a;
                    break;
                }
            }

            if (messageItemId) {
                break;
            }
        }

        if (messageItemId) {
            conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.updateAllItemData(messageItemId, {});
            me.attachments[messageItemId].splice(a, 1);
            if (me.attachments[messageItemId].length == 0) {
                me.attachments[messageItemId] = null;
            }
        }

    },

    getAttachments : function(accountId, folderId, messageItemId, originalMessageItemId) {
        var me         = this,
            attachments = null,
            rec;

        let wasEmpty = false;

        if (!me.attachments) {
            wasEmpty = true;
            me.attachments = {};
        }

        if (me.attachments.hasOwnProperty(messageItemId)) {
            return me.attachments[messageItemId];
        }

        if (!wasEmpty) {
            if (!me.getRandom(0, 1)) {
                me.attachments[messageItemId] = null;
                return me.attachments[messageItemId];
            }
        }

        for (var i = 0, len = me.getRandom(1, 5); i < len; i++) {
            if (!attachments) {
                attachments = [];
            }
            rec = me.getAttachment(++me.largestAttachmentId, accountId, folderId, messageItemId, originalMessageItemId);

            attachments.push(rec);
        }

        me.attachments[messageItemId] = attachments;

        return me.attachments[messageItemId];
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


    getAttachment : function(attachmentId, accountId, folderId, messageItemId, originalMessageItemId) {

        var me = this;

        if (!me.attachments) {
            me.attachments = {};
        }


        if (me.attachments[messageItemId]) {
            for (var i = 0, len = me.attachments[messageItemId].length; i < len; i++) {
                if (me.attachments[messageItemId][i].id == attachmentId) {
                    return me.attachments[messageItemId][i];
                }
            };
        }

        var attachmentNames = [
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
            ];

        if (!me.attachments[messageItemId]) {
            me.attachments[messageItemId] = [];

        }

        me.attachments[messageItemId].push({
            id                    : 'dev_sys_conjoon_org' + '-' + attachmentId,
            originalId            : attachmentId  + '',
            originalMessageItemId : originalMessageItemId,
            messageItemId         : messageItemId + '',
            mailFolderId          : folderId,
            mailAccountId         : accountId,
            text                  : attachmentNames[me.getRandom(0, 4)] + '.' +
                                    attachmentTypes[me.getRandom(0, 4)].extension,
            type                  : attachmentTypes[me.getRandom(0, 4)].type,
            size                  : attachmentSizes[me.getRandom(0, 4)]
        });

        return me.attachments[messageItemId][me.attachments[messageItemId].length - 1];

    }


});