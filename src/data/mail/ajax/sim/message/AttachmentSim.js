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
        'conjoon.cn_mail.data.mail.ajax.sim.Init'
    ]

}, function() {

    var allAttachments = [];

    var attachmentNames = [
        "IMG3701",
        "documents",
        "REPOSITORYPARTSTUFF_packed.type.full7897",
        "images",
        "architecture_draft"
    ];

    var attachmentTypes = [
        {type : 'application/pdf', extension : 'pdf'},
        {type : 'image/jpg',       extension : 'jpg'},
        {type : 'application/x-rar-compressed', extension : 'rar'},
        {type : 'application/zip', extension : 'zip'},
        {type : 'text/plain', extension : 'txt'}
    ];

    var attachmentSizes = [
        '24233',
        '23532553253',
        '6588668',
        '23434',
        '46337773'
        ],
        getRandom    = function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        largestId = 0;

    var getRandomAttachments = function(guaranteed, messageItemId) {

        if (!guaranteed && !getRandom(0, 1)) {
            return null;
        }

        var c           = getRandom(0, 4),
            attachments = [],
            rid         = 0;

        for (var i = 0; i <= c; i++) {

            rid = getRandom(0, 4);

            largestId = messageItemId + (i + 1);

            attachments.push({
                id            : largestId + '',
                messageItemId : messageItemId + '',
                text          : attachmentNames[rid] + '.' +
                                attachmentTypes[rid].extension,
                type          : attachmentTypes[rid].type,
                size          : attachmentSizes[rid]
            })

        }

        return attachments.length ? attachments : null;
    }



    for (var i = 1; i < 100; i++) {

        var attachments = getRandomAttachments(i == 1 || i % 2 == 0, i);

        allAttachments = attachments
                         ? allAttachments.concat(attachments)
                         : allAttachments;
    }

    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url  : /cn_mail\/Attachment(\/\d+)?/,

        doDelete : function(ctx) {

            console.log("DELETE Attachment", ctx.xhr.options);

            var me = this,
                ret = {};

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

            console.log("POST Attachment", ctx.xhr.options.formData.entries());

            var me         = this,
                attachment = {},
                ret        = {},
                id         = ++largestId + '';

            for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }

                attachment[i] = ctx.xhr.options.jsonData[i];
            }

            attachment.id = id;

            allAttachments.push(attachment);

            ret.responseText = Ext.JSON.encode({
                id : id,
                success :true
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
                id;
            if (idPart) {
                id = parseInt(idPart.substring(1), 10);
                console.log("GET", "Attachment", id, new Date());
                return Ext.Array.findBy(allAttachments, function(attachment) {
                    return attachment.id === '' + id;
                });
            } else if (filters) {
                filters = Ext.decode(filters);
                id      = filters[0].value;
                return Ext.Array.filter(allAttachments, function(attachment) {
                    return attachment.messageItemId === id;
                });
            } else {
                return allAttachments;
            }
        }
    });

});