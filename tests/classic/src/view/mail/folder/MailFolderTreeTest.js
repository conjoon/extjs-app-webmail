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

describe('conjoon.cn_mail.view.mail.folder.MailFolderTreeTest', function(t) {

    var tree,
        treeConfig;

    t.afterEach(function() {
        if (tree) {
            tree.destroy();
            tree = null;
        }
    });

    t.beforeEach(function() {
        treeConfig = {
            renderTo : document.body
        }
    });


    t.it("Should create and show the tree along with default config checks", function(t) {
        tree = Ext.create(
            'conjoon.cn_mail.view.mail.folder.MailFolderTree', treeConfig);

        t.expect(tree instanceof Ext.tree.Panel).toBeTruthy();

        t.expect(tree.alias).toContain('widget.cn_mail-mailfoldertree');

        var columns = tree.getColumns();

        t.expect(columns.length).toBe(1);
        t.expect(columns[0] instanceof conjoon.cn_mail.view.mail.folder.MailFolderTreeColumn).toBe(true);
        t.expect(columns[0].dataIndex).toBe("name");

    });

});
