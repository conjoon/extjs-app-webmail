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

describe('conjoon.cn_mail.model.mail.message.ItemAttachmentTest', function(t) {

    var model;

    t.beforeEach(function() {
        model = Ext.create('conjoon.cn_mail.model.mail.message.ItemAttachment', {
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

    t.it("Should create instance", function(t) {
        t.isInstanceOf(model, 'conjoon.cn_mail.model.mail.message.MessageItemChildModel');
        t.isInstanceOf(model, 'conjoon.cn_mail.model.mail.message.AbstractAttachment');
    });

    t.it("Test Entity Name", function(t) {
        t.expect(
            model.entityName
        ).toBe('ItemAttachment');
    });

    t.it("Test Record Validity", function(t) {
        t.expect(model.isValid()).toBe(true);
    });

    t.it("Test mailFolderId", function(t) {
        t.expect(model.getField('mailFolderId')).toBeTruthy();
        t.expect(model.getField('mailFolderId').critical).toBe(true);
        t.isInstanceOf(model.getField('mailFolderId'), 'coon.core.data.field.CompoundKeyField');
    });

    t.it("Test mailAccountId", function(t) {
        t.expect(model.getField('mailAccountId')).toBeTruthy();
        t.expect(model.getField('mailAccountId').critical).toBe(true);
        t.isInstanceOf(model.getField('mailAccountId'), 'coon.core.data.field.CompoundKeyField');
    });

    t.it("localId", function(t) {
        t.expect(model.getIdProperty()).toBe('localId');
    });

    t.it("id", function(t) {
        t.expect(model.getField('id')).toBeTruthy();
        t.expect(model.getField('id').critical).toBe(true);
        t.isInstanceOf(model.getField('id'), 'coon.core.data.field.CompoundKeyField');
    });

    t.it("parentMessageItemId", function(t) {
        t.expect(model.getField('parentMessageItemId')).toBeTruthy();
    });

});
