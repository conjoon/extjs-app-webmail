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

describe('conjoon.cn_mail.view.mail.message.reader.MessageItemUpdaterTest', function(t) {

    var viewModel;

    var view,
        viewConfig,
        createMessageItem = function() {

            var messageItem = Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                id             : 1,
                size           : 400,
                subject        : 'SUBJECT',
                from           : 'FROM',
                date           : 'DATE',
                to             : 'TO',
                hasAttachments : true,
                seen           : Math.random() >= 0.5 === true,
                recent         : Math.random() >= 0.5 === true,
                flagged        : Math.random() >= 0.5 === true,
                answered       : Math.random() >= 0.5 === true,
                draft          : Math.random() >= 0.5 === true,
            });

            return messageItem;
        },
        createMessageDraft = function() {
            var messageDraft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                id      : 1,
                subject : 'subject',
                date    : '2017-07-30 23:45:00',
                to      : 'test@testdomain.tld',
                seen  : Math.random() >= 0.5 === true
            });

            messageDraft.attachments().add(Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment', {
                text : 'myAttachment',
                size : 20
            }));

            messageDraft.attachments().add(Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment', {
                text : 'myAttachment2',
                size : 40
            }));

            messageDraft.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
                textHtml  : 'Html text',
                textPlain : 'Plain Text'
            }));

            return messageDraft;
        };



    t.requireOk('conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater', function() {

        t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {

        t.requireOk('conjoon.cn_mail.model.mail.message.MessageBody', function () {

            t.it("Should make sure MessageItemUpdater exist", function(t) {

                t.expect(conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater).toBeDefined();

            });

            t.it("updateItemWithDraft()", function(t) {

                var messageItem = createMessageItem(),
                    UPDATER     =  conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater,
                    messageDraft, exc, e, oldSize = messageItem.get('size'),
                    messageDraft = createMessageDraft(),
                    expectedSize, ret;



                try {UPDATER.updateItemWithDraft(messageItem);} catch (e) {exc = e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain('messagedraft must be an instance of');

                exc = null;

                try {UPDATER.updateItemWithDraft(null, messageDraft);} catch (e) {exc = e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain('messageitem must be an instance of');


                ret = UPDATER.updateItemWithDraft(messageItem, messageDraft);

                t.expect(ret).toBe(messageItem);


                t.expect(messageItem.get('subject')).toBe(messageDraft.get('subject'));
                t.expect(messageItem.get('date')).toBe(messageDraft.get('date'));
                t.expect(messageItem.get('previewText')).toContain(messageDraft.getMessageBody().get('textPlain'));
                t.expect(messageItem.get('hasAttachments')).toBe(true);

                t.expect(messageItem.get('seen')).toBe(messageDraft.get('seen'));
                t.expect(messageItem.get('recent')).toBe(messageDraft.get('recent'));
                t.expect(messageItem.get('flagged')).toBe(messageDraft.get('flagged'));
                t.expect(messageItem.get('answered')).toBe(messageDraft.get('answered'));
                t.expect(messageItem.get('draft')).toBe(messageDraft.get('draft'));

                expectedSize = 0;
                expectedSize += messageDraft.getMessageBody().get('textPlain').length;
                expectedSize += messageDraft.getMessageBody().get('textHtml').length;

                for (var i = 0, len = messageDraft.attachments().getRange().length; i < len; i++) {
                    expectedSize += messageDraft.attachments().getRange()[i].get('size');
                }

                t.expect(messageItem.get('size')).toBeGreaterThan(0);
                t.expect(messageItem.get('size')).not.toBe(oldSize);
                t.expect(messageItem.get('size')).toBe(expectedSize);

                t.expect(messageItem.get('to')).not.toBe(messageDraft.get('to'));
                t.expect(messageItem.get('to')).toEqual(messageDraft.get('to'));

                var attachments = messageItem.get('attachments');

                // was committed
                t.expect(messageItem.dirty).toBe(false);

            });


            t.it("createItemFromDraft()", function(t) {

                let UPDATER     =  conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater,
                    exc, e,
                    messageDraft = createMessageDraft(),
                    messageItem;

                try {UPDATER.createItemFromDraft();} catch (e) {exc = e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
                t.expect(exc.msg.toLowerCase()).toContain('messagedraft');
                exc = undefined;

                t.isCalled('updateItemWithDraft', UPDATER);

                messageItem = UPDATER.createItemFromDraft(messageDraft);

                t.isInstanceOf(messageItem, 'conjoon.cn_mail.model.mail.message.MessageItem');

                t.expect(messageItem.get('id')).toBe(messageDraft.get('id'));

                t.expect(messageItem.get('mailFolderId')).toBe(messageDraft.get('mailFolderId'));
                t.expect(messageItem.get('mailAccountId')).toBe(messageDraft.get('mailAccountId'));

                t.expect(messageItem.get('seen')).toBe(messageDraft.get('seen'));
                t.expect(messageItem.get('recent')).toBe(messageDraft.get('recent'));
                t.expect(messageItem.get('flagged')).toBe(messageDraft.get('flagged'));
                t.expect(messageItem.get('answered')).toBe(messageDraft.get('answered'));
                t.expect(messageItem.get('draft')).toBe(messageDraft.get('draft'));


                t.expect(messageItem.get('messageBodyId')).toBe(messageDraft.getMessageBody().getId());


                // was committed
                t.expect(messageItem.dirty).toBe(false);

            });


        })});

})});

