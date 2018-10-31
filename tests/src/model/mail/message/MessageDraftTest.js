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

describe('conjoon.cn_mail.model.mail.message.MessageDraftTest', function(t) {

    var model,
        toAddresses,
        ccAddresses,
        bccAddresses;

    t.beforeEach(function() {

        model = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
            id            : 1
        });

    });

    t.afterEach(function() {
        model        = null;
        toAddresses  = null;
        ccAddresses  = null;
        bccAddresses = null;
    });


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('conjoon.cn_mail.data.mail.BaseSchema', function() {
    t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {

        Ext.ux.ajax.SimManager.init({
            delay: 1
        });

        t.it("Should create instance", function(t) {
            t.expect(model instanceof conjoon.cn_mail.model.mail.message.AbstractMessageItem).toBeTruthy();
        });

        t.it("Test for proper proxy", function(t) {
            t.isInstanceOf(model.getProxy(), "conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy");
        });

        t.it("Test Entity Name", function(t) {
            t.expect(
                model.entityName
            ).toBe('MessageDraft');
        });

        t.it("Test Record Validity", function(t) {
            // messageBody is missingb
            t.expect(model.isValid()).toBe(false);

            for (var i = 0, vs = ['to', 'cc', 'bcc'], len = vs.length; i < len; i++) {
                var vtors = model.getField(vs[i])._validators;
                t.expect(vtors.length).toBe(1);
                t.expect(vtors[0] instanceof conjoon.cn_core.data.validator.EmailAddressCollection).toBe(true);
                t.expect(vtors[0].getAllowEmpty()).toBe(true);
            }

        });


        t.it("Test addresses inline", function(t) {

            var model = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft',{
                id : '1',
                to : [{
                    name    : 'Firstname Lastname',
                    address : 'name@domain.tld'
                }, {
                    name    : 'Firstname 1 Lastname 1',
                    address : 'name@domain.tld'
                }]
            });
            t.expect(model.get('to')).toEqual([{
                name    : 'Firstname Lastname',
                address : 'name@domain.tld'
            }, {
                name    : 'Firstname 1 Lastname 1',
                address : 'name@domain.tld'
            }]);
        });


        t.it("Test addresses load", function(t) {

            let messageItem = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(0);

            var rec = conjoon.cn_mail.model.mail.message.MessageDraft.loadEntity(
                conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(
                    messageItem.mailAccountId,
                    messageItem.mailFolderId,
                    messageItem.id
                )
            );

            t.waitForMs(500, function() {
                t.expect(rec.get('to')).toContain(
                    { name : 'Firstname Lastnameto', address : 'nameto@domain.tld'}
                );
            });

        });


        t.it("Test MessageBody load", function(t) {

            let messageItem = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(0);

            var rec = conjoon.cn_mail.model.mail.message.MessageDraft.loadEntity(
                conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(
                    messageItem.mailAccountId,
                    messageItem.mailFolderId,
                    messageItem.id
                )
            );


            t.waitForMs(500, function() {
                var mb = rec.loadMessageBody();

                t.waitForMs(1500, function() {
                    t.expect(mb.get('textHtml')).toBeTruthy();
                    t.expect(mb.get('mailFolderId')).toBe(rec.get('mailFolderId'));
                    t.expect(mb.get('mailAccountId')).toBe(rec.get('mailAccountId'));
                    t.expect(mb.get('id')).toBe(rec.get('id'));

                    t.expect(mb.getId()).toContain(rec.getId())
                });
            });

        });


        t.it("Test attachments load", function(t) {

            let messageItem = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(0);

            var rec = conjoon.cn_mail.model.mail.message.MessageDraft.loadEntity(
                conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(
                    messageItem.mailAccountId,
                    messageItem.mailFolderId,
                    messageItem.id
                )
            );

            t.waitForMs(500, function() {
                t.expect(typeof rec.attachments).toBe('function');
                t.isInstanceOf(rec.attachments(), 'conjoon.cn_mail.store.mail.message.MessageAttachmentStore');

                t.expect(rec.attachments().getRange().length).toBe(0);
                t.isInstanceOf(rec.loadAttachments(), 'Ext.data.Store');
                t.waitForMs(500, function() {
                    t.expect(rec.attachments().isLoaded()).toBe(true);
                });
            });

        });

        t.it("Test MessageDraft save", function(t) {

            var rec = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                subject       : 'test',
                mailFolderId  : 1,
                mailAccountId : 3
            });


            t.expect(rec.getId()).toContain('MessageDraft');
            t.expect(rec.get('id')).toBeFalsy();

            rec.save();

            t.waitForMs(750, function() {

                let key = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(rec);

                t.expect(rec.get('id')).not.toBeFalsy();
                t.expect(rec.getId()).toBe(key.toLocalId());
            });

        });


        t.it("Test MessageDraft save MessageBody with session", function(t) {

            var session = Ext.create('Ext.data.Session', {
                schema : 'cn_mail-mailbaseschema'
            });

            var rec = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                subject       : 'test',
                mailFolderId  : 1,
                mailAccountId : 3
            });

            t.expect(rec.isValid()).toBe(false);

            rec.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
                mailFolderId  : 1,
                mailAccountId : 3
            }));

            t.expect(rec.isValid()).toBe(false);

            var rec2 = rec.getMessageBody();

            session.adopt(rec);

            rec2.set('textHtml', 'Hallo Welt');

            var saveBatch = session.getSaveBatch();

            saveBatch.on('operationcomplete', function() {

            });

            saveBatch.start();

            t.waitForMs(1000, function() {

                let msgKey  = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(rec);
                let bodyKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(rec2);

                t.expect(rec2.getId()).toBe(bodyKey.toLocalId());
                t.expect(rec.getId()).toBe(msgKey.toLocalId());
                t.expect(rec2.get('id')).toBe(rec.get('id'));

                t.expect(rec.isValid()).toBe(true);
            });

        });


        t.it("field - replyTo", function(t) {

            var rec = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                subject : 'test',
                from    : 'from@domain.tld',
                replyTo : 'replyTo@domain.tld'
            });

            t.expect(rec.get('from').address).toBe('from@domain.tld');
            t.expect(rec.get('replyTo').address).toBe('replyTo@domain.tld');
        });


        t.it("field - draft", function(t) {

            var rec = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft');

            t.expect(rec.get('draft')).toBe(true);
        });


        t.it("field - seen", function(t) {

            var rec = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft');

            t.expect(rec.get('seen')).toBe(true);
        });

        t.it("field - answered", function(t) {

            var rec = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft');

            t.expect(rec.get('answered')).toBe(false);
        });

        t.it("field - flagged", function(t) {

            var rec = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft');

            t.expect(rec.get('flagged')).toBe(false);
        });

        t.it("field - recent", function(t) {

            var rec = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft');

            t.expect(rec.get('recent')).toBe(false);
        });


        t.it("Test MessageDraft save MessageBody updated mailFolderId", function(t) {

            var session = Ext.create('Ext.data.Session', {
                schema : 'cn_mail-mailbaseschema'
            }), newFolder = "INBOX.TRASH";

            var draft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                subject       : 'test',
                mailFolderId  : 1,
                mailAccountId : 3
            });

            draft.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
                mailAccountId : 3
            }));

            var body = draft.getMessageBody();



            draft.set('mailFolderId', newFolder);
            t.expect(draft.get('mailFolderId')).toBe(newFolder);
            t.expect(draft.get('mailFolderId')).toBe(body.get('mailFolderId'));

            session.adopt(draft);

            t.expect(body.getId()).toContain('MessageBody');

            var saveBatch = session.getSaveBatch();

            saveBatch.start();


            t.waitForMs(1000, function() {

                let msgKey  = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(draft);
                let bodyKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(body);

                t.expect(body.getId()).toBe(bodyKey.toLocalId());
                t.expect(draft.getId()).toBe(msgKey.toLocalId());

                t.expect(body.get('id')).toBe(draft.get('id'));
                t.expect(body.get('mailFolderId')).toBe(newFolder);
                t.expect(body.get('mailAccountId')).toBe(draft.get('mailAccountId'));
                t.expect(body.get('mailFolderId')).toBe(draft.get('mailFolderId'));
            });

        });


        t.it("Test MessageDraft save MessageDraft updated id", function(t) {

            var session = Ext.create('Ext.data.Session', {
                schema : 'cn_mail-mailbaseschema'
            }), newFolder = "INBOX.TRASH";

            var draft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                subject       : 'test',
                mailFolderId  : 1,
                mailAccountId : 3
            });

            draft.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
                mailFolderId  : 1,
                mailAccountId : 3
            }));

            var body = draft.getMessageBody();

            session.adopt(draft);

            t.expect(body.getId()).toContain('MessageBody');

            var saveBatch = session.getSaveBatch();

            saveBatch.start();

            t.waitForMs(1000, function() {

                let msgKey  = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(draft);
                let bodyKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(body);

                t.expect(body.getId()).toBe(bodyKey.toLocalId());
                t.expect(draft.getId()).toBe(msgKey.toLocalId());

                t.expect(body.get('id')).toBe(draft.get('id'));
            });

        });


        t.it("Test MessageDraft save MessageDraft updated mailFolderId for Body", function(t) {

            var session = Ext.create('Ext.data.Session', {
                schema : 'cn_mail-mailbaseschema'
            }), newFolder = "INBOX.TRASH";

            var draft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                subject       : 'test',
                mailFolderId  : 1,
                mailAccountId : 3
            });

            draft.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
                mailFolderId  : 1,
                mailAccountId : 3
            }));

            var body = draft.getMessageBody();

            session.adopt(draft);

            t.expect(body.getId()).toContain('MessageBody');

            body.set('mailFolderId', newFolder);

            var saveBatch = session.getSaveBatch();

            saveBatch.start();

            t.waitForMs(1000, function() {

                let msgKey  = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(draft);
                let bodyKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(body);

                t.expect(body.getId()).toBe(bodyKey.toLocalId());
                t.expect(draft.getId()).toBe(msgKey.toLocalId());

                t.expect(body.get('id')).toBe(draft.get('id'));
                t.expect(body.get('mailFolderId')).toBe(newFolder);
                t.expect(body.get('mailFolderId')).toBe(draft.get('mailFolderId'));
            });

        });



    });});


});
