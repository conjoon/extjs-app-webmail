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

/**
 * The default folder column to display entries in a
 * {@link conjoon.cn_mail.view.mail.FolderTree}.
 *
 * The {@link #tpl} config is a customized template which is capable of
 * displaying a badge representing the unreadCount property of the record
 * currently being rendered. Ideally, the record type being used with this
 * column is the {@link conjoon.cn_mail.model.mail.folder.MailFolder}.
 *
 * The {@link #initTemplateRendererData} method is overriden to choose an icon
 * for the displayed folder. Icons are mapped against the following values found
 * in any model's "cn_folderType" property:
 * INBOX
 * SENT
 * DRAFT
 * JUNK
 * TRASH
 * FOLDER
 *
 */
Ext.define('conjoon.cn_mail.view.mail.folder.MailFolderTreeColumn', {

    extend : 'Ext.tree.Column',

    alias : 'widget.cn_mail-mailfoldertreecolumn',

    /**
     * @inheritdoc
     *
     * @see #getIconClsForMailFolderType
     */
    initTemplateRendererData : function(value, metaData, record, rowIdx, colIdx, store, view) {

        var me = this,
            ret;

        record.set('iconCls', me.getIconClsForMailFolderType(record.get('cn_folderType')));

        return Ext.tree.Column.prototype.initTemplateRendererData.apply(me, arguments);
    },

    /**
     * Returns an iconCls to visually represent the specified folder type.
     * Considered type-values can be found in {@link conjoon.cn_mail.model.mail.folder.MailFolder}
     * in the field "cn_folderType".
     *
     * @param {String} type
     *
     * @returns {string}
     *
     * @protected
     */
    getIconClsForMailFolderType : function(type) {

        var iconCls = 'fa fa-folder';

        switch (type) {
            case 'INBOX':
                iconCls = 'fa fa-inbox';
                break;
            case 'DRAFT':
                iconCls = 'fa fa-edit';
                break;
            case 'JUNK':
                iconCls = 'fa fa-recycle';
                break;
            case 'TRASH':
                iconCls = 'fa fa-trash';
                break;
            case 'SENT':
                iconCls = 'fa fa-send';
                break;
        }

        return iconCls;
    }

});