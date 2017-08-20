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

describe('conjoon.cn_mail.text.ReplyToMessageDecoratorTest', function(t) {

    var createMessageDraft = function(andBodyToo, skipReplyTo, andAttachmentsTo) {
        var draft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
            subject : 'SUBJECT',
            from    : 'from@domain.tld',
            to      : 'to@domain.tld',
            cc      : 'cc@domain.tld',
            bcc     : 'bcc@domain.tld'
        });

        if (skipReplyTo !== true) {
            draft.set('replyTo', 'replyTo@domain.tld');
        }

        if (andBodyToo === true) {
            draft.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
                textPlain : 'TEXTPLAIN',
                textHtml  : 'TEXTHTML'
            }));
        }

        if (andAttachmentsTo === true) {
            draft.attachments().add(Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment', {
                type           : 'TYPE',
                text           : 'foo',
                size           : 1,
                previewImgSrc  : 'PREVIEWIMGSRC',
                downloadImgUrl : 'DOWNLOADIMGURL',
                sourceId       : 'SOURCEID'
            }));
        }

        return draft;
    };


    t.it("constructor()", function(t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create('conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator', messageDraft);

        t.isInstanceOf(decorator, conjoon.cn_mail.text.mail.message.CopyDecorator);
    });


    t.it("getTo()", function(t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create('conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator', messageDraft);

        t.expect(decorator.getTo()).toEqual([decorator.getReplyTo()]);
    });


    t.it("getCc()", function(t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create('conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator', messageDraft);

        t.expect(messageDraft.get('cc').length).toBeGreaterThan(0);
        t.expect(decorator.getCc()).toEqual([]);
    });


    t.it("getBcc()", function(t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create('conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator', messageDraft);

        t.expect(messageDraft.get('bcc').length).toBeGreaterThan(0);
        t.expect(decorator.getBcc()).toEqual([]);
    });


    t.it("getTextHtml()", function(t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create('conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator', messageDraft);

        t.expect(typeof decorator.getTextHtml()).toBe("string");
        t.expect(decorator.getTextHtml()).not.toBe(messageDraft.getMessageBody().get('textHtml'));
        t.expect(decorator.getTextHtml()).toBeTruthy();
    });


    t.it("getAttachments()", function(t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create('conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator', messageDraft);

        t.expect(decorator.getAttachments()).toEqual([]);
    });

});
