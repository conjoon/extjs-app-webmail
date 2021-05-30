/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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
 * A special session implementation that makes sure that a MessageDraft
 * is passed to the MessageCompoundBatchVisitor as the leading record.
 * This session should be used whenever constructs of MessageDrafts, MessageBodys and
 * Attachments need to be edited/created and saved.
 * This implementation takes care of adopting the leadingRecord, if not already done.
 *
 * @example
 *      const session = Ext.create('conjoon.cn_mail.data.mail.message.session.MessageDraftSession'),
 *            draft   = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
 *                          subject       : 'test',
 *                          mailFolderId  : "INBOX.Drafts",
 *                          mailAccountId : "dev_sys_conjoon_org"
 *                      });
 *
 *      session.setMessageDraft(draft);
 *
 *      const messageBody = session.createRecord('MessageBody', {
 *           mailFolderId  : "INBOX.Drafts",
 *           mailAccountId : "dev_sys_conjoon_org"
 *      });
 *      draft.setMessageBody(messageBody);
 *
 *
 */
Ext.define("conjoon.cn_mail.data.mail.message.session.MessageDraftSession", {

    extend: "coon.core.data.Session",

    requires: [
        "conjoon.cn_mail.data.mail.BaseSchema",
        "conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor",
        "conjoon.cn_mail.model.mail.message.MessageDraft"
    ],

    config: {
        messageDraft: undefined
    },

    schema: "cn_mail-mailbaseschema",

    batchVisitorClassName: "conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor",


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

        if (messageDraft !== undefined) {
            me.adopt(messageDraft);
        }

        return messageDraft;
    },


    privates: {

        /**
         * @inheritdoc
         * Makes sure that the messageDraft of this session is passed to
         * the MessageCompoundBatchVisitor.
         *
         * @throws if no messageDraft is available, or if the messageDraft is not an
         * instance of conjoon.cn_mail.model.mail.message.MessageDraft
         */
        createVisitor: function () {

            const me = this,
                visitor = me.callParent(arguments),
                messageDraft = me.getMessageDraft();

            if (!messageDraft) {
                Ext.raise("\"messageDraft\" must be set.");
            }


            visitor.setMessageDraft(messageDraft);

            return visitor;

        }
    }
});
