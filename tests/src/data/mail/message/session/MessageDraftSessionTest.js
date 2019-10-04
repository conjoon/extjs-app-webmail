/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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

describe('conjoon.cn_mail.data.mail.message.session.MessageDraftSessionTest', function(t) {


    t.it("test instance", function(t) {

        const session = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession");

        t.isInstanceOf(session, 'coon.core.data.Session');
        t.expect(session.getSchema() instanceof conjoon.cn_mail.data.mail.BaseSchema).toBe(true);
        t.expect(session.getMessageDraft()).toBeUndefined();

    });


    t.it('Test setMessageDraft()', function(t) {

        const session = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession");

        let exc;

        // wrong type
        exc = undefined;
        try {
            session.setMessageDraft({});
        } catch(e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg).toContain('must be an instance of');

        // okay
        t.expect(session.getMessageDraft()).toBeUndefined();
        const draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft");
        session.setMessageDraft(draft);
        t.expect(session.getMessageDraft()).toBe(draft);
        t.expect(session.peekRecord(draft.entityName, draft.getId())).toBe(draft);

        // already set
        exc = undefined;
        try {
            session.setMessageDraft({});
        } catch(e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg).toContain('already set');
    });


    t.it('Test createVisitor() with no messageDraft set', function(t) {

        const session = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession");

        let exc = undefined;
        try {
            session.createVisitor();
        } catch(e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg).toContain('must be set');
    });


    t.it('Test createVisitor() with messageDraft set', function(t) {

        const session = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession"),
              draft   = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft");

        session.setMessageDraft(draft);

        const visitor  = session.createVisitor();

        t.isInstanceOf(visitor, 'conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor');
        t.expect(visitor.getMessageDraft()).toBe(session.getMessageDraft());

    });


})


