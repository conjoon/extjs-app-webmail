/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * Extends SplitBatchVisitor to make sure each batch has only ONE operation.
 * This class is used internally by conjoon.cn_mail.data.mail.message.session.MessageDraftSession
 * and makes sure that removed data (DraftAttachment-operations) updates the id of
 * the messageDraft-record this class was configured with.
 *
 *
 * NOTE:
 * By using this visitor, operations get changed during runtime. Do not rely
 * on the state of the operations when the visitor has created the batches.
 */
Ext.define("conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor", {

    extend: "coon.core.data.session.SplitBatchVisitor",

    config: {
        messageDraft: undefined
    },


    /**
     * Applies the MessageDraft to this instance.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @returns {conjoon.cn_mail.model.mail.message.MessageDraft}
     *
     * @throws if a messageDraft is already available for this session, or if the
     * messageDraft is not an instance of conjoon.cn_mail.model.mail.message.MessageDraft
     */
    applyMessageDraft: function (messageDraft) {

        const me = this;

        if (me.getMessageDraft()) {
            Ext.raise("\"messageDraft\" was already set");
        }

        if (messageDraft !== undefined && !(messageDraft instanceof conjoon.cn_mail.model.mail.message.MessageDraft)) {
            Ext.raise("\"messageDraft\" must be an instance of conjoon.cn_mail.model.mail.message.MessageDraft");
        }

        return messageDraft;
    },


    /**
     * @inheritdoc
     *
     * This method will also apply appropriate listeners to make sure operations
     * are changed based on the previous operations, e.g. if a MessageBody was posted,
     * the BE should have created the according MessageDraft also, so the following
     * MessageDraft operation for this Batch would be changed from a "create"
     * to an "update" operation.
     * Additonally, this method will make sure that the preBatchCompoundKey is stored
     * in this instance's MessagDraft when the batch's start() method is called.
     *
     * @see onBatchOperationComplete
     *
     * @see conjoon.cn_mail.model.mail.message.MessageDraft#storePreBatchCompoundKey
     */
    getBatch: function (sort) {

        const me = this,
            batch = me.callParent(arguments);

        // just in case...
        batch.un("operationcomplete", me.onBatchOperationComplete, me);
        batch.on("operationcomplete", me.onBatchOperationComplete, me);

        batch.start = Ext.Function.createInterceptor(batch.start, function (){
            const me = this,
                md = me.getMessageDraft();

            md.storePreBatchCompoundKey();

        }, me);

        return batch;
    },


    /**
     * Swaps a CREATE operation with an UPDATE operation if the previous operation
     * applied a compound key to the record that is part of the following
     * operation.
     * Will assign the id returned by the DESTROY operation and update the
     * MessageDraft this class was configured with.
     * Makes sure that data that is about to be destroyed gets the current
     * parentMesssageItem-id set of this MessageDraft (since an automatic seed done by
     * the model itself wont work since associations are lost once "remove" was called
     * on the store the data belongs to).
     *
     * @param {Ext.data.Batch} batch
     * @param {Ext.data.operation.Operation} operation
     *
     * @return null if no operation was swapped, otherwise the newly created
     * {Ext.data.Operation}
     *
     * @throws if no MessageDraft is configured, or if the number of records
     * per operation is > 1
     *
     * @see seedRetrievedKey
     * @see refreshKeyForDestroy
     */
    onBatchOperationComplete: function (batch, operation) {

        const me = this;

        if (operation.hasException()) {
            return null;
        }

        let next       = batch.current + 1,
            operations = batch.getOperations(),
            op         = operations[next],
            rec, newOp, proxy;

        if (!me.getMessageDraft()) {
            Ext.raise("Missing messageDraft configuration.");
        }

        // check if operation WAS DESTROY and seed the retrieved key
        me.seedRetrievedKey(operation);

        // check if operation IS GOING TO BE DESTROY and set the new key
        me.refreshKeyForDestroy(op);


        if (!op) {
            return null;
        }
        rec = op.getRecords();

        if (!rec || !rec.length) {
            return null;
        }

        if (rec.length > 1) {
            Ext.raise("Unexpected number of records. Need 1, got " + rec.length);
        }

        rec = rec[0];

        newOp = null;


        if (me.isOperationSwappable(op)) {

            proxy = rec.getProxy();

            newOp = proxy.createOperation("update", {
                records: [rec],
                params: {
                    origin: op.getAction()
                }
            });
            newOp.entityType = Ext.getClass(rec);

            op.destroy();
            op = null;
            operations[next] = newOp;

        }

        return newOp;
    },


    /**
     * Checks whether this operation is a destroy-operation of a DraftAttachment
     * and seeds the new parentMessageItemId that was returned by this operation
     * among the MessageDraft of this instance.
     * This method expects for a destroyed DraftAttachment the response to be the MessageKey
     * of the owning MessageItem for which the attachment was removed.
     *
     * @param {Ext.data.operation.Operation} operation
     *
     * @return {Boolean} true if the key was seeded, otherwise false
     *
     * @private
     */
    seedRetrievedKey: function (operation) {

        if (!operation || !operation.getRecords()) {
            return false;
        }

        const
            me = this,
            rec = operation.getRecords()[0],
            messageDraft = me.getMessageDraft(),
            response = operation.getResponse(),
            responseType = response.responseType,
            resp = responseType === "json" ? response.responseJson : Ext.decode(response.responseText);

        if (operation.getAction() === "destroy" && rec.entityName === "DraftAttachment") {
            messageDraft.set("id", resp.data.id);
            messageDraft.commit();

            return true;
        }

        return false;
    },


    /**
     * Checks whether this operation is a destroy-operation of a DraftAttachment
     * and sets the parentMessageItemId to the id of the MessageDraft of this class.
     *
     * @param {Ext.data.operation.Operation} operation
     *
     * @return {Boolean} true if the parentMessageItemId was set, otherwise false.
     *
     * @private
     */
    refreshKeyForDestroy: function (operation) {

        if (!operation || operation.getAction() !== "destroy") {
            return false;
        }

        const me           = this,
            rec          = operation.getRecords()[0],
            messageDraft = me.getMessageDraft();

        if (rec.entityName !== "DraftAttachment") {
            Ext.raise("no handler for \""  + rec.entityName + "\" found");
        }

        /**
         * Attachments are already marked as dropped at this point - the session needs this information to
         * create the Batch which is being sent to the server. We need to reject() the changes before we update
         * the parentMessageItemId, so that a subsequent commit() does not mark the record as erased. In this case,
         * rejecting changes would be impossible. @see conjoon/extjs-app-webmail#196
         */
        rec.reject();
        rec.set("parentMessageItemId", messageDraft.get("id"));
        rec.commit();
        rec.drop();

        return true;
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
    isOperationSwappable: function (op) {

        let rec = op.getRecords();

        rec = Ext.isArray(rec) ? rec[0] : rec;

        return op.getAction() === "create" && (rec.entityName === "MessageDraft"
                || rec.entityName === "MessageItem") && rec.isCompoundKeyConfigured();
    }


});
