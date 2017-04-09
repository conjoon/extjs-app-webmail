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
 * Ext.ux.ajax.SimManager hook for {@link conjoon.cn_mail.model.mail.message.MessageBody}
 * data.
 */
Ext.define('conjoon.cn_mail.data.mail.ajax.sim.message.MessageBodySim', {

    requires : [
        'conjoon.cn_mail.data.mail.ajax.sim.Init'
    ]

}, function() {

    var messages = [
        "<ul><li>Lorem ipsum dolor sit amet, consectetuer adipiscing  elit. Aenean commodo ligula eget dolor. Aenean massa.</li><li>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.</li> <li>Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.</li> <li>In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt.</li></ul>",
        "<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa <strong>strong</strong>. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede <a class=\"external ext\" href=\"#\">link</a> mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi.</p>",
        "<blockquote> Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa <strong>strong</strong>. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In <em>em</em> enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam <a class=\"external ext\" href=\"#\">link</a> dictum felis eu pede mollis pretium. </blockquote>"

    ];

    var messageBodies = [],
        getRandom    = function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

    var largestId = 0;

    if (messageBodies.length == 0) {
        for (var i = 1; i < 100; i++) {
            messageBodies.push({
                id          : '' +  i,
                text        : messages[getRandom(0, 1)],
                textHtml    : messages[getRandom(0, 1)] + messages[getRandom(1, 2)] + messages[getRandom(0, 2)]
            });
        }
    }

    largestId = i;



    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url  : /cn_mail\/MessageBody(\/\d+)?/,

        doPut : function(ctx) {

            console.log("PUT MessageBody", ctx.xhr.options.jsonData);

            var me = this,
                ret = {};

            var messageBody = Ext.Array.findBy(messageBodies, function(messageBody) {
                return messageBody.id === '' + ctx.xhr.options.jsonData.id;
            });

            for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }
                messageBody[i] = ctx.xhr.options.jsonData[i];
            }

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            return ret;

        },

        doPost : function(ctx) {

            console.log("POST MessageBody", ctx.xhr.options.jsonData);

            var me    = this,
                body  = {},
                ret   = {},
                id    = ++largestId + '';

            for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }

                body[i] = ctx.xhr.options.jsonData[i];
            }

            body.id = id;

            messageBodies.push(body);

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

            var idPart = ctx.url.match(this.url)[1],
                id;
            if (idPart) {

                id = parseInt(idPart.substring(1), 10);

                console.log("GET MessageBody", id);

                return Ext.Array.findBy(messageBodies, function(messageBody) {
                    return messageBody.id === '' + id;
                });
            } else {
                return messageBodies;
            }
        }
    });

});