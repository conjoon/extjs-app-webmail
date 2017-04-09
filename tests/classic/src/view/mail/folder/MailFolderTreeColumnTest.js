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

describe('conjoon.cn_mail.view.mail.folder.MailFolderTreeColumnTest', function(t) {

    var treeColumn;

    t.beforeEach(function() {
        treeColumn = Ext.create(
            'conjoon.cn_mail.view.mail.folder.MailFolderTreeColumn'
        );
    });

    t.afterEach(function() {
        treeColumn = null;
    });


    t.it("Should create the column", function(t) {
        t.expect(treeColumn instanceof Ext.tree.Column).toBeTruthy();
        t.expect(treeColumn.alias).toContain('widget.cn_mail-mailfoldertreecolumn');
    });

    t.it("Should return proper iconCls based upon type", function(t) {
        var mapping = {
            'INBOX'  : 'fa fa-inbox',
            'DRAFT'  : 'fa fa-edit',
            'JUNK'   : 'fa fa-recycle',
            'TRASH'  : 'fa fa-trash',
            'SENT'   : 'fa fa-send',
            'FOLDER' : 'fa fa-folder',
            'hklhkl' : 'fa fa-folder'
        };

        for (var i in mapping) {
            if (!mapping.hasOwnProperty(i)) {
                continue;
            }
            t.expect(treeColumn.getIconClsForMailFolderType(i)).toBe(mapping[i]);
        }
    });

});
