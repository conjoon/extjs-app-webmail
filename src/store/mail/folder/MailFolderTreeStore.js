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