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
        gridConfig;

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

});
