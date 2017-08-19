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

describe('conjoon.cn_mail.text.mail.message.CopyDecoratorTest', function(t) {

    var createMessageDraft = function(andBodyToo, skipReplyTo) {
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

        return draft;
    }


    t.it("constructor()", function(t) {

        var exc, e, decorator;

        try {
            decorator = Ext.create('conjoon.cn_mail.text.mail.message.CopyDecorator', {});
        } catch (e) {exc = e;}

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("must be an instance of");
        exc = e = undefined;

        try {
            decorator = Ext.create('conjoon.cn_mail.text.mail.message.CopyDecorator', createMessageDraft());
        } catch (e) {
            exc = e
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("is not available");
        exc = e = undefined;


    });


    t.it("API", function(t) {

        var messageDraft = createMessageDraft(true),
            decorator    = Ext.create('conjoon.cn_mail.text.mail.message.CopyDecorator', messageDraft),
            tests        = [{
                fn   : 'getTextHtml',
                toBe : messageDraft.getMessageBody().get('textHtml')
            }, {
                fn   : 'getTextPlain',
                toBe : messageDraft.getMessageBody().get('textPlain')
            }, {
                fn   : 'getSubject',
                toBe : messageDraft.get('subject')
            }, {
                fn      : 'getFrom',
                toEqual : messageDraft.get('from')
            }, {
                fn      : 'getReplyTo',
                toEqual : messageDraft.get('replyTo')
            }, {
                fn      : 'getTo',
                toEqual : messageDraft.get('to')
            }, {
                fn      : 'getCc',
                toEqual : messageDraft.get('cc')
            }, {
                fn      : 'getBcc',
                toEqual : messageDraft.get('bcc')
            }],
            fn, op, value;


        for (var i = 0, len = tests.length; i < len; i++) {

            fn    = tests[i].fn;
            op    = tests[i].toBe ? 'toBe' : 'toEqual';
            value = op === 'toBe' ? tests[i].toBe : tests[i].toEqual;

            t.expect(decorator[fn]())[op](value)
        }

    });


    t.it("empty replyTo", function(t) {

        var messageDraft = createMessageDraft(true, true),
            decorator    = Ext.create('conjoon.cn_mail.text.mail.message.CopyDecorator', messageDraft);

        t.expect(messageDraft.get('replyTo')).toBeFalsy();
        t.expect(decorator.getReplyTo()).toEqual(messageDraft.get('from'));


    });
});
