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

describe('conjoon.cn_mail.model.mail.message.DraftAttachmentTest', function(t) {

    var model;

    t.beforeEach(function() {
        model = Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment', {
            localId             : 1,
            mailFolderId        : 4,
            mailAccountId       : 5,
            id                  : 1,
            parentMessageItemId : 1
        });
    });

    t.afterEach(function() {
        model = null;
    });


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('conjoon.cn_mail.data.mail.BaseSchema', function() {
    t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {
    t.requireOk('conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor', function() {

        Ext.ux.ajax.SimManager.init({
            delay: 1
        });

        t.it("Should create instance", function (t) {

            t.isInstanceOf(model, 'conjoon.cn_mail.model.mail.message.MessageItemChildModel');
        });

        t.it("Test Entity Name", function (t) {
            t.expect(
                model.entityName
            ).toBe('DraftAttachment');
        });

        t.it("Test Record Validity", function (t) {
            t.expect(model.isValid()).toBe(true);
        });


        t.it("Test mailFolderId", function (t) {
            t.expect(model.getField('mailFolderId')).toBeTruthy();
            t.expect(model.getField('mailFolderId').critical).toBe(true);
        });

        t.it("Test mailAccountId", function (t) {
            t.expect(model.getField('mailAccountId')).toBeTruthy();
            t.expect(model.getField('mailAccountId').critical).toBe(true);
        });

        t.it("localId", function (t) {
            t.expect(model.getIdProperty()).toBe('localId');
        });

        t.it("id", function (t) {
            t.expect(model.getField('id')).toBeTruthy();
            t.expect(model.getField('id').critical).toBe(true);
        });

        t.it("parentMessageItemId", function (t) {
            t.expect(model.getField('parentMessageItemId')).toBeTruthy();
            t.isInstanceOf(model.getField('parentMessageItemId'), 'conjoon.cn_core.data.field.CompoundKeyField');
        });


        t.it("Test MessageDraft add attachment - compound key updated", function(t) {

            let draft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                subject       : 'test',
                mailFolderId  : 1,
                mailAccountId : 3
            });

            let attachment1 = Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment'),
                attachment2 = Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment');

            t.expect(draft.attachments().getRange().length).toBe(0);


            draft.attachments().add(attachment1);
            t.expect(attachment1.get('mailFolderId')).toBe("1");
            t.expect(attachment1.get('mailAccountId')).toBe("3");
            t.expect(attachment1.get('parentMessageItemId')).toBeFalsy();

            draft.attachments().add(attachment2);
            t.expect(attachment2.get('mailFolderId')).toBe("1");
            t.expect(attachment2.get('mailAccountId')).toBe("3");
            t.expect(attachment2.get('parentMessageItemId')).toBeFalsy();

            draft.set('mailFolderId', 'foo');
            t.expect(attachment1.get('mailFolderId')).toBe("foo");
            t.expect(attachment2.get('mailFolderId')).toBe("foo");

            draft.set('mailAccountId', 'bar');
            t.expect(attachment1.get('mailAccountId')).toBe("bar");
            t.expect(attachment2.get('mailAccountId')).toBe("bar");

            draft.set('id', 'foobar');
            t.expect(attachment1.get('parentMessageItemId')).toBe("foobar");
            t.expect(attachment2.get('parentMessageItemId')).toBe("foobar");

        });

        t.it("proxy", function(t) {

            t.isInstanceOf(model.getProxy(), 'conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy');

        });

        t.it("Test MessageDraft save with MessageBody and Attachments", function(t) {

            var session = Ext.create('conjoon.cn_core.data.Session', {
                schema : 'cn_mail-mailbaseschema',
                batchVisitorClassName : 'conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor'
            });

            var draft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                subject       : 'test',
                mailFolderId  : 1,
                mailAccountId : 3
            });

            draft.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
                mailFolderId  : 1,
                mailAccountId : 3
            }));

            let store = draft.attachments(),
                att   = Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment');

            store.add(att);

            session.adopt(draft);

            let batch = session.getSaveBatch();

            t.expect(att.phantom).toBe(true);
            t.expect(draft.get('id')).toBeUndefined();

            batch.start();

            t.waitForMs(1000, function() {

                t.expect(att.phantom).toBe(false);
                t.expect(att.get('mailAccountId')).toBe('3');
                t.expect(att.get('mailFolderId')).toBe('1');
                t.expect(draft.get('id')).toBeDefined();
                t.expect(att.get('parentMessageItemId')).toBe(draft.get('id'));

            });

        });

    });

});});});
