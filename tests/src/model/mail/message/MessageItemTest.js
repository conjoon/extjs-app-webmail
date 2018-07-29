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

describe('conjoon.cn_mail.model.mail.message.MessageItemTest', function(t) {

    var model,
        messageBody,
        attachments,
        longString = "";

    t.beforeEach(function() {

        for (var i = 0, len = 4000; i < len; i++) {
            longString += '0';
        }

        messageBody = Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
            id : 2
        });

        model = Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
            id            : 1,
            messageBodyId : 2
        });

        attachments = [Ext.create('conjoon.cn_mail.model.mail.message.ItemAttachment', {
            id            : 1
        }), Ext.create('conjoon.cn_mail.model.mail.message.ItemAttachment', {
            id            : 2
        }), Ext.create('conjoon.cn_mail.model.mail.message.ItemAttachment', {
            id            : 3
        })];

    });

    t.afterEach(function() {
        longString  = "";
        model       = null;
        messageBody = null;
        atachments  = null;
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
        ).toBe('MessageItem');
    });

    t.it("Test Record Validity", function(t) {
        t.expect(model.isValid()).toBe(true);
    });

    t.it("Test getMessageBody", function(t) {
        model.setMessageBody(messageBody);
        t.expect(model.getMessageBody()).toBeTruthy();
    });

    t.it("Test attachments", function(t) {
        model.attachments().add(attachments);
        t.expect(model.attachments().getAt(1).get('id')).toBe('2');
        t.expect(model.attachments().getAt(1).getMessageItem()).toBe(model);
    });

    t.it("Test previewText", function(t) {

        t.expect(longString.length).toBe(4000);

        model.set('previewText', longString);
        t.expect(model.data.previewText.length).toBe(200);
        t.expect(model.get('previewText').length).toBe(200);

        model.set('previewText', 'u' + longString);
        t.expect(model.previousValues.previewText.length).toBe(200);
        t.expect(model.data.previewText[0]).toBe('u');
        t.expect(model.data.previewText.length).toBe(200);
        t.expect(model.get('previewText').length).toBe(200);

        model.set('previewText', 0);
        t.expect(model.get('previewText')).toBe('');
        model.set('previewText', undefined);
        t.expect(model.get('previewText')).toBe('');
        model.set('previewText', null);
        t.expect(model.get('previewText')).toBe('');
        model.set('previewText', true);
        t.expect(model.get('previewText')).toBe('');



    });

    t.it("cn_deleted / cn_moved", function(t) {

        t.expect(model.get('cn_deleted')).toBe(false);
        t.expect(model.get('cn_moved')).toBe(false);

        model.set('cn_deleted', 1);
        t.expect(model.get('cn_deleted')).toBe(true);

        model.set('cn_moved', true);
        t.expect(model.get('cn_moved')).toBe(true);


    });

});
