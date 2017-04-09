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
 * This is a dummy class that takes care of requiring all sim definitions
 * from the data.mail.ajax.sim namespace for local development.
 */
Ext.define('conjoon.cn_mail.data.mail.PackageSim', {
    requires: [
        'conjoon.cn_mail.data.mail.ajax.sim.message.AttachmentSim',
        'conjoon.cn_mail.data.mail.ajax.sim.message.MessageItemSim',
        'conjoon.cn_mail.data.mail.ajax.sim.message.MessageDraftSim',
        'conjoon.cn_mail.data.mail.ajax.sim.message.MessageBodySim',
        'conjoon.cn_mail.data.mail.ajax.sim.folder.MailFolderSim'
    ]
});
