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
        'conjoon.cn_mail.data.mail.ajax.sim.Init'
    ]

}, function() {


    var subjects = [
        'Welcome to conjoon',
        'Re: Ihre Buchung in der Unterkunft',
        'Achtung! DVBT Antennen sind bald nutzlos, Thorsten Suckow-Homberg',
        'Verbindliche Bestellung Banshee Headbadge',
        'Vielen Dank für Ihre Bestellung',
        'Monte Walsh [Blu Ray] und mehr aus DVD & Blu Ray Klassiker'
    ];

    var largestId = 0;

    var getRandomDate = function() {
        var d = getRandom(1, 31),
            m = getRandom(1, 12),
            y = getRandom(2007, 2017),
            h = getRandom(0, 23),
            i = getRandom(0, 59),
            pad = function(v) {
                return v < 10 ? '0' + v : v;
            };

        return Ext.String.format(
            "{0}.{1}.{2} {3}:{4}",
            pad(d), pad(m), y, pad(h), pad(i)
        );

    }

    var messageItems =  [],
        getRandom    = function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

    var getAddresses = function(type, i) {

        if (i == 2 && type !== 'to') {
            return [];
        }

        return [{
            name    : 'Firstname Lastname' + type,
            address : 'name' + type + '@domain.tld'
        }, {
            name    : 'Firstname 1 Lastname 2' + type,
            address : 'name1' + type + '@domain1.tld'
        }]

    };

    for (var i = 1; i < 100; i++) {

        var toAddresses  = getAddresses('to', i),
            ccAddresses  = getAddresses('cc', i),
            bccAddresses = getAddresses('bcc', i);

        messageItems.push({
            id            : i + '',
            subject        : subjects[getRandom(0, 5)],
            date           : getRandomDate(),
            mailFolderId   : (i % 5 == 0 ? 5 : i % 5) + '',
            messageBodyId  : i + '',
            to             : toAddresses,
            cc             : ccAddresses,
            bcc            : bccAddresses
        });
    }

    largestId = i;

    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url  : /cn_mail\/MessageDraft(\/\d+)?/,

        doPut : function(ctx) {

            console.log("PUT MessageDraft", ctx.xhr.options.jsonData);

            var me = this,
                ret = {};

            var messageItem = Ext.Array.findBy(messageItems, function(messageItem) {
                return messageItem.id === '' + ctx.xhr.options.jsonData.id;
            });

            for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }
                messageItem[i] = ctx.xhr.options.jsonData[i];
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

            var me    = this,
                draft = {},
                ret   = {},
                id    = ++largestId + '';

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
            messageItems.push(draft);

            ret.responseText = Ext.JSON.encode({
                id : id,
                mailFolderId  : '4',
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
                return Ext.Array.findBy(messageItems, function(messageItem) {
                    return messageItem.id === '' + id;
                });
            } else if (filters) {

                filters = Ext.decode(filters);
                id      = filters[0].value;
                return Ext.Array.filter(messageItems, function(messageItem) {
                    return messageItem.mailFolderId === id;
                });
            } else {
                return messageItems;
            }
        }
    });


});