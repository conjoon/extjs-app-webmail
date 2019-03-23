/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
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
