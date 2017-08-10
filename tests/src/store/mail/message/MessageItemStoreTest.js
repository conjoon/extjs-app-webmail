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

describe('conjoon.cn_mail.store.mail.message.MessageItemStoreTest', function(t) {

    t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.message.MessageItemSim', function() {

        Ext.ux.ajax.SimManager.init({
            delay: 1
        });

        t.it("Should properly create the store and check for default config", function(t) {

            var store = Ext.create('conjoon.cn_mail.store.mail.message.MessageItemStore');

            t.expect(store instanceof Ext.data.BufferedStore).toBe(true);

            t.expect(store.config.model).toBe('conjoon.cn_mail.model.mail.message.MessageItem');

            t.expect(store.alias).toContain('store.cn_mail-mailmessageitemstore');

            t.expect(store.getAutoLoad()).toBeFalsy();

            t.expect(store.getRemoteFilter()).toBe(true);
            t.expect(store.getRemoteSort()).toBe(true);

            // proxy
            t.expect(store.getProxy() instanceof Ext.data.proxy.Rest).toBe(true);

            // data range
            store.load();
            t.waitForMs(250, function() {
                t.expect(store.getTotalCount()).toBe(25);
            });


    })});

});
