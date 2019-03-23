/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
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
