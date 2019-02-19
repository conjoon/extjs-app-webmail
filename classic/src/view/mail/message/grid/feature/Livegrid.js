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
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 *  Extends livegrid by adding getRecordByCompoundKey() to the feature.
 *
 */
Ext.define('conjoon.cn_mail.view.mail.message.grid.feature.Livegrid', {

    extend : 'coon.comp.grid.feature.Livegrid',

    requires : [
        'conjoon.cn_mail.data.mail.message.CompoundKey',
        'coon.core.data.pageMap.PageMapUtil'
    ],

    alias : 'feature.cn_mail-mailmessagegridfeature-livegrid',

    /**
     * Helper function to find and return the record specified by the id.
     * Returns the record-instance or null if not found.
     *
     * @param {conjoon.cn_mail.data.mail.message.CompoundKey} compoundKey
     *
     * @return {Ext.data.Model|null}
     *
     * @see coon.core.data.pageMap.PageMapUtil#getRecordBy
     *
     * @throws if compoudnKey is not an instance of conjoon.cn_mail.data.mail.message.CompoundKey
     */
    getRecordByCompoundKey : function(compoundKey) {

        const me = this;

        if (!(compoundKey instanceof conjoon.cn_mail.data.mail.message.CompoundKey)) {
            Ext.raise({
                msg         : "\"compoundKey\" must be an instance of conjoon.cn_mail.data.mail.message.CompoundKey",
                compoundKey : compoundKey
            });
        }

        return coon.core.data.pageMap.PageMapUtil.getRecordBy(
            function(rec) {
                return rec.getCompoundKey().equalTo(compoundKey) === true;
            }, me.pageMapFeeder
        );
    }


});