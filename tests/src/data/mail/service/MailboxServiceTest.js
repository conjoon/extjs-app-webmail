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

describe('conjoon.cn_mail.data.mail.service.MailboxServiceTest', function(t) {

    const createService = function(helper) {

        return Ext.create('conjoon.cn_mail.data.mail.service.MailboxService', {
            mailFolderHelper : helper === false ? undefined : Ext.create('conjoon.cn_mail.data.mail.service.MailFolderHelper', {
                store : Ext.create('conjoon.cn_mail.store.mail.folder.MailFolderTreeStore',{
                    autoLoad : true
                })
            })
        });
    },
    checkArgMessageItem = function(t, service) {
        t.isCalled('filterMessageItemValue', service);
    },
    createMessageItem = function(mailFolderId, id) {
        return Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
            id           : id || Ext.id(),
            mailFolderId : mailFolderId
        })
    };


// -----------------------------------------------------------------------------
// |   Tests
// -----------------------------------------------------------------------------
t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.message.MessageItemSim', function() {
t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.folder.MailFolderSim', function() {

    Ext.ux.ajax.SimManager.init({
        delay: 1
    });


    t.it("constructor()", function(t) {
        let exc, e,
            service;

        try{createService(false);} catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");

        service = createService();
        t.isInstanceOf(service, 'conjoon.cn_mail.data.mail.service.MailboxService');
    });


    t.it("filterMessageItemValue() - exception", function(t) {

        let service = createService();

        try{service.filterMessageItemValue();}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");

        let mi = createMessageItem("4");

        t.expect(service.filterMessageItemValue(mi)).toBe(mi);
    });


    t.it("moveToTrashOrDeleteMessage() - no trashfolder", function(t) {

        let service = createService(),
            messageItem = createMessageItem("2");

        checkArgMessageItem(t, service);

        let op = service.moveToTrashOrDeleteMessage(messageItem);

        t.isInstanceOf(op, 'conjoon.cn_mail.data.mail.service.mailbox.Operation');

        let request = op.getRequest();
        t.expect(request.type).toBe(conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE_OR_DELETE);
        t.expect(request.record).toBe(messageItem);


        let result = op.getResult();
        t.expect(result.success).toBe(false);
        t.expect(result.reason.toLowerCase()).toContain("could not find");
    });


    t.it("deleteMessage()", function(t) {

        let service     = createService(),
            messageItem = createMessageItem("4", "1");

        checkArgMessageItem(t, service);

        let op = service.deleteMessage(messageItem);

        t.isInstanceOf(op, 'conjoon.cn_mail.data.mail.service.mailbox.Operation');

        let request = op.getRequest();
        t.expect(request.type).toBe(conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE);
        t.expect(request.record).toBe(messageItem);

        t.expect(op.getResult()).toBeUndefined();

        t.waitForMs(250, function() {
            let result = op.getResult();
            t.expect(result.success).toBe(true);

            op = service.deleteMessage(createMessageItem("4", "foo"));

            t.waitForMs(250, function() {
                let result = op.getResult();
                t.expect(result.success).toBe(false);
            });
        });

    });


    t.it("moveToTrashOrDeleteMessage() - mailfolder is trashfolder", function(t) {

        let service     = createService(),
            messageItem = createMessageItem("5", "71");

        t.isCalledNTimes('deleteMessage', service, 1);
        t.waitForMs(250, function() {
            let op = service.moveToTrashOrDeleteMessage(messageItem);

            t.waitForMs(250, function() {
                t.expect(op.getResult().success).toBe(true);
            });
        });

    });


    t.it("moveMessage() - exception mailFolderId", function(t) {

        let service     = createService(),
            messageItem = createMessageItem("4", "1");

        checkArgMessageItem(t, service);

        try{service.moveMessage(messageItem, 3);}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be a string");
    });


    t.it("moveMessage() - same folder NOOP", function(t) {

        let service     = createService(),
            messageItem = createMessageItem("4", "1");

        let targetFolderId = "4";
        let op = service.moveMessage(messageItem, targetFolderId);

        t.isInstanceOf(op, 'conjoon.cn_mail.data.mail.service.mailbox.Operation');

        let request = op.getRequest();
        t.expect(request.type).toBe(conjoon.cn_mail.data.mail.service.mailbox.Operation.NOOP);
        t.expect(request.record).toBe(messageItem);

        let result = op.getResult();
        t.expect(result.success).toBe(true);
    });


    t.it("moveMessage()", function(t) {

        let service     = createService(),
            messageItem = createMessageItem("4", "1");

        let targetFolderId = "3";
        let op = service.moveMessage(messageItem, targetFolderId);

        t.isInstanceOf(op, 'conjoon.cn_mail.data.mail.service.mailbox.Operation');

        let request = op.getRequest();
        t.expect(request.type).toBe(conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE);
        t.expect(request.record).toBe(messageItem);
        t.expect(request.targetFolderId).toBe(targetFolderId);

        t.expect(op.getResult()).toBeUndefined();

        t.waitForMs(250, function() {
            let result = op.getResult();
            t.expect(result.success).toBe(true);

            t.expect(messageItem.get("mailFolderId")).toBe(targetFolderId)
        });

    });


    t.it("moveToTrashOrDeleteMessage() - message moved to trashfolder", function(t) {

        let service     = createService(),
            messageItem = createMessageItem("2", "271");

        t.isCalledNTimes('moveMessage', service, 1);
        t.waitForMs(250, function() {
            let op = service.moveToTrashOrDeleteMessage(messageItem);

            t.waitForMs(250, function() {
                t.expect(op.getResult().success).toBe(true);
                t.expect(messageItem.get("mailFolderId")).toBe("5");

            });
        });

    });
});});});