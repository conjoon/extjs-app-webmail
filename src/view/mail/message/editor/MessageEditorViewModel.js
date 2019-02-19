/**
 * conjoon
 * (c) 2007-2019 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg/conjoon.org
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
 * The default ViewModel for {@link conjoon.cn_mail.view.mail.message.editor.MessageEditor}.
 * This default implementation is configured to be used with
 * {@link conjoon.cn_mail.view.mail.message.editor.MessageEditor}.
 *
 * The formulas getTo, getCc and getBcc are auto generated and returned from the
 * method getAddressFormulas() which gets called from the constructor.
 *
 */
Ext.define('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {

    extend : 'Ext.app.ViewModel',

    requires : [
        'conjoon.cn_mail.model.mail.message.MessageDraft',
        'conjoon.cn_mail.model.mail.message.MessageBody',
        'conjoon.cn_mail.model.mail.message.EmailAddress',
        'conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig',
        'conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest',
        'conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier',
        'coon.core.Util',
        'conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey',
        'conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor',
        'coon.core.data.Session'
    ],

    alias : 'viewmodel.cn_mail-mailmessageeditorviewmodel',

    /**
     * @private
     */
    loadingDraft : null,

    /**
     * Set to true once a draft/body could not be loaded.
     * @protected
     */
    loadingFailed : false,

    /**
     * Default empty subject text for messages.
     * @i18n
     * @private
     */
    emptySubjectText : '(No subject)',

    /**
     * @type {conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier}
     * @private
     */
    messageDraftCopier : null,

    /**
     * Will store the CopyRequest this ViewModel was configured with, if CopyRequest.isConfigured()
     * return false, so it can be loaded later on.
     * @type {conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest}
     * @private
     */
    pendingCopyRequest : null,

    data : {
        /**
         * Set to true to indicate that the view is busy saving a message.
         */
        isSaving : false,

        /**
         * Set to true to indicate that the view is busy sending a message.
         */
        isSending : false,

        /**
         * The view will set this to false if the user does not wish to specify
         * a subject, even if a prompt requested one.
         */
        isSubjectRequired : true
    },

    formulas : {

        /**
         * Returns true if the MessageDraft is still marked as phantom and the
         * savedAt-value has never been set (due to the way the MVVM accesses
         * the data we have to use this condition).
         */
        isPhantom : function(get) {
            return get('messageDraft').phantom && !get('messageDraft.savedAt');
        },

        /**
         * Returns true if both mailAccountId and mailFolderId are set fot the
         * messageDraft.
         */
        isAccountAndFolderSet : function(get) {
            var ma = get('messageDraft.mailAccountId'),
                mf = get('messageDraft.mailFolderId');

            return !!(ma && mf);

        },

        /**
         * Returns true if the "loading" property of the messageDraft's MessageBody
         * is true, otherwise false.
         */
        isMessageBodyLoading : function(get) {
            var mb = get('messageDraft.messageBody');

            /**
             * @todo this should probably better be changed to Ext.data.Model#isLoading
             */
            return mb && mb.loading !== undefined
                   ? mb.loading
                   : false;

        },

        /**
         * Formula returns true or false based on the value of the MessageDraft's
         * cc- and bcc-fields.
         *
         * @return {Boolean} true if either cc or bcc is set, otherwise false.
         */
        isCcOrBccValueSet : {
            bind : {
                cc   : '{messageDraft.cc}',
                bcc  : '{messageDraft.bcc}'
            },

            get : function(data) {
                return !!(data.cc && data.cc.length) ||
                       !!(data.bcc && data.bcc.length);
            }
        },

        /**
         * This formula is configured as a single formula and returns the initial
         * set of data found in this MessageDraft's to, cc, and bcc fields in one
         * array, and should be used to fill the local data of the
         * #stores addressStore.
         *
         * @return {Array} The array filled with all inital entries of this
         * MessageDraft's to, cc, and bcc fields.
         *
         */
        addressStoreData : {
            single : true,
            bind : {
                to  : '{messageDraft.to}',
                cc  : '{messageDraft.cc}',
                bcc : '{messageDraft.bcc}'
            },
            get : function(data) {
                return [].concat(data.to, data.cc, data.bcc);
            }
        },


        /**
         * This formula computes the subject to display and returns #emptySubjectText
         * if the MessageDraft's subject is empty. If the value set via this formula
         * is empty, the #emptySubjectText will be used instead.
         *
         */
        getSubject : {

            bind : {
                subject : '{messageDraft.subject}'
            },

            get : function(data) {
                var m = data.subject || this.emptySubjectText;
                return m;
            },
            set : function(value) {
                this.set('messageDraft.subject', value || this.emptySubjectText);
            }
        }
    },

    stores : {

        mailAccountStore : {
            source: '{cn_mail-mailfoldertreestore}',

            filters : [{
                property : 'cn_folderType',
                value    : 'ACCOUNT'
            }]
        },

        addressStore : {
            model : 'conjoon.cn_mail.model.mail.message.EmailAddress',
            data  : '{addressStoreData}'
        }
    },


    /**
     * @inheritdoc
     *
     * This constructor will also take care of setting up the getTo, getCc and
     * getBcc formulas.
     * This constructor needs a config object that has a messageDraft-property,
     * which can be any of:
     * - conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig
     * - conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest
     * - conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey (compoundKey representing  MessageDraft to edit)
     *
     * @see #createAddressFormulas
     *
     * @throws if config or config.messageDraft is not set, and if messageDraft
     * is not an instance of conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig,
     * conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest or of type string,
     * or if the session used does not use the conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor
     */
    constructor : function(config) {

        var me = this,
            messageDraft;

        if (!config || !config.messageDraft) {
            Ext.raise({
                source : Ext.getClassName(this),
                msg    : 'arguments "config" and  "config.messageDraft" must be set.'
            });
        }

        messageDraft = config.messageDraft;
        delete config.messageDraft;

        Ext.apply(config, {
            formulas : me.createAddressFormulas()
        });

        me.callParent([config]);

        let session = me.getSession();
        if (!(session instanceof coon.core.data.Session) ||
            // we will peek at the type of the created visitor, although we know
            // this is not the *instance* used later on
            !(session.createVisitor() instanceof conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor)) {
            Ext.raise({
                msg     : "This ViewModel requires a data session configured with a MessageCompoundBatchVisitor",
                session : session
            })
        }

        let MessageEntityCompoundKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;

        switch (true) {

            case (messageDraft instanceof MessageEntityCompoundKey):

                let localId   = messageDraft.toLocalId(),
                    sessDraft = session.peekRecord('MessageDraft', localId);

                // instead of setting links property, this should have the
                // same effect. We can, however, submit additional options
                // which are considered in the request
                // note the callbacks for this record; we we only set the messageDraft
                // of the ViewModel if the record was successfully initially loaded,
                // otherwise Ext 6.2.0 tries to load associations automatically
                // which shouldnt happen since the initial Entity was not successfully
                // loaded @see conjoon/app-cn_mail#64
                if (!sessDraft) {
                    let options = {
                        params  : messageDraft.toObject(),
                        scope   : me,
                        success : function(record) {
                            const me = this,
                                  view = me.getView();

                            me.getSession().adopt(record);
                            me.set('messageDraft', record);
                            me.notify();
                            me.loadingDraft = null;
                            view.fireEvent('cn_mail-messagedraftload', view, record);
                        },
                        failure : me.processMessageDraftLoadFailure,
                        scope : me
                    };
                    me.loadingDraft = conjoon.cn_mail.model.mail.message.MessageDraft.loadEntity(messageDraft, options);
                } else {
                    me.set('messageDraft', sessDraft);
                }

                return;

            case (messageDraft instanceof conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig):
                // MessageDraft is MessageDraftConfig
                me.createDraftFromData(messageDraft);
                return;

            case (messageDraft instanceof conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest):
                // MessageDraft is MessageDraftCopyRequest
                me.messageDraftCopier = Ext.create(
                    'conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier');

                if (messageDraft.isConfigured()) {
                    me.pendingCopyRequest = messageDraft;
                    me.processPendingCopyRequest();
                } else {
                    me.pendingCopyRequest = messageDraft;
                }
                return;

        }

        // exception
        Ext.raise({
            messageDraft : messageDraft,
            msg          : "\"messageDraft\" must either be an instance of " +
                           "MessageDraftConfig, of MessageDraftCopyRequest or of " +
                           "MessageEntityCompoundKey."
        });
    },


    /**
     * Processes a failed attempt load a MessageDraft, or to copy one.
     *
     * @param {conjoon.cn_mail.moder.mail.message.MessageDraft} draftRecord might
     * be null if this callback was called from a failed attempt to copy a message
     * @param {Ext.data.operation.Read} operation
     *
     * @return {coon.comp.component.MessageMask} the message mask or null
     * if the view was not advised to build the mask due to cancelled requests
     *
     * @see {conjoon.cn_mail.view.mail.message.editor.MessageEditor#showLoadingFailedDialog}
     */
    processMessageDraftLoadFailure : function(draftRecord, operation) {

        const me = this;

        me.loadingFailed = true;
        me.loadingDraft = null;

        // ignore cancelled requests and do not advise the view to continue
        if (operation.error && operation.error.status === -1) {
            return null;
        }

        return me.getView().showLoadingFailedDialog();

    },


    /**
     * Returns true if there is a pending CopyRequest for this ViewModel existing.
     *
     * @returns {Boolean}
     */
    hasPendingCopyRequest : function() {
        const me = this;

        return !!me.pendingCopyRequest;
    },


    /**
     * Processes any pending copy request that was set for this ViewModel by
     * using it for a call of loadMessageDraftCopy of the copier.
     * The method can be called without arguments, and will then assume the
     * pendingCopyRequest of this ViewModel is configured. If mailAccountId and
     * mailFolderId are specified, those will be applied to this instance's
     * pendingCopyRequest
     *
     * @param {String} mailAccountId
     * @param {String} mailFolderId
     *
     * @return conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest
     * the copyRequest that is being processed
     *
     * @throws if there is no pendingCopyRequest for this class available,
     * or if the copyRequest is not configured.
     *
     * @private
     *
     */
    processPendingCopyRequest : function(mailAccountId, mailFolderId) {

        const me = this;

        let request = me.pendingCopyRequest;

        if (!request) {
            Ext.raise({
                msg  : "\"pendingCopyRequest\" is not available."
            });
        }

        if (!request.isConfigured()) {
            if (!mailAccountId || !mailFolderId) {
                Ext.raise({
                    msg  : "\"pendingCopyRequest\" is not properly configured, and arguments are missing.",
                    args : arguments,
                    pendingCopyRequest : request
                });
            }

            request.setDefaultMailAccountId(mailAccountId);
            request.setDefaultMailFolderId(mailFolderId);
        }

        me.messageDraftCopier.loadMessageDraftCopy(
            request, me.onMessageDraftCopyLoad, me
        );

        me.pendingCopyRequest = null;
    },


    /**
     * @inheritdoc
     */
    destroy : function() {

        var me = this;

        if (me.messageDraftCopier) {
            me.messageDraftCopier.destroy();
            me.messageDraftCopier = null;
        }

        me.callParent(arguments);
    },


    privates : {

        /**
         * Callback for the cn_mail-mailmessagecopyload of the MessageDraftCopier.
         * Creates a link for this viewmodel to the copied MessageDraft data.
         *
         * @param {conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier} draftCopier
         * @param {conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig} messageDraftConfig
         * @param {Boolean} success whether the process was successfull
         * @param {Ext.data.operation.Read} the operation that lead to this callback
         *
         * @see createDraftFromData
         */
        onMessageDraftCopyLoad : function(draftCopier, messageDraftConfig, success, operation) {
            var me = this,
                view = me.getView();

            if (success === false) {
                return me.processMessageDraftLoadFailure(null, operation);
            }

            me.createDraftFromData(messageDraftConfig);
            me.notify();
            view.fireEvent('cn_mail-messagedraftload', view, me.get('messageDraft'));
        },


        /**
         * Creates a MessageDraft link for this ViewModel from the specified
         * MessageDraftConfig.
         *
         * @param {conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig} messageDraftConfig
         *
         * @private
         *
         * @throws if messageDraftConfig is not of type
         * conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig
         */
        createDraftFromData : function(messageDraftConfig) {

            var me = this,
                messageBody,
                attachments,
                data;

            if (!(messageDraftConfig instanceof conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig)) {
                Ext.raise({
                    messageDraftConfig : messageDraftConfig,
                    msg                : "\"messageDraftConfig\" must be an instance of conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig"
                })
            }

            data = messageDraftConfig.toObject();

            messageBody = data.messageBody;
            attachments = data.attachments;

            // intentionally remove reference, see below
            delete data.messageBody;
            delete data.attachments;


            me.linkTo('messageDraft', {
                type   : 'MessageDraft',
                create : data
            });

            /**
             * @bug
             * @extjs 6.2.0 GPL
             * @see https://www.sencha.com/forum/showthread.php?332062-Form-field-not-updated-with-bind-of-association-which-is-empty
             */
            // if the messageDraft has no id, we assume the messageBody does not exist.
            // we initialize it by hand here, considering above mentioned bug in 6.2.
            // The messageBody might be initialized with some values as specified
            // in the constructor's config-argument
            me.set(
                'messageDraft.messageBody',
                me.getSession().createRecord('MessageBody', messageBody || {})
            );

            me.get('messageDraft').attachments().add(
                attachments || []
            );
        },


        /**
         * Returns an object keyed with getTo, getCc and getBcc which all represent formulas
         * to use with setting the values for AddressFields and vice versa the to, cc
         * and bcc fields of a bound MessageDraft model.
         *
         * @example of the returned getTo formula (getCc, getBcc accordingly):
         *
         *          getTo : {
         *
         *              bind : {
         *                  to : '{messageDraft.to}
         *              },
         *
         *              get :  this.getAddressValuesFromDraft.bind(this, 'to'),
         *
         *              set : this.setAddressesForDraft.bind(this, 'to')
         *          }
         *
         * @private
         * @returns {Object}
         *
         * @see #getAddressValuesFromDraft
         * @see #setAddressesForDraft
         */
        createAddressFormulas : function() {

            var types    = ['to', 'cc', 'bcc'],
                type     = null,
                formulas = {},
                formula  = {},
                formulaName;

            for (var i = 0, len = types.length; i < len; i++) {
                type = types[i];

                formulaName = 'get' + Ext.String.capitalize(type);

                formula = {
                    bind : {},
                    get  : this.getAddressValuesFromDraft.bind(this, type),
                    set  : this.setAddressesForDraft.bind(this, type)
                };

                formula['bind'][type] = '{messageDraft.' + type + '}';

                formulas[formulaName] = formula;
            }

            return formulas;
        },


        /**
         * Returns the 'address' properties found in all fields of the MessageDraft
         * specified by type (to, cc, bcc) in a numeric array. This method should
         * be used by the generated getTo, getCc and getBcc formulas to make sure
         * that the values of the AddressFields are properly set by inspecting
         * the MessageDraft's to, cc and bcc fields.
         *
         * @param {String} type
         * @param {Object} data
         *
         * @returns {Array}
         */
        getAddressValuesFromDraft : function(type, data) {
            var ids = [],
                addresses = data[type] || [];
            for (var i = 0, len = addresses.length; i < len; i++) {
                ids.push(addresses[i]['address']);
            }
            return ids;
        },


        /**
         * This method is called whenever the "set" method of the getTo, getCc
         * or getBcc formulas is called.
         * The method inspects the passed values by checking if the #addressStore
         * has entries with the ids (email addresses) found in values. If that is
         * the case, an object matching the data specifications of
         * {@link conjoon.cn_mail.model.mail.message.EmailAddress}
         * is then created and added to the MessageDraft's to, cc or bcc field,
         * depending on type, which can be to, cc or bcc.
         * If no entry in the addressStore was found, the EmailAddress will be
         * generated by simply using the entry found in values as the address
         * property.
         *
         * @param {String} type
         * @param {Array} values
         *
         * @returns {Array}
         */
        setAddressesForDraft : function(type, values) {

            var me     = this,
                addresses = [],
                store  = me.getStore('addressStore'),
                ind,
                rec;

            for (var i = 0, len = values.length; i < len; i++) {
                ind = store.find('address', values[i], 0, false, false, true);
                if (ind !== -1) {
                    rec = store.getAt(ind);
                    addresses.push(Ext.copy({}, rec.data, 'address,name'));
                } else {
                    addresses.push({address : values[i]});
                }
            }

            this.set('messageDraft.' + type, addresses);
            return addresses;
        }
    }

});