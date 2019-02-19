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
 * BatchVisitor which checks after each operation if a NEXT operation's record has
 * it's id updated due to the coupling between the records, e.g. if a MessageBody
 * gets created (child in our Model), the MessageBody actually represents
 * an existing MessageDraft which in Sencha-World would afterwards created (previously
 * created operation which is now about to run), but actually should be changed to
 * an UPDATE operation.
 * This class takes care of proper handling and should be used whenever
 * Message compounds (Boddy/Draft/Item/Attachments) are used in conjunction.
 *
 * Extends SplitBatchVisitor to make sure each batch has only ONE operation.
 *
 *
 * NOTE:
 * By using this visitor, operatiosn get changed during runtime. Do not rely
 * on the state of the operations when the visitor has created the batches.
 */
Ext.define('conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor', {

    extend : 'coon.core.data.session.SplitBatchVisitor',

    /**
     * @inheritdoc
     *
     * This method will also apply appropriate listeners to make sure operations
     * are changed based on the previous operations, e.g. if a MessageBody was posted,
     * the BE should have created the according MessageDraft also, so the following
     * MessageDraft operation for this Batch would be changed from a "create"
     * to an "update" operation.
     *
     * @see onBatchOperationComplete
     */
    getBatch: function (sort) {

        const me = this,
              batch = me.callParent(arguments);

        // just in case...
        batch.un('operationcomplete', me.onBatchOperationComplete, me);
        batch.on('operationcomplete', me.onBatchOperationComplete, me);

        return batch;
    },


    /**
     * Swaps a CREATE operation with an UPDATE operation if the previous operation
     * applied a compound key to the record that is part of the following
     * operation.
     *
     * @param {Ext.data.Batch} batch
     * @param {Ext.data.operation.Operation} operation
     *
     * @return null if no operation was swapped, otherwise the newly created
     * {Ext.data.Operation}
     */
    onBatchOperationComplete : function(batch, operation) {

        const me = this;

        if (operation.hasException()) {
            return null;
        }

        let next       = batch.current + 1,
            operations = batch.getOperations(),
            op         = operations[next];

        if (!op) {
            return null;
        }

        let rec = op.getRecords();

        if (!rec || !rec.length) {
            return null;
        }

        rec = rec[0];

        let newOp = null;

        if (me.isOperationSwappable(op)) {

            let proxy = rec.getProxy();

            newOp = proxy.createOperation('update', {
                records : [rec]
            });
            newOp.entityType = Ext.getClass(rec);

            op.destroy();
            op = null;
            operations[next] = newOp;
        }

        return newOp;
    },


    /**
     * Returns true if the operation should be swapped with an update-operation,
     * otherwise false.
     * An operation should be swapped if
     *  - the entityName of the record is MessageDraft or MessageItem
     *  - the current action is set to "create"
     *  - the compound key of the record is fully set, most likely from a
     *  previous operation.
     *
     * @param {Ext.data.operation.Operation} op
     *
     * @return {Boolean}
     */
    isOperationSwappable : function(op) {

        let rec = op.getRecords();

        rec = Ext.isArray(rec) ? rec[0] : rec;

        return op.getAction() === 'create' && (rec.entityName === 'MessageDraft'
                || rec.entityName === 'MessageItem') && rec.isCompoundKeySet();
    }



});
