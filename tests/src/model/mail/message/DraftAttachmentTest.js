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
            id            : 1,
            mailFolderId  : 4,
            mailAccountId : 5,
            originalId    : 1
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
            t.expect(model instanceof conjoon.cn_mail.model.mail.message.AbstractAttachment).toBeTruthy();
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

            var model = conjoon.cn_mail.model.mail.message.DraftAttachment.load(1);

            t.waitForMs(500, function() {
                t.expect(model.get('sourceId')).toBe(model.getId());

                model.set('id', '8');

                t.expect(model.get('sourceId')).not.toBe(model.get('id'));

                var rec = model.copy(null);

                t.expect(rec.get('sourceId')).not.toBe(rec.get('id'));
                t.expect(rec.get('sourceId')).not.toBe(model.get('id'));

                var setit = rec.set('sourceId');
                t.expect(setit).toBe(null);
                t.expect(rec.get('sourceId')).toBe('1');

                var newModel = Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment');

                t.expect(newModel.getId()).not.toBe(newModel.get('sourceId'));

                newModel.save();

                t.waitForMs(500, function() {
                    t.expect(newModel.getId()).toBe(newModel.get('sourceId'));
                    t.expect(newModel.getId()).toBe(parseInt(newModel.get('sourceId'), 10) + "");
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

});
