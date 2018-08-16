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

describe('conjoon.cn_mail.model.mail.message.AbstractMessageItemTest', function(t) {

    var model,
        messageBody;

    t.beforeEach(function() {

        messageBody = Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
            id : 2
        });

        model = Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
            id            : 1,
            messageBodyId : 2,
            mailAccountId : 3,
            mailFolderId  : 4,
            originalId    : 1
        });


    });

    t.afterEach(function() {
        model       = null;
        messageBody = null;
    });


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.it("Should create instance", function(t) {
        t.expect(model instanceof conjoon.cn_mail.model.mail.BaseModel).toBeTruthy();
    });

    t.it("Test Record Validity", function(t) {
        t.expect(model.isValid()).toBe(true);
    });

    t.it("Test getMessageBody", function(t) {
        model.setMessageBody(messageBody);
        t.expect(model.getMessageBody()).toBeTruthy();
    });


    t.it("Test seen", function(t) {
        t.expect(model.getField('seen')).toBeTruthy();
    });

    t.it("Test recent", function(t) {
        t.expect(model.getField('recent')).toBeTruthy();
    });

    t.it("Test flagged", function(t) {
        t.expect(model.getField('flagged')).toBeTruthy();
    });

    t.it("Test answered", function(t) {
        t.expect(model.getField('answered')).toBeTruthy();
    });

    t.it("Test draft", function(t) {
        t.expect(model.getField('draft')).toBeTruthy();
    });

    t.it("Test mailFolderId", function(t) {
        t.expect(model.getField('mailFolderId')).toBeTruthy();
        t.expect(model.getField('mailFolderId').critical).toBe(true);
    });

    t.it("Test mailAccountId", function(t) {
        t.expect(model.getField('mailAccountId')).toBeTruthy();
        t.expect(model.getField('mailAccountId').critical).toBe(true);
    });

    t.it("id", function(t) {
        t.expect(model.getIdProperty()).toBe('id');
    });

    t.it("originalId", function(t) {
        t.expect(model.getField('originalId')).toBeTruthy();
        t.expect(model.getField('originalId').critical).toBe(true);

    });

});
