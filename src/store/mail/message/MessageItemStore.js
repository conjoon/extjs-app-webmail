/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
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
 * Base store for managing {@link conjoon.cn_mail.model.mail.message.MessageItem}.
 *
 *
 */
Ext.define('conjoon.cn_mail.store.mail.message.MessageItemStore', {

    extend : 'Ext.data.BufferedStore',

    requires : [
        'conjoon.cn_mail.model.mail.message.MessageItem'
    ],

    alias : 'store.cn_mail-mailmessageitemstore',

    model : 'conjoon.cn_mail.model.mail.message.MessageItem',

    remoteSort : true,

    remoteFilter : true,

    autoLoad : false,

    sorters : [{
        property  : 'date',
        direction : 'DESC'
    }],


    /**
     * @inheritdoc
     * Overriden to make sure that this store instance allows only one sorter
     */
    applySorters : function(sorters) {

        var me = this;

        if (sorters && sorters.length !== 0 &&
            ((me.getSorters(false) && me.getSorters(false).length !== 0) ||
            sorters.length !== 1)) {
            Ext.raise({
                sorters : sorters,
                msg     : "Only one sorter allowed for MessageItem store"
            });
        }

        return me.callParent(arguments);
    }



});