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
 * The default viewModel for {@link conjoon.cn_mail.view.mail.message.reader.MessageView}.
 * This default implementation is configured to be used with
 * {@link conjoon.cn_mail.view.mail.message.reader.MessageView}.
 *
 * This viewModel provides data bindings for
 * messageItem {@link conjoon.cn_mail.model.mail.message.MessageItem}
 * and
 * messageBody {@link conjoon.cn_mail.model.mail.message.MessageBody}
 */
Ext.define('conjoon.cn_mail.view.mail.message.reader.MessageViewModel', {

    extend : 'Ext.app.ViewModel',

    alias : 'viewmodel.cn_mail-mailmessagereadermessageviewmodel',

    /**
     * The current load operation of the {@link conjoon.cn_mail.model.mail.message.MessageBody},
     * if any.
     * @type {Ext.data.operation.Read}
     * @private
     */
    currentLoadOperation : null,

    /**
     * A map of messageBodyIds which were loaded but where the load process was
     * cancelled. This is so the loader knows when it has to set the "reload"
     * options.
     * Once successfully loaded, the loaded id will be removed from the map.
     * @private
     */
    abortedRequestMap : null,

    /**
     * Sets the message item for this view, or null to clear the view.
     * Once the message was loaded into the view, the associated messageItem's
     * 'isRead' field will be set to "true".
     * Due to the nature of the asynchronous process involved with loading any
     * associated {@link conjoon.cn_mail.model.mail.message.MessageBody},
     * this method will also take care of cancelling any undergoing load-process
     * if another call to this method was made while a message body is currently
     * being loaded.
     * If no messageBody was associated with the messageItem, the ViewModel's
     * messageBody will be set to an empty object {}.
     *
     * @param {@conjoon.cn_mail.model.mail.message.MessageItem/null} messageItem
     *
     * @throws exception if messageItem is neither null and not of type
     * {@link conjoon.cn_mail.model.mail.message.MessageItem}
     */
    setMessageItem : function(messageItem) {

        var me = this;

        if (messageItem &&
            !(messageItem instanceof conjoon.cn_mail.model.mail.message.MessageItem)) {
            Ext.raise({
                sourceClass : Ext.getClassName(this),
                msg         : "messageItem needs to be instance of conjoon.cn_mail.model.mail.message.MessageItem"
            });
        }

        if (!me.abortedRequestMap) {
            me.abortedRequestMap = {};
        }

        if (me.currentLoadOperation) {
            me.abortMessageBodyLoad();
        }

        me.set('messageItem', messageItem);

        if (messageItem) {

            /**
             * @bug
             * @see https://www.sencha.com/forum/showthread.php?336578-6-2-1-Ext-data-Model-load-scope-parameters-not-considered-iterating-extra-callbacks&p=1174274#post1174274
             */
            var ret = messageItem.getMessageBody({
                reload  : me.abortedRequestMap[messageItem.get('messageBodyId')] === true,
                success : function(record, operation){
                    me.messageBodyLoaded(record, operation, messageItem);
                }
            });

            if (!ret) {
                me.messageBodyLoaded(null, null);
                return;
            }

            if (ret.loadOperation) {
                me.currentLoadOperation = {
                    messageBodyId : messageItem.get('messageBodyId'),
                    loadOperation : ret.loadOperation
                }
            }


        } else {
            me.messageBodyLoaded(null, null);
        }

    },

    privates : {


        abortMessageBodyLoad : function() {

            var me                   = this,
                currentLoadOperation = me.currentLoadOperation;

            if (currentLoadOperation.loadOperation && currentLoadOperation.loadOperation.isRunning()) {
                currentLoadOperation.loadOperation.abort();
                me.abortedRequestMap[currentLoadOperation.messageBodyId] = true;
            }

            me.currentLoadOperation = null;
        },

        messageBodyLoaded : function(record, operation) {
            var me   = this,
                item = me.get('messageItem');

            me.currentLoadOperation = null;

            if (!record) {
                // set to null or any, mark messageBody empty in view
                me.set('messageBody', {});
                return;
            }

            if (!item) {
                //message item might be unloaded
                return;
            }

            // everything okay, mark item as read and set messageBody
            delete  me.abortedRequestMap[record.get('id')];
            me.set('messageBody', record);

            if (item.get('isRead') != true) {
                item.set('isRead', true);
                item.save({
                    callback : me.triggerMessageItemRead,
                    scope   : me
                });
            }

        },

        triggerMessageItemRead : function(record, operation) {

            var me   = this,
                view = me.getView();

            view.fireEvent(
                'cn_mail-mailmessageitemread', [record]
            );
        }

    }

});