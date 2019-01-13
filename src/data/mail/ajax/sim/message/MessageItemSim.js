/**
 * conjoon
 * (c) 2007-2019 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg/conjoon.org
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
Ext.define('conjoon.cn_mail.data.mail.ajax.sim.message.MessageItemSim', {

    requires : [
        'conjoon.cn_mail.data.mail.ajax.sim.Init',
        'conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable'
    ]

}, function() {

    const MessageTable = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable;

    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url : /cn_mail\/MailAccounts\/(.+)\/MailFolders\/(.+)\/MessageItems(\/.*)?/im,

        doDelete : function(ctx) {

            const me  = this,
                  keys = me.extractCompoundKey(ctx.url),
                  target =  ctx.params.target;

            if (target === 'MessageBody') {
                Ext.raise("Not implemented");
            }

            console.log("DELETE MessageItem - ", target, keys);

            let ret = {}, found = false,
                id = keys.id,
                mailAccountId = keys.mailAccountId,
                mailFolderId = keys.mailFolderId;

            if (!id) {
                console.log("DELETE MessageItem - no numeric id specified.");
                return {success : false};
            }

            messageItems = MessageTable.getMessageItems();

            let mi = null;

            for (var i = messageItems.length - 1; i >= 0; i --) {
                mi = messageItems[i];
                if (mi.id === id && mi.mailFolderId === mailFolderId &&
                    mi.mailAccountId === mailAccountId) {
                    messageItems.splice(i, 1);
                    found = true;
                    break;
                }
            }

            if (!found) {
                return {success : false};
            }

            ret.responseText = Ext.JSON.encode({success : true, data:[]});

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });


            return ret;
        },



        doPost : function(ctx) {

            let target = ctx.params.target;

            if (target === "MessageItem") {
                console.error("POSTing MessageItem - this should only happen in tests");
                return;
            }

            if (ctx.params.target === 'MessageBody') {
                return this.postMessageBody(ctx);
            }

            // MessageDraft
            console.log("POST MessageDraft", ctx, ctx.xhr.options.jsonData);

            var me            = this,
                draft         = {},
                ret           = {},
                MessageTable  = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable;

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

            if (draft['subject'] === 'TESTFAIL') {
                ret.responseText = Ext.JSON.encode({
                    success : false
                });
                return ret;
            }

            draft = MessageTable.createMessageDraft(draft.mailAccountId, draft.mailFolderId, draft);

            ret.responseText = Ext.JSON.encode({
                success: true,
                data : {
                    id: draft.id,
                    mailFolderId: draft.mailFolderId,
                    mailAccountId: draft.mailAccountId
                }});


            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            return ret;

        },




        doPut : function(ctx) {

            var me           = this,
                keys         = me.extractCompoundKey(ctx.url),
                ret          = {},
                MessageTable = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable,
                values       = {},
                result,
                target = ctx.params.target;

            if (["MessageBody", "MessageItem"].indexOf(target) !== -1) {
                for (var i in ctx.xhr.options.jsonData) {
                    if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                        continue;
                    }
                    values[i] = ctx.xhr.options.jsonData[i];
                }

                if (target === 'MessageBody') {
                    console.log("PUT MESSAGE BODY");
                    result = MessageTable.updateMessageBody(keys.mailAccountId, keys.mailFolderId, keys.id, values);
                } else {
                    result = MessageTable.updateMessageItem(keys.mailAccountId, keys.mailFolderId, keys.id, values);
                }

                ret.responseText = Ext.JSON.encode({
                    success: true,
                    data: result
                });

                Ext.Array.forEach(me.responseProps, function (prop) {
                    if (prop in me) {
                        ret[prop] = me[prop];
                    }
                });

                return ret;
            }


            console.log("PUT MessageDraft", ctx.xhr.options.jsonData);

            // MESSAGE DRAFT

            ret           = {};
            MessageTable  = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable;
            values        = {};
            keys          = me.extractCompoundKey(ctx.url);

            for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }
                values[i] = ctx.xhr.options.jsonData[i];
            }

            if (values['subject'] === 'TESTFAIL') {
                ret.responseText = Ext.JSON.encode({
                    success : false
                });
                return ret;

            }

            MessageTable.updateMessageDraft(
                keys.mailAccountId,
                keys.mailFolderId,
                keys.id,
                values
            );

            let draft = MessageTable.getMessageDraft(
                ctx.xhr.options.jsonData.mailAccountId,
                ctx.xhr.options.jsonData.mailFolderId,
                ctx.xhr.options.jsonData.id
            );

            delete values.localId;

            for (var i in values) {
                if (draft[i]) {
                    values[i] = draft[i];
                }
            }

            ret.responseText = Ext.JSON.encode({
                success: true,
                data : values
            });

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            return ret;


        },



        data : function(ctx) {

            var me = this,
                keys = me.extractCompoundKey(ctx.url),
                idPart  = ctx.url.match(this.url)[1],
                filters = ctx.params.filter,
                id,
                MessageTable = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable,
                messageItems = MessageTable.getMessageItems();

            if (ctx.params.target === 'MessageBody') {

                console.log("GET MessageBody ", ctx.url, keys);
                return this.getMessageBody(keys.mailAccountId, keys.mailFolderId, keys.id);
            }

            if (ctx.params.target === 'MessageDraft') {

                var me = this,
                    ret = {},
                    idPart  = ctx.url.match(this.url)[1],
                    filters = ctx.params.filter,
                    mailAccountId, mailFolderId, id,
                    MessageTable  = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable,
                    messageDrafts;

                let keys = me.extractCompoundKey(ctx.url);

                mailAccountId = keys.mailAccountId,
                    mailFolderId  = keys.mailFolderId,
                    id            = keys.id;

                let fitem = MessageTable.getMessageDraft(mailAccountId, mailFolderId, id);

                Ext.Array.forEach(me.responseProps, function (prop) {
                    if (prop in me) {
                        ret[prop] = me[prop];
                    }
                });

                if (!fitem) {

                    return {
                        success : false
                    };

                    //ret.status = "404";
                    //ret.statusText = "Not Found";
                    //return ret;
                }

                return {
                    success : true,
                    data    : fitem
                };

            }



            if (keys.id) {
                id = keys.id;
                let fitem = Ext.Array.findBy(
                    messageItems,
                    function(messageItem) {
                        return messageItem.mailAccountId === '' +keys.mailAccountId &&
                            messageItem.mailFolderId === '' + keys.mailFolderId &&
                            messageItem.id === '' + id;
                    }
                );

                if (!fitem) {
                    return {status : 404, success : false};
                }

                return {data : fitem};

            } else if (!id) {

                var items = Ext.Array.filter(
                    messageItems,
                    function(messageItem) {
                        return messageItem.mailAccountId === keys.mailAccountId &&
                               messageItem.mailFolderId === keys.mailFolderId;
                    }
                );

                return items;
            } else {
                return messageItems;
            }
        },

        getMessageBody : function(mailAccountId, mailFolderId, id) {

            if (conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.peekMessageBody(
                    mailAccountId,
                    mailFolderId,
                    id
                )) {
                return {success : true, data : conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable
                        .getMessageBody(
                            mailAccountId,
                            mailFolderId,
                            id
                        )};
            }

            return {success : false};

        },


        postMessageBody : function(ctx) {

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
            } else if (!body.textHtml) {
                body.textHtml = body.textPlain;
            }

            let draft = MessageTable.createMessageDraft(body.mailAccountId, body.mailFolderId, {});
            newRec = MessageTable.updateMessageBody(body.mailAccountId, body.mailFolderId, draft.id, {
                textPlain :  body.textPlain,
                textHtml : body.textHtml
            });

            ret.responseText = Ext.JSON.encode({success : true, data: {
                id        : newRec.id,
                mailFolderId  : newRec.mailFolderId,
                mailAccountId : newRec.mailAccountId,
                textPlain : newRec.textPlain,
                textHtml  : newRec.textHtml
            }
            });

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });
            return ret;
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
                mailFolderId,mailAccountId;

            if (id == 'MessageItems') {
                id = undefined;
                pt.push('foo');
            }

            mailFolderId = pt.pop();
            mailFolderId = pt.pop();
            mailAccountId = pt.pop();
            mailAccountId = pt.pop();

            return {
                mailAccountId : decodeURIComponent(mailAccountId),
                mailFolderId : decodeURIComponent(mailFolderId),
                id : id ? decodeURIComponent(id) : undefined
            };
        }

    });



});