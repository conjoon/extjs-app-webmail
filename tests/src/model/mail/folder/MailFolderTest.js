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

describe('conjoon.cn_mail.model.mailfolder..MailFolderTest', function(t) {

    var model;

    t.beforeEach(function() {
        model = Ext.create('conjoon.cn_mail.model.mail.folder.MailFolder', {
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
        t.expect(model instanceof conjoon.cn_mail.model.mail.AbstractCompoundKeyedTreeModel).toBe(true);
        t.expect(model instanceof conjoon.cn_mail.model.mail.BaseTreeModel).toBe(true);

        t.expect(model.getIdProperty()).toBe('localId');
        t.expect(model.getField('unreadCount').getPersist()).toBe(false);
        t.expect(model.getField('mailAccountId').critical).toBe(true);
    });

    t.it("Test Entity Name", function(t) {
        t.expect(
            model.entityName
        ).toBe('MailFolder');
    });

    t.it("Test Record Validity", function(t) {
        t.expect(model.isValid()).toBe(false);
        model.set('text', 'Posteingang');
        t.expect(model.isValid()).toBe(false);

        model.set('type', 'Posteingang');
        t.expect(model.isValid()).toBe(false);

        model.set('mailAccountId', 'foo');
        model.set('type', 'INBOX');
        t.expect(model.isValid()).toBe(true);
        model.set('type', '');
        t.expect(model.isValid()).toBe(false);

        model.set('type', 'DRAFT');
        t.expect(model.isValid()).toBe(true);
        model.set('type', '');
        t.expect(model.isValid()).toBe(false);

        model.set('type', 'JUNK');
        t.expect(model.isValid()).toBe(true);
        model.set('type', '');
        t.expect(model.isValid()).toBe(false);

        model.set('type', 'TRASH');
        t.expect(model.isValid()).toBe(true);
        model.set('type', '');
        t.expect(model.isValid()).toBe(false);

        model.set('type', 'SENT');
        t.expect(model.isValid()).toBe(true);
        model.set('type', '');
        t.expect(model.isValid()).toBe(false);

        model.set('type', 'FOLDER');
        t.expect(model.isValid()).toBe(true);
        model.set('type', '');
        t.expect(model.isValid()).toBe(false);

        model.set('type', null);
        t.expect(model.isValid()).toBe(false);

        model.set('type', 'ACCOUNT');
        t.expect(model.isValid()).toBe(true);

        model.set('type', 'foo');
        t.expect(model.isValid()).toBe(false);

        model.set('type', 'ACCOUNT');
        model.set('mailAccountId', null);
        t.expect(model.isValid()).toBe(false);
    });


    t.it("toUrl()", function(t) {

        let accountNode =  Ext.create('conjoon.cn_mail.model.mail.folder.MailFolder', {
            localId       : 'meh',
            id            : 1,
            mailAccountId : 'foo@account',
            type          : 'ACCOUNT'
        });
        t.expect(accountNode.toUrl()).toBe('cn_mail/folder/1');

        accountNode.set('type', 'INBOX');

        t.expect(accountNode.toUrl()).toBe('cn_mail/folder/foo@account/1');
    });


    t.it("getRepresentingCompoundKeyClass()", function(t) {

        let model = Ext.create('conjoon.cn_mail.model.mail.folder.MailFolder', {

        });

        t.expect(model.getRepresentingCompoundKeyClass()).toBe(
            conjoon.cn_mail.data.mail.folder.compoundKey.MailFolderCompoundKey
        );

    });


    t.it("foreignKeyFields", function(t) {

        let model = Ext.create('conjoon.cn_mail.model.mail.folder.MailFolder', {

        });

        t.expect(model.foreignKeyFields).toEqual(
            ['mailAccountId', 'id']
        );

    });


});
