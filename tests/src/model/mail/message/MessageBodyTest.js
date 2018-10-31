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

describe('conjoon.cn_mail.model.mail.message.MessageBodyTest', function(t) {

    var model;

    t.beforeEach(function() {
        model = Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
            id            : 1,
            mailFolderId  : 4,
            mailAccountId : 5
        });
    });

    t.afterEach(function() {
        model = null;
    });


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.it("Should create instance", function(t) {
        t.isInstanceOf(model, 'conjoon.cn_mail.model.mail.message.CompoundKeyedModel');
    });

    t.it("Test Entity Name", function(t) {
        t.expect(
            model.entityName
        ).toBe('MessageBody');
    });

    t.it("Test Record Validity", function(t) {
        t.expect(model.isValid()).toBe(true);
    });

    t.it("Test mailFolderId", function(t) {
        t.expect(model.getField('mailFolderId')).toBeTruthy();
        t.expect(model.getField('mailFolderId').critical).toBe(true);
    });

    t.it("Test mailAccountId", function(t) {
        t.expect(model.getField('mailAccountId')).toBeTruthy();
        t.expect(model.getField('mailAccountId').critical).toBe(true);
    });

    t.it("localId", function(t) {
        t.expect(model.getIdProperty()).toBe('localId');
    });

    t.it("id", function(t) {
        t.expect(model.getField('id')).toBeTruthy();
        t.expect(model.getField('id').critical).toBe(true);
    });


    t.it("getAssociatedCompoundKeyedData() - MessageDraft", function(t) {

        var session = Ext.create('Ext.data.Session', {
            schema : 'cn_mail-mailbaseschema'
        });

        var rec = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
            subject       : 'test',
            mailFolderId  : 1,
            mailAccountId : 3
        });


        rec.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
            mailFolderId  : 1,
            mailAccountId : 3
        }));

        var rec2 = rec.getMessageBody();

        session.adopt(rec);

        t.expect(rec2.getAssociatedCompoundKeyedData().length).toBe(1);
        t.expect(rec2.getAssociatedCompoundKeyedData()[0]).toBe(rec);
    });


    t.it("getAssociatedCompoundKeyedData() - MessageItems", function(t) {

        var session = Ext.create('Ext.data.Session', {
            schema : 'cn_mail-mailbaseschema'
        });

        var rec = Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
            subject       : 'test',
            mailFolderId  : 1,
            mailAccountId : 3
        });


        rec.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
            mailFolderId  : 1,
            mailAccountId : 3
        }));

        var rec2 = rec.getMessageBody();

        session.adopt(rec);

        t.expect(rec2.getAssociatedCompoundKeyedData().length).toBe(1);
        t.expect(rec2.getAssociatedCompoundKeyedData()[0]).toBe(rec);
    });

});
