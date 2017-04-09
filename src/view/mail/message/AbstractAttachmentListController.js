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
 * This is the view controller for {@link conjoon.cn_mail.view.mail.message.AttachmentList}.
 *
 * @abstract
 */
Ext.define('conjoon.cn_mail.view.mail.message.AbstractAttachmentListController', {

    extend : 'Ext.app.ViewController',

    /**
     * @inheritdoc
     */
    init : function () {
        var me = this;
        me.mon(me.getView(), 'itemclick', me.onAttachmentItemClick, me);
    },

    /**
     * Callback {@link conjoon.cn_mail.view.mail.message.AttachmentList} itemclick
     * event.
     *
     * @param view
     * @param record
     * @param item
     * @param index
     * @param e
     * @param eOpts
     *
     * @abstract
     */
    onAttachmentItemClick : Ext.emptyFn

});
