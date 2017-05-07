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

    messageItems : null,

    baseMessageItems : null,

    buildRandomNumber : function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },


    buildRandomSizeInBytes : function() {
        var me = this;

        return me.buildRandomNumber(1, 10000000);
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
            "{0}.{1}.{2} {3}:{4}",
            pad(d), pad(m), y, pad(h), pad(i)
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

    getNextMessageDraftKey : function() {
        var me = this;

        return (me.getMessageDrafts().length + 1) + '';
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

    getMessageItems : function() {

        var me               = this,
            baseMessageItems = me.buildBaseMessageItems(),
            messageItems     = subjects = sender = [];

        if (me.messageItems) {
            return me.messageItems;
        }

        for (var i = 0; i < baseMessageItems.length; i++) {

            messageItems.push(Ext.apply({
                // leave first one as unread for tests
                isRead         : i == 0 ? false : (me.buildRandomNumber(0, 1) ? true : false),
                date           : me.buildRandomDate(),
                hasAttachments : i == 0 || i % 2 == 0,
                size           : me.buildRandomSizeInBytes()
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