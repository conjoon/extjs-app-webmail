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
 * The default folder panel representing a mail inbox.
 * {@link conjoon.cn_mail.view.mail.folder.MailFolderTreeColumn} is used to provide
 * extra visual information for the nodes found within the tree.
 */
Ext.define('conjoon.cn_mail.view.mail.folder.MailFolderTree', {

    extend : 'Ext.tree.Panel',

    requires : [
        'conjoon.cn_mail.view.mail.folder.MailFolderTreeColumn'
    ],

    alias : 'widget.cn_mail-mailfoldertree',

    width  : 240,

    cls    : 'cn_mail-mailfoldertree',

    useArrows   : true,
    rootVisible : false,

    hideHeaders : true,

    viewConfig: {
        outerRowTpl: [
            '<table id="{rowId}" role="presentation" ',
            'data-boundView="{view.id}" ',
            'data-recordId="{record.internalId}" ',
            'data-recordIndex="{recordIndex}" ',
            'class="{[values.itemClasses.join(" ")]} {[this.getOuterRowClass(values.record, values.view.dataSource)]}" cellpadding="0" cellspacing="0" style="{itemStyle};width:0;">',

            // Do NOT emit a <TBODY> tag in case the nextTpl has to emit a <COLGROUP> column sizer element.
            // Browser will create a tbody tag when it encounters the first <TR>
            '{%',
            'this.nextTpl.applyOut(values, out, parent)',
            '%}',
            '</table>',
            {
                getOuterRowClass : function(record, store) {

                    let type  = record.get('cn_folderType').toLowerCase(),
                        cls   = 'cn_' + type,
                        pn    = record.parentNode,
                        root  = store.getRoot(),
                        isSub = pn &&
                            pn !== root &&
                            pn.parentNode !== root;

                    if (!isSub && type !== "account") {
                        cls += ' cn_folder';
                    }

                    if (type === "account" && !record.previousSibling) {
                        cls += ' first';
                    } else if (isSub) {
                        cls += ' cn_subfolder';
                    }

                    return cls;
                },
                priority: 9999
            }
        ]
    },


    columns : [{
        xtype     : 'cn_mail-mailfoldertreecolumn',
        dataIndex : 'name',
        flex      : 1,
        renderer  : function(value, metaData, record) {
            var unreadCount = record.get('unreadCount');

            if (unreadCount > 0) {
                return value  + '<span class="badge-unreadcount">' + unreadCount + '</span>';
            }
            return value;

        }
    }]



});