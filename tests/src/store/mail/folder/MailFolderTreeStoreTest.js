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

describe('conjoon.cn_mail.store.mail.folder.MailFolderTreeStoreTest', function(t) {



    t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {

        Ext.ux.ajax.SimManager.init({
            delay: 1
        });

        t.it("Should properly create the store and check for default config, and initial load", function(t) {

            var store = Ext.create('conjoon.cn_mail.store.mail.folder.MailFolderTreeStore', {
                asynchronousLoad : false
            });

            t.expect(store instanceof Ext.data.TreeStore).toBe(true);

            t.expect(store.getAutoLoad()).toBe(false);


            t.expect(store.config.model).toBe('conjoon.cn_mail.model.mail.account.MailAccount');

            t.expect(store.alias).toContain('store.cn_mail-mailfoldertreestore');
            t.expect(store.getRoot() instanceof conjoon.cn_mail.model.mail.account.MailAccount).toBe(true);

            // proxy
            t.expect(store.getProxy() instanceof Ext.data.proxy.Rest).toBe(true);

            t.expect(store.getRoot().isExpanded()).toBe(false);

            t.expect(store.getRoot().isLoading()).toBe(false);


            t.expect(store.getNodeParam()).toBe("mailAccountId");


            store.load();


            t.expect(store.getRoot().isLoading()).toBe(true);

            t.waitForMs(500, function() {

                t.expect(store.getRoot().childNodes.length).toBe(2);

                t.expect(store.getRoot().childNodes[0].childNodes.length).toBeGreaterThan(1);

                t.expect(store.getRoot().childNodes[1].childNodes.length).toBeGreaterThan(1);

                t.expect(store.getRoot().childNodes[0].isExpanded()).toBe(false);

                t.expect(store.getRoot().childNodes[1].isExpanded()).toBe(false);
            });


        });


    });



});
