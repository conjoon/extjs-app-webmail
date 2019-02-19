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

t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable', function(){
t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function(){

    Ext.ux.ajax.SimManager.init({
        delay: 1
    });

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

    t.it("load() - with session and proper param settings when loaded in session", function(t) {


        var createKey = function(id1, id2, id3) {
                return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(id1, id2, id3);
            },
            getMessageItemAt = function(messageIndex) {
                return conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(messageIndex);
            },
            createKeyForExistingMessage = function(messageIndex){
                let item = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(messageIndex);

                let key = createKey(
                    item.mailAccountId, item.mailFolderId, item.id
                );

                return key;
            },
            createSession = function() {
                return Ext.create('coon.core.data.Session', {
                    schema : 'cn_mail-mailbaseschema',
                    batchVisitorClassName : 'conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor'
                })
            };

        let session = createSession(),
            item    = getMessageItemAt(1),
            key     = createKeyForExistingMessage(1);

        let model = session.getRecord('MessageDraft', key.toLocalId(), {params : key.toObject()});


        t.waitForMs(500, function() {

            model.getMessageBody();

            t.waitForMs(500, function() {
                t.expect(model.getMessageBody().get('mailAccountId')).toBe(model.data.mailAccountId);
                t.expect(model.getMessageBody().get('mailAccountId')).toBe(item.mailAccountId);

                t.expect(model.getMessageBody().get('mailFolderId')).toBe(model.data.mailFolderId);
                t.expect(model.getMessageBody().get('mailFolderId')).toBe(item.mailFolderId);

                t.expect(model.getMessageBody().get('mailFolderId')).toBe(model.data.mailFolderId);
                t.expect(model.getMessageBody().get('id')).toBe(item.id);
            });
        });
    });


})})



});
