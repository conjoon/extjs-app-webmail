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

/**
 * Base store for managing {@link conjoon.cn_mail.model.mail.folder.MailFolder} as
 * child nodes of {@link conjoon.cn_mail.model.mail.account.MailAccount}.
 *
 * The hierarchy of the tree content of a MailFolderTreeStore looks as follows:
 *
 * - root
 *     |
 *     +- MailAccount
 *     |        |
 *     |        + MailFolder
 *     |        + MailFolder
 *     |        + MailFolder
 *     |
 *     +- MailAccount
 *             |
 *             + MailFolder
 *             + MailFolder
 *
 * Model types will be set by the readers specified by the proxies et al.
 */
Ext.define('conjoon.cn_mail.store.mail.folder.MailFolderTreeStore', {

    extend : 'Ext.data.TreeStore',

    requires : [
        'conjoon.cn_mail.model.mail.folder.MailFolder',
        'conjoon.cn_mail.model.mail.account.MailAccount'
    ],

    alias : 'store.cn_mail-mailfoldertreestore',

    model : 'conjoon.cn_mail.model.mail.account.MailAccount',

    autoLoad : false,

    nodeParam : 'mailAccountId',

    root: {
        // set initially to false so no ugly fragments will blink when account node
        // was loaded and load mask is hidden / shown when mail folder loads.
        expanded : false,
        data     : []
    },


    /**
     * Makes sure the append listener #onRootNodeAppend for the root node gets
     * installed.
     *
     * @see onRootNodeAppend
     */
    constructor : function() {

        const me = this;

        me.callParent(arguments);

        let root = me.getRoot();

        root.on('append', me.onRootNodeAppend, me);
    },


    /**
     * Callback for the root node's append event. Makes sure the root node is expanded and
     * furthermore expands the appended MailAccount-nodes to make sure they are loaded
     * with their MailFolder's.
     */
    onRootNodeAppend : function(rootNode, node) {

        const me   = this,
              root = me.getRoot(),
              cb   = function() {
                  node.expand(false, function() {node.collapse()});
              };

        if (rootNode !== root) {
            return;
        }

        switch (rootNode.isExpanded()) {
            case true:
                rootNode.expand(false, cb);
                break;
            default:
                cb();
        }
    }


});