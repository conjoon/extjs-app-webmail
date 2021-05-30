/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

describe("conjoon.cn_mail.text.ReplyToMessageDecoratorTest", function (t) {

    var createMessageDraft = function (andBodyToo, skipReplyTo, andAttachmentsTo) {
        var draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
            subject: "SUBJECT",
            messageId: "foobarmeh",
            from: "from@domain.tld",
            to: "to@domain.tld",
            cc: "cc@domain.tld",
            references: "someid",
            bcc: "bcc@domain.tld"
        });

        if (skipReplyTo !== true) {
            draft.set("replyTo", "replyTo@domain.tld");
        }

        if (andBodyToo === true) {
            draft.setMessageBody(Ext.create("conjoon.cn_mail.model.mail.message.MessageBody", {
                textPlain: "TEXTPLAIN",
                textHtml: "TEXTHTML"
            }));
        }

        if (andAttachmentsTo === true) {
            draft.attachments().add(Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment", {
                type: "TYPE",
                text: "foo",
                size: 1,
                previewImgSrc: "PREVIEWIMGSRC",
                downloadImgUrl: "DOWNLOADIMGURL",
                sourceId: "SOURCEID"
            }));
        }

        return draft;
    };


    t.it("constructor()", function (t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create("conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator", messageDraft);

        t.isInstanceOf(decorator, conjoon.cn_mail.text.mail.message.CopyDecorator);
    });


    t.it("getTo()", function (t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create("conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator", messageDraft);

        t.expect(decorator.getTo()).toEqual([decorator.getReplyTo()]);
    });


    t.it("getCc()", function (t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create("conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator", messageDraft);

        t.expect(messageDraft.get("cc").length).toBeGreaterThan(0);
        t.expect(decorator.getCc()).toEqual([]);
    });


    t.it("getBcc()", function (t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create("conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator", messageDraft);

        t.expect(messageDraft.get("bcc").length).toBeGreaterThan(0);
        t.expect(decorator.getBcc()).toEqual([]);
    });


    t.it("getTextHtml()", function (t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create("conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator", messageDraft);

        t.expect(typeof decorator.getTextHtml()).toBe("string");
        t.expect(decorator.getTextHtml()).not.toBe(messageDraft.getMessageBody().get("textHtml"));
        t.expect(decorator.getTextHtml()).toBeTruthy();
    });


    t.it("getAttachments()", function (t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create("conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator", messageDraft);

        t.expect(decorator.getAttachments()).toEqual([]);
    });


    t.it("app-cn_mail#47 - getInReplyTo()", function (t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create("conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator", messageDraft);

        t.expect(decorator.getInReplyTo()).toBe(messageDraft.get("messageId"));
    });


    t.it("app-cn_mail#47 - getReferences()", function (t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create("conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator", messageDraft);

        t.expect(decorator.getReferences()).toBe(
            messageDraft.get("references") + " " +
            messageDraft.get("messageId")
        );
    });


    t.it("app-cn_mail#47 - getXCnDraftInfo()", function (t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create("conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator", messageDraft);

        t.expect(decorator.getXCnDraftInfo()).toBe(
            btoa(Ext.encode([
                messageDraft.get("mailAccountId"),
                messageDraft.get("mailFolderId"),
                messageDraft.get("id")
            ]))
        );
    });


    t.it("app-cn_mail#47 - toMessageDraftConfig()", function (t) {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create("conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator", messageDraft);

        let c = decorator.toMessageDraftConfig();

        t.expect(c.getXCnDraftInfo()).toBe(decorator.getXCnDraftInfo());
        t.expect(c.getInReplyTo()).toBe(decorator.getInReplyTo());
        t.expect(c.getReferences()).toBe(decorator.getReferences());
        
    });

});
