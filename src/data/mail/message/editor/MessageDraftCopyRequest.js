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
 * Class to encapsulate information to create a copy for a MessageDraft via
 * conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier.
 *
 * Instances of this class are treated as immutable.
 *
 * @example
 *
 *     var request = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
 *
 *          id : '5',
 *
 *          editMode : conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO
 *     ));
 *
 *
 * @private
 */
Ext.define('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {

    requires : [
        'conjoon.cn_mail.data.mail.message.EditingModes'
    ],

    config : {
        /**
         * The id of the MessageDraft to copy.
         * @type {String}
         */
        id : undefined,

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
     * @throws if id or editMode are not specified in the passed config object.
     *
     * @see applyId(), applyEditMode()
     */
    constructor : function(config) {

        var me = this;

        config = config || {};

        if (!config.hasOwnProperty('id')) {
            Ext.raise({
                config : config,
                msg    : "Property \"id\" must be specified.",
                cls :Ext.getClassName(me)
            })
        }

        if (!config.hasOwnProperty('editMode')) {
            Ext.raise({
                config : config,
                msg    : "Property \"editMode\" must be specified.",
                cls :Ext.getClassName(me)
            })
        }

        me.initConfig(config)

    },


    /**
     * Hook for setId()
     * @throws if id was already set
     * @private
     */
    applyId : function(id) {

        var me = this;

        if (me.getId() !== undefined) {
            Ext.raise({
                id  : me.getId(),
                msg : "Property \"id\" was already set.",
                cls :Ext.getClassName(me)
            })
        }

        return id;
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
            })
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
            })
        }

        return editMode;
    }

});