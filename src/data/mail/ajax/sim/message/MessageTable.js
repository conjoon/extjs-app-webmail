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
Ext.define('conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable', {

    singleton : true,

    requires : [
        'conjoon.cn_mail.data.mail.ajax.sim.message.AttachmentTable'
    ],

    messageBodies : null,

    messageItems : null,

    baseMessageItems : null,


    buildRandomNumber : function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    buildRandomSizeInBytes : function() {
        var me = this;

        return me.buildRandomNumber(1, 10000000);
    },

    buildPreviewText : function(id) {
        var me = this;

        return me.getMessageBody(id).textPlain.substring(0, 200);
    },

    buildRandomDate : function() {
        var me = this,
            d  = me.buildRandomNumber(1, 31),
            m  = me.buildRandomNumber(1, 12),
            y  = me.buildRandomNumber(2007, 2017),
            h  = me.buildRandomNumber(0, 23),
            i  = me.buildRandomNumber(0, 59),
            pad = function(v) {
                return v < 10 ? '0' + v : v;
            };

        return Ext.String.format(
            "{0}-{1}-{2} {3}:{4}",
            y, pad(m), pad(d), pad(h), pad(i)
        );
    },

    buildAddresses : function(type, i) {
        // special for tests
        if (i == 1 && type !== 'to') {
            return [];
        }

        return [{
            name    : 'Firstname Lastname' + type,
            address : 'name' + type + '@domain.tld'
        }, {
            name    : 'Firstname 1 Lastname 2' + type,
            address : 'name1' + type + '@domain1.tld'
        }]

    },

    createMessageBody : function(data) {

        var me  = this,
            inc = 0;

        // make sure alls message items are initialized along withh their
        // messagebodies
        me.getMessageItems();

        if (!me.messageBodies) {
            me.messageBodies = {};
        }

        for (var i in me.messageBodies) {
            if (!me.messageBodies.hasOwnProperty(i)) {
                continue;
            }
            if (parseInt(i, 10) > inc) {
                inc = parseInt(i, 10);
            }
        }

        inc++;

        me.messageBodies[inc] = Ext.applyIf({id : inc}, data);

        return me.messageBodies[inc];
    },

    updateMessageBody : function(id, data) {

        var me      = this,
            message = me.getMessageBody(id);

        // just in case
        delete data.id;

        if (!data.textPlain) {
            data.textPlain = Ext.util.Format.stripTags(data.textHtml);
        }

        Ext.apply(message, data);
        me.messageBodies[id] = message;

        // force to refresh the date
        me.updateAllItemData(id, {});

        return message;
    },

    getMessageBody : function(id) {

        var me = this,
            message;

        if (!me.messageBodies) {
            me.messageBodies = {};
        }
        if (me.messageBodies[id]) {
            return me.messageBodies[id];
        }

        var messages = [
            "<ul><li>Blindtext - Lorem ipsum dolor sit amet, consectetuer adipiscing  elit. Aenean commodo ligula eget dolor. Aenean massa.</li><li>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.</li> <li>Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.</li> <li>In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt.</li></ul>",
            "<p>Text here: Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa <strong>strong</strong>. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede <a class=\"external ext\" href=\"#\">link</a> mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi.</p>",
            "<blockquote>Following news! Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa <strong>strong</strong>. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In <em>em</em> enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam <a class=\"external ext\" href=\"#\">link</a> dictum felis eu pede mollis pretium. </blockquote>"
        ];

        message = messages[(parseInt(id, 10) % messages.length)];

        me.messageBodies[id] = {
            id        : id,
            textHtml  : message,
            textPlain : Ext.util.Format.stripTags(message)
        };

        return me.messageBodies[id];
    },

    getNextMessageDraftKey : function() {
        var me = this;

        return (me.getMessageDrafts().length + 1) + '';
    },


    getMessageDraft : function(id) {
        var me     = this,
            drafts = me.getMessageDrafts();

        for (var i = 0, len = drafts.length; i < len; i++) {
            if (drafts[i]['id'] == id) {
                return drafts[i];
            }
        }

        return null;
    },


    getMessageDrafts : function() {

        var me               = this,
            messageDrafts    = [],
            baseMessageItems = me.buildBaseMessageItems();

        if (me.messageDrafts) {
            return me.messageDrafts;
        }

        for (var i = 0; i < baseMessageItems.length; i++) {

            var bccAddresses = me.buildAddresses('bcc', i);

            messageDrafts.push(Ext.apply({
                bcc : bccAddresses
            }, baseMessageItems[i]));

            delete messageDrafts[messageDrafts.length - 1].from;
        }

        me.messageDrafts = messageDrafts;

        return me.messageDrafts;
    },


    updateMessageDraft : function(id, values) {

        var me = this;

        me.updateAllItemData(id, values);

    },


    updateMessageItem : function(id, values) {

        var me = this;

        me.updateAllItemData(id, values);
    },


    createMessageDraft : function(draftData) {

        var me            = this,
            id            = me.getNextMessageDraftKey(),
            mailFolderId  = '4',
            messageDrafts = me.getMessageDrafts(),
            messageItems  = me.getMessageItems(),
            date          = Ext.util.Format.date(new Date(), 'Y-m-d H:i');

        //manually fake attachments and messageBody
        conjoon.cn_mail.data.mail.ajax.sim.message.AttachmentTable.attachments[id] = null;
        if (!me.messageBodies || !me.messageBodies[id]) {
            me.getMessageBody(id);
            me.messageBodies[id] = {textPlain : "", textHtml : ""};
        }

        messageDrafts.push(Ext.apply(draftData, {
            id           : id,
            mailFolderId : mailFolderId,
            isRead       : false,
            date         : date
        }));

        messageItems.push(Ext.apply(draftData, {
            id           : id,
            mailFolderId : mailFolderId,
            isRead       : false,
            date         : date
        }));

        me.baseMessageItems.push(Ext.apply(draftData, {
            id           : id,
            mailFolderId : mailFolderId,
            date         : date
        }));


        // re init
        me.getMessageItems();
        me.getMessageDrafts();

        return messageDrafts[messageDrafts.length - 1];
    },


    updateAllItemData : function(id, values) {
        var me     = this,
            draft  = me.getMessageDraft(id),
            item   = me.getMessageItem(id),
            dataItems = [draft, item],
            dataItems, item;


        for (var i = 0, len = dataItems.length; i < len; i++) {

            item = dataItems[i];

            item['date'] = Ext.util.Format.date(new Date(), 'Y-m-d H:i');

            for (var prop in values) {

                if (!item.hasOwnProperty(prop)) {
                    continue;
                }

                switch (prop) {
                    case 'to':
                    case 'cc':
                    case 'bcc':
                        if (Ext.isString(values[prop]))
                        item[prop] = Ext.JSON.decode(values[prop]);
                        break;
                    default:
                        item[prop] = values[prop];
                        break;
                }


            }

        }
    },


    getMessageItem : function(id) {
        var me    = this,
            items = me.getMessageItems();

        for (var i = 0, len = items.length; i < len; i++) {
            if (items[i]['id'] == id) {
                return items[i];
            }
        }

        return null;
    },


    getMessageItems : function() {

        var me               = this,
            AttachmentTable  = conjoon.cn_mail.data.mail.ajax.sim.message
                               .AttachmentTable,
            baseMessageItems = me.buildBaseMessageItems(),
            messageItems     = subjects = sender = [];

        if (me.messageItems) {
            for (var i = 0, len = me.messageItems.length; i < len; i++) {
                me.messageItems[i].previewText    = me.buildPreviewText(baseMessageItems[i].id);
                me.messageItems[i].hasAttachments = AttachmentTable.getAttachments(baseMessageItems[i].id)
                                                    ? 1 : 0;
            }
            return me.messageItems;
        }

        for (var i = 0; i < baseMessageItems.length; i++) {

            messageItems.push(Ext.apply({
                // leave first one as unread for tests
                isRead         : i == 0 ? false : (me.buildRandomNumber(0, 1) ? true : false),
                hasAttachments : AttachmentTable.getAttachments(baseMessageItems[i].id) ? 1 : 0,
                size           : me.buildRandomSizeInBytes(),
                previewText    : me.buildPreviewText(baseMessageItems[i].id)
            }, baseMessageItems[i]));
        }

        me.messageItems = messageItems;

        return me.messageItems;
    },

    buildBaseMessageItems : function() {
        var me = this,
            baseMessageItems = subjects = sender = [];

        if (me.baseMessageItems) {
            return me.baseMessageItems;
        }

        subjects = [
            'Welcome to conjoon',
            'Re: Ihre Buchung in der Unterkunft',
            'Achtung! DVBT Antennen sind bald nutzlos, Thorsten Suckow-Homberg',
            'Verbindliche Bestellung Banshee Headbadge',
            'Vielen Dank für Ihre Bestellung',
            'Monte Walsh [Blu Ray] und mehr aus DVD & Blu Ray Klassiker'
        ];

        sender = [
            'tsuckow@conjoon.org',
            'service@booking.com',
            'info@ebay.de',
            'mailer@mtb-news.de',
            'service@otto.de',
            'info@amazon.de'
        ];

        for (var i = 0; i < 100; i++) {

            baseMessageItems.push({
                id            : (i + 1) + '',
                date           : me.buildRandomDate(),
                // leave first one as unread for tests
                subject        : subjects[me.buildRandomNumber(0, 5)],
                from           : sender[me.buildRandomNumber(0, 5)],
                to             : me.buildAddresses('to', i),
                cc             : me.buildAddresses('cc', i),
                mailFolderId   : (i % 5 == 0 ? 5 : i % 5) + '',
                messageBodyId  : (i + 1) + ''
            });
        }

        me.baseMessageItems = baseMessageItems;

        return me.baseMessageItems;
    }


});