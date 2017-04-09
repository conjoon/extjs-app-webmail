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
 * Base model for app-cn_mail mail package.
 *
 * The schema used by this model is {@link conjoon.cn_mail.data.mail.BaseSchema}
 */
Ext.define('conjoon.cn_mail.model.mail.BaseModel', {

    extend : 'conjoon.cn_core.data.BaseModel',

    requires : [
        'conjoon.cn_mail.data.mail.BaseSchema'
    ],

    schema : 'cn_mail-mailbaseschema'

});
