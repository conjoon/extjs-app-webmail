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

describe('conjoon.cn_mail.data.mail.service.MailFolderHelperTest', function(t) {

    const createHelper = function(store) {

        return Ext.create('conjoon.cn_mail.data.mail.service.MailFolderHelper', {
            store : store === false ? undefined  : Ext.create('conjoon.cn_mail.store.mail.folder.MailFolderTreeStore',{
                autoLoad : true
            })
        });
    };


// -----------------------------------------------------------------------------
// |   Tests
// -----------------------------------------------------------------------------
t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.folder.MailFolderSim', function() {

    Ext.ux.ajax.SimManager.init({
        delay: 1
    });


    t.it("constructor()", function(t) {
        let exc, e, helper;

        try{helper = createHelper(false);}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");

        helper = createHelper();
        t.isInstanceOf(helper, 'conjoon.cn_mail.data.mail.service.MailFolderHelper');
        t.expect(helper.getStore()).toBeDefined();
        t.isInstanceOf(helper.getStore(), 'conjoon.cn_mail.store.mail.folder.MailFolderTreeStore');
    });


    t.it("getMailFolderIdForType()", function(t) {

        let helper = createHelper(),
            exc, e;

        t.waitForMs(250, function() {
            t.expect(helper.getMailFolderIdForType('foo')).toBeNull();
            t.expect(helper.getMailFolderIdForType(conjoon.cn_mail.data.mail.folder.MailFolderTypes.INBOX)).toBe("1");
            t.expect(helper.getMailFolderIdForType(conjoon.cn_mail.data.mail.folder.MailFolderTypes.SENT)).toBe("2");
            t.expect(helper.getMailFolderIdForType(conjoon.cn_mail.data.mail.folder.MailFolderTypes.JUNK)).toBe("3");
            t.expect(helper.getMailFolderIdForType(conjoon.cn_mail.data.mail.folder.MailFolderTypes.DRAFT)).toBe("4");
            t.expect(helper.getMailFolderIdForType(conjoon.cn_mail.data.mail.folder.MailFolderTypes.TRASH)).toBe("5");
        });

    });


    t.it("getMailFolder()", function(t) {

        let helper = createHelper();

        t.waitForMs(250, function() {
            t.expect(helper.getMailFolder('foo')).toBeNull();
            t.isInstanceOf(helper.getMailFolder("1"), 'conjoon.cn_mail.model.mail.folder.MailFolder');
        });

    });


});});