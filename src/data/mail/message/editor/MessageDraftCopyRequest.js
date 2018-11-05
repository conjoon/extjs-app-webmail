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
 * Class to encapsulate information to create a copy for a MessageDraft via
 * conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier.
 *
 * Instances of this class are treated as immutable.
 *
 * @example
 *
 *     var request = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
 *
 *          compoundKey : conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(1, 2, 3),
 *
 *          editMode : conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO
 *     ));
 *
 *
 * @private
 */
Ext.define('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {

    requires : [
        'conjoon.cn_mail.data.mail.message.EditingModes',
        'conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey'
    ],

    config : {
        /**
         * The compound key of the MessageDraft to copy.
         * @type {conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey}
         */
        compoundKey : undefined,

        /**
         * The edit mode of the copy request.
         * @type {String}
         * @see applyEditMode
         */
        editMode : undefined

    },


    /**
     * Creates a new request.
     *
     * @param {Object} config
     *
     * @throws if compoundKey or editMode are not specified in the passed config object.
     *
     * @see applyId(), applyEditMode()
     */
    constructor : function(config) {

        var me = this;

        config = config || {};

        if (!config.hasOwnProperty('compoundKey')) {
            Ext.raise({
                config : config,
                msg    : "Property \"compoundKey\" must be specified."
            });
        }

        if (!config.hasOwnProperty('editMode')) {
            Ext.raise({
                config : config,
                msg    : "Property \"editMode\" must be specified."
            });
        }

        me.initConfig(config)

    },


    /**
     * Hook for setCompoundKey()
     * @throws if id was already set or if compoundKey is not an instance of
     * conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
     * @private
     */
    applyCompoundKey : function(compoundKey) {

        var me = this;

        if (me.getCompoundKey() !== undefined) {
            Ext.raise({
                compoundKey  : me.getCompoundKey(),
                msg : "Property \"compoundKey\" was already set."
            });
        }

        if (!(compoundKey instanceof conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey)) {
            Ext.raise({
                msg : "\"compoundKey\" must be an instance of conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey",
                compoundKey  : compoundKey
            });
        }

        return compoundKey;
    },

    /**
     * Hook for setEditMode().
     *
     * @throws if editMode was already set, or if editMode is not any of
     * conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO,-REPLY_ALL, or
     * -FORWARD.
     * @private
     */
    applyEditMode : function(editMode) {

        var me = this,
            modes, EditingModes;

        if (me.getEditMode() !== undefined) {
            Ext.raise({
                editMode : me.getEditMode(),
                msg      : "Property \"editMode\" was already set."
            });
        }

        EditingModes = conjoon.cn_mail.data.mail.message.EditingModes;
        modes        = [
            EditingModes.REPLY_TO,
            EditingModes.REPLY_ALL,
            EditingModes.FORWARD
        ];

        if (modes.indexOf(editMode) === -1) {
            Ext.raise({
                editMode : editMode,
                msg      : Ext.String.format(
                    "Property \"editMode\" must be one of {0}.",
                    modes.join(", ")
                )
            });
        }

        return editMode;
    }

});