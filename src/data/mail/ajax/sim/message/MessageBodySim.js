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
        'conjoon.cn_mail.data.mail.ajax.sim.Init',
        'conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable'

    ]

}, function() {

    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url  : /cn_mail\/MessageBody(\/\d+)?/,

        doPut : function(ctx) {

            console.log("PUT MessageBody", ctx.xhr.options.jsonData);

            var me          = this,
                ret         = {},
                messageBody = {};

            for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }
                messageBody[i] = ctx.xhr.options.jsonData[i];
            }

            conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable
                .updateMessageBody(ctx.xhr.options.jsonData.id, messageBody);


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
                newRec;

            for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }

                body[i] = ctx.xhr.options.jsonData[i];
            }

            if (!body.textPlain && body.textHtml) {
                body.textPlain = Ext.util.Format.stripTags(body.textHtml);
            } else {
                body.textHtml = body.textPlain;
            }

            newRec = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable
                     .createMessageBody(body);


            ret.responseText = Ext.JSON.encode({
                id      : newRec.id,
                success : true
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
                console.log("GET", "MessageBody for id", id, new Date());
                return conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable
                       .getMessageBody(id);

            } else {
                return [{textHtml : 'NOT IMPLEMENTED'}];
            }
        }
    });

});