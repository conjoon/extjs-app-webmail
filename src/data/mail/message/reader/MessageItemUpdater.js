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
 * Helper class for updating MessageItems based on MessageDrafts.
 * Note:
 * =====
 * Updated values are not considered to be filtered and sanitized regarding
 * proper render output. This should be done by the views.
 *
 *
 * @example
 *
 * conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater.updateItemWithDraft(
 *      messageItem, messageDraft
 * );
 *
 * @singleton
 */
Ext.define("conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater", {


    singleton: true,

    requires: [
        "conjoon.cn_mail.model.mail.message.MessageItem",
        "conjoon.cn_mail.model.mail.message.MessageDraft"
    ],


    /**
     * Updates the fields in the target messageItem with data found in the fields
     * of the source MessageDraft.
     * This method will also commit the target record.
     *
     * The following fields are updated:
     *  - date
     *  - to
     *  - subject
     *  - hasAttachments
     *  - previewText
     *  - size
     *  - seen
     *  - answered
     *  - recent
     *  - flagged
     *  - draft
     *  - mailAccountId
     *  - id
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageItem}  messageItem
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @return {conjoon.cn_mail.model.mail.message.MessageItem}
     *
     * @throws if messageDraft is not an instance of {conjoon.cn_mail.model.mail.message.MessageDraft},
     * or if if messageItem is not an instance of {conjoon.cn_mail.model.mail.message.MessageItem}
     */
    updateItemWithDraft: function (messageItem, messageDraft) {

        var me = this, size = 0, attachments, messageBody;

        if (!(messageItem instanceof conjoon.cn_mail.model.mail.message.MessageItem)) {
            Ext.raise({
                msg: "messageItem must be an instance of 'conjoon.cn_mail.model.mail.message.MessageItem'",
                cls: Ext.getClassName(me),
                messageItem: messageItem
            });
        }

        if (!(messageDraft instanceof conjoon.cn_mail.model.mail.message.MessageDraft)) {
            Ext.raise({
                msg: "messageDraft must be an instance of 'conjoon.cn_mail.model.mail.message.MessageDraft'",
                cls: Ext.getClassName(me),
                messageDraft: messageDraft
            });
        }

        attachments = messageDraft.attachments().getRange();
        messageBody = messageDraft.getMessageBody();

        size += messageBody.get("textPlain").length;
        size += messageBody.get("textHtml").length;

        for (var i = 0, len = attachments.length; i < len; i++) {
            size += attachments[i].get("size");
        }

        // from/to fields are COPYING the values so we do not
        // need to take care of cloning them
        let copiedData = {
            date: messageDraft.get("date"),
            to: messageDraft.get("to"),
            subject: messageDraft.get("subject"),
            hasAttachments: attachments.length > 0,
            previewText: messageBody.get("textPlain"),
            size: size,
            from: messageDraft.get("from"),
            seen: messageDraft.get("seen"),
            flagged: messageDraft.get("flagged"),
            recent: messageDraft.get("recent"),
            answered: messageDraft.get("answered"),
            draft: messageDraft.get("draft"),
            // most likely changed if dealing with IMAP
            // standards
            id: messageDraft.get("id"),
            messageBodyId: messageDraft.get("messageBodyId")
        };

        messageItem.set(copiedData);
        messageItem.commit();

        return messageItem;
    },


    /**
     * Creates a new MessageItem based on the draft data.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @return {conjoon.cn_mail.model.mail.message.MessageItem}
     *
     * @throws if messageDraft is not an instance of {conjoon.cn_mail.model.mail.message.MessageDraft}
     *
     * @see updateItemWithDraft
     */
    createItemFromDraft: function (messageDraft) {

        const me = this;

        if (!(messageDraft instanceof conjoon.cn_mail.model.mail.message.MessageDraft)) {
            Ext.raise({
                msg: "messageDraft must be an instance of 'conjoon.cn_mail.model.mail.message.MessageDraft'",
                cls: Ext.getClassName(me),
                messageDraft: messageDraft
            });
        }

        let messageItem = Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
            localId: messageDraft.getId(),
            id: messageDraft.get("id"),
            mailAccountId: messageDraft.get("mailAccountId"),
            mailFolderId: messageDraft.get("mailFolderId"),
            messageBodyId: messageDraft.getMessageBody().getId()
        });

        return me.updateItemWithDraft(messageItem, messageDraft);

    }

});