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

describe('conjoon.cn_mail.view.mail.message.MessageGridTest', function(t) {

    var grid,
        gridConfig,
        prop = function(value, subject) {
            return Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                testProp    : value,
                subject     : subject,
                date        : new Date(),
                previewText : 'Random Text'
            });
        };

    t.afterEach(function() {
        if (grid) {
            grid.destroy();
            grid = null;
        }
    });

    t.beforeEach(function() {
        gridConfig = {
            renderTo : document.body
        }
    });

    t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.message.MessageItemSim', function() {
    t.requireOk('conjoon.cn_mail.model.mail.message.MessageItem', function() {
    t.requireOk('conjoon.cn_mail.store.mail.message.MessageItemStore', function() {

        Ext.ux.ajax.SimManager.init({
            delay: 1
        });


        t.it("Should create and show the grid along with default config checks", function(t) {
            grid = Ext.create(
                'conjoon.cn_mail.view.mail.message.MessageGrid', gridConfig);

            t.expect(grid instanceof Ext.grid.Panel).toBeTruthy();

            t.expect(grid.alias).toContain('widget.cn_mail-mailmessagegrid');

            var feature = grid.view.getFeature('cn_mail-mailMessageFeature-messagePreview');
            t.isInstanceOf(feature, 'conjoon.cn_comp.grid.feature.RowBodySwitch');
            t.expect(feature.disabled).toBeFalsy()
        });


        t.it("enableRowPreview()", function(t) {
            grid = Ext.create(
                'conjoon.cn_mail.view.mail.message.MessageGrid', gridConfig);
            var feature = grid.view.getFeature('cn_mail-mailMessageFeature-messagePreview');

            t.expect(feature.disabled).toBe(false);
            grid.enableRowPreview(false);
            t.expect(feature.disabled).toBe(true);
            grid.enableRowPreview();
            t.expect(feature.disabled).toBe(false);
            grid.enableRowPreview(false)
            t.expect(feature.disabled).toBe(true);
            grid.enableRowPreview(true);;
            t.expect(feature.disabled).toBe(false);
        });

        t.it("Behavior with BufferedStore overrides", function(t) {
            grid = Ext.create('conjoon.cn_mail.view.mail.message.MessageGrid', {
                width    : 400,
                height   : 400,
                store    : {
                    type     : 'cn_mail-mailmessageitemstore',
                    autoLoad : true,
                    sorters  : [{
                        property  : 'testProp',
                        direction : 'DESC'
                    }]
                },
                renderTo : document.body
            });

            grid.enableRowPreview(false);

            t.waitForMs(750, function() {
                t.expect(grid.getStore().addSorted(prop(10000, 'first'))).not.toBe(null);
                t.expect(grid.getView().getRow(0).getElementsByTagName('td')[2].firstChild.innerHTML).not.toBe("first");
                grid.getView().refresh();
                t.expect(grid.getView().getRow(0).getElementsByTagName('td')[2].firstChild.innerHTML).toBe("first");

                t.expect(grid.getStore().addSorted(prop(9998.5, 'second'))).not.toBe(null);
                t.expect(grid.getView().getRow(2).getElementsByTagName('td')[2].firstChild.innerHTML).not.toBe("second");
                grid.getView().refresh();
                t.expect(grid.getView().getRow(2).getElementsByTagName('td')[2].firstChild.innerHTML).toBe("second");

            });


        });


    });
    });
    });
});
