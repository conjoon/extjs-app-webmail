/**
 * conjoon
 * (c) 2007-2019 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg/conjoon.org
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

describe('conjoon.cn_mail.model.mail.account.MailAccountTest', function(t) {

    var model;

    t.beforeEach(function() {
        model = Ext.create('conjoon.cn_mail.model.mail.account.MailAccount', {
            id : 1
        });
    });

    t.afterEach(function() {
        model = null;
    });


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.it("Should create instance and check basic configuration", function(t) {
        t.expect(model instanceof conjoon.cn_mail.model.mail.BaseTreeModel).toBe(true);

        t.expect(model.getIdProperty()).toBe('id');

    });

    t.it("Test Entity Name", function(t) {
        t.expect(
            model.entityName
        ).toBe('MailAccount');
    });

    t.it("toUrl()", function(t) {

        let model =  Ext.create('conjoon.cn_mail.model.mail.account.MailAccount', {
            id : 'foo'
        });
        t.expect(model.toUrl()).toBe('cn_mail/account/foo');

    });


    t.it("Test Record Validity", function(t) {
        t.expect(model.isValid()).toBe(false);

        model.set('cn_folderType', 'Posteingang');
        t.expect(model.isValid()).toBe(false);

        model.set('cn_folderType', 'ACCOUNT');
        t.expect(model.isValid()).toBe(false);

        model.set('name', 'foo');
        t.expect(model.isValid()).toBe(true);

        model.set('cn_folderType', null);
        t.expect(model.isValid()).toBe(false);

        model.set('cn_folderType', "ACCOUNT");
        t.expect(model.isValid()).toBe(true);


    });



});
