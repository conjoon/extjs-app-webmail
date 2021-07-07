/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

StartTest(t => {

    var createMessageDraft = function (andBodyToo, skipReplyTo, andAttachmentsTo) {
        var draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
            subject: "SUBJECT",
            from: "from@domain.tld",
            to: "to@domain.tld",
            cc: "cc@domain.tld",
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


    t.it("constructor()", t => {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create("conjoon.cn_mail.text.mail.message.ReplyAllMessageDecorator", messageDraft);

        t.isInstanceOf(decorator, conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator);
    });


    t.it("getTo()", t => {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create("conjoon.cn_mail.text.mail.message.ReplyAllMessageDecorator", messageDraft);

        t.expect(decorator.getTo()).toEqual([decorator.getReplyTo()].concat(messageDraft.get("to")));
    });


    t.it("getCc()", t => {
        var messageDraft = createMessageDraft(true, false, true),
            decorator    = Ext.create("conjoon.cn_mail.text.mail.message.ReplyAllMessageDecorator", messageDraft);

        t.expect(decorator.getCc()).toEqual(messageDraft.get("cc"));
    });


});
