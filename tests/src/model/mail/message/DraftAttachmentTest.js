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
            id                    : 1,
            mailFolderId          : 4,
            mailAccountId         : 5,
            originalId            : 1,
            originalMessageItemId : 1
        });
    });

    t.afterEach(function() {
        model = null;
    });


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {

        Ext.ux.ajax.SimManager.init({
            delay: 1
        });

        t.it("Should create instance", function(t) {
            t.isInstanceOf(model, 'conjoon.cn_mail.model.mail.message.MessageItemChildModel');
        });

        t.it("Test Entity Name", function(t) {
            t.expect(
                model.entityName
            ).toBe('DraftAttachment');
        });

        t.it("Test Record Validity", function(t) {
            t.expect(model.isValid()).toBe(true);
        });

        t.it("Test sourceId", function(t) {

            conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItems();
            conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItems();

            let attachment = conjoon.cn_mail.data.mail.ajax.sim.message.AttachmentTable.getAttachmentAt(0);


            var model = conjoon.cn_mail.model.mail.message.DraftAttachment.load(
                attachment.id, {
                    params : {
                        mailAccountId         : attachment.mailAccountId,
                        mailFolderId          : attachment.mailFolderId,
                        originalMessageItemId : attachment.originalMessageItemId
                    }
                }
            );

            t.waitForMs(500, function() {
                t.expect(model.get('sourceId')).toBe(model.getId());

                model.set('id', '8');

                t.expect(model.get('sourceId')).not.toBe(model.get('id'));

                var rec = model.copy(null);

                t.expect(rec.get('sourceId')).not.toBe(rec.get('id'));
                t.expect(rec.get('sourceId')).not.toBe(model.get('id'));

                var setit = rec.set('sourceId');
                t.expect(setit).toBe(null);
                t.expect(rec.get('sourceId')).toBe(attachment.id);

                var newModel = Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment', {
                    mailAccountId         : attachment.mailAccountId,
                    mailFolderId          : attachment.mailFolderId,
                    originalMessageItemId : attachment.originalMessageItemId
                });

                t.expect(newModel.getId()).not.toBe(newModel.get('sourceId'));

                newModel.save();

                t.waitForMs(500, function() {
                    t.expect(newModel.get('originalId')).toBeTruthy();
                    t.expect(newModel.get('originalMessageItemId')).toBeTruthy();

                    t.expect(newModel.getId()).toBe(newModel.get('sourceId'));
                });

            });

        });

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

    t.it("originalMessageItemId", function(t) {
        t.expect(model.getField('originalMessageItemId')).toBeTruthy();
        t.isInstanceOf(model.getField('originalMessageItemId'), 'conjoon.cn_core.data.field.CompoundKeyField');
    });


});
