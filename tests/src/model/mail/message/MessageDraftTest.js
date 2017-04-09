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


    t.it("Should create instance", function(t) {
        t.expect(model instanceof conjoon.cn_mail.model.mail.message.AbstractMessageItem).toBeTruthy();
    });

    t.it("Test Entity Name", function(t) {
        t.expect(
            model.entityName
        ).toBe('MessageDraft');
    });

    t.it("Test Record Validity", function(t) {
        // messageBody is missing
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


    t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {

        t.it("Test addresses load", function(t) {

            var rec = conjoon.cn_mail.model.mail.message.MessageDraft.load(1);

            t.waitForMs(500, function() {
                t.expect(rec.get('to')).toContain(
                    { name : 'Firstname Lastnameto', address : 'nameto@domain.tld'}
                );
            });

        });


        t.it("Test MessageBody load", function(t) {

            var rec = conjoon.cn_mail.model.mail.message.MessageDraft.load(1);

            t.waitForMs(500, function() {

                var mb = rec.getMessageBody();

                t.waitForMs(500, function() {
                    t.expect(mb.get('textHtml')).toBeTruthy();
                });
            });

        });

        t.it("Test attachments load", function(t) {

            var rec = conjoon.cn_mail.model.mail.message.MessageDraft.load(1);

            t.waitForMs(500, function() {
                t.expect(typeof rec.attachments).toBe('function');
                t.expect(rec.attachments().getRange().length).toBe(0);
                rec.attachments().load();
                t.waitForMs(500, function() {
                    t.expect(rec.attachments().getRange().length).not.toBe(0);
                });
            });

        });

        t.it("Test MessageDraft save", function(t) {

            var rec = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                subject : 'test'
            });

            t.expect(rec.getId()).toContain('MessageDraft');

            rec.save();

            t.waitForMs(500, function() {
                t.expect(rec.getId()).not.toContain('MessageDraft');
            });

        });


        t.requireOk('conjoon.cn_mail.data.mail.BaseSchema', function() {
            t.it("Test MessageDraft save MessageBody with session", function(t) {

                var session = Ext.create('Ext.data.Session', {
                    schema : 'cn_mail-mailbaseschema'
                });

                var rec = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                    subject : 'test'
                });

                t.expect(rec.isValid()).toBe(false);

                rec.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody'));

                t.expect(rec.isValid()).toBe(true);

                var rec2 = rec.getMessageBody();

                session.adopt(rec);

                t.expect(rec2.getId()).toContain('MessageBody');

                rec2.set('textHtml', 'Hallo Welt');

                var saveBatch = session.getSaveBatch();

                saveBatch.on('complete', function() {

                });

                saveBatch.start();

                t.waitForMs(1000, function() {
                    t.expect(rec2.getId()).not.toContain('MessageBody');
                });

            });

        });


    });


});
