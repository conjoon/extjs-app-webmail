/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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


StartTest(async t => {

    let cmp;

    t.beforeEach(t => {
        cmp = Ext.create("conjoon.cn_mail.view.mail.MailDesktopViewController");
    });

    t.afterEach(t => {
        cmp.destroy();
        cmp = null;
    });


    // +-----------------------------------------
    // | Tests
    // +-----------------------------------------
    t.diag("fix: seedFolders is trying to access undefined TreeModel (conjoon/extjs-app-webmail#157)");

    t.it("configureWithMailFolderTreeStore()", t => {

        const
            childNodesNoPass = [{}, {}, {}],
            childNodesPass = [{childNodes: []}, {}, {childNodes: []}],
            rootNode = {
                childNodes: childNodesNoPass
            },
            treeStore = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance(),
            loadedSpy = t.spyOn(treeStore, "isLoaded").and.returnValue(true),
            seedSpy= t.spyOn(cmp, "seedFolders").and.callFake(() => ({})),
            rootNodeSpy = t.spyOn(treeStore, "getRootNode").and.returnValue(rootNode);

        rootNode.childNodes = childNodesNoPass;
        cmp.configureWithMailFolderTreeStore();
        t.expect(seedSpy.calls.count()).toBe(0);


        rootNode.childNodes = childNodesPass;
        cmp.configureWithMailFolderTreeStore();
        t.expect(seedSpy.calls.count()).toBe(2);

        [loadedSpy, seedSpy, rootNodeSpy].map(spy => spy.remove());
    });

});
