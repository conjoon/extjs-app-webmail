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
        'conjoon.cn_core.Util'
    ],

    statics : {
        /**
         * @type {String} MODE_EDIT
         */
        MODE_EDIT : 'EDIT',

        /**
         * @type {String} MODE_CREATE
         */
        MODE_CREATE : 'CREATE',

        /**
         * @type {String} MODE_REPLY_TO
         */
        MODE_REPLY_TO  : 'REPLY_TO',

        /**
         * @type {String} MODE_REPLY_ALL
         */
        MODE_REPLY_ALL : 'REPLY_ALL',

        /**
         * @type {String} MODE_FORWARD
         */
        MODE_FORWARD   : 'FORWARD'
    },

    alias : 'viewmodel.cn_mail-mailmessageeditorviewmodel',

    /**
     * Default empty subject text for messages.
     * @i18n
     * @private
     */
    emptySubjectText : '(No subject)',

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
         * Returns true if the "loading" property of the messageDraft's MessageBody
         * is true, otherwise false.
         */
        isMessageBodyLoading : function(get) {
            var mb = get('messageDraft.messageBody');

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
     * If no MessageDraft was specified via the config for this constructor,
     * an initial, empty MessageDraft will be generated.
     *
     * @see #createAddressFormulas
     */
    constructor : function(config) {

        config = config || {};

        var me      = this,
            statics = me.statics(),
            modes   = [
                statics.MODE_REPLY_TO,
                statics.MODE_REPLY_ALL,
                statics.MODE_FORWARD
            ],
            messageBody,
            messageDraft,
            editMode;

        // create address formulas and apply the to the instances formulas
        me.config.formulas = Ext.apply(
            me.config.formulas || {},
            me.createAddressFormulas()
        );

        // Read out editMode. this is an object in the form of
        // { type : [ANY OF THIS CLASS STATICS MODE_* VALUES],
        //   id   : [THE ID OF THE MESSAGE TO LOAD] }
        editMode = conjoon.cn_core.Util.unchain('editMode.type', config);
        if (editMode && modes.indexOf(editMode) !== -1) {
            me.callParent([config]);
            me.loadMessageDraftCopy(config.editMode.id);
            return;
        } else {
            messageBody = conjoon.cn_core.Util.unchain(
                'links.messageDraft.create.messageBody', config
            );

            // intentionally remove reference, see below
            if (messageBody) {
                delete config.links.messageDraft.create.messageBody;
            }

            if (!conjoon.cn_core.Util.unchain('links.messageDraft', config)) {
                Ext.apply(config, {
                    links : {
                        messageDraft : {
                            type    : 'MessageDraft',
                            create  : true
                        }
                    }
                });
            }

            me.callParent([config]);

            /**
             * @bug
             * @extjs 6.2.0 GPL
             * @see https://www.sencha.com/forum/showthread.php?332062-Form-field-not-updated-with-bind-of-association-which-is-empty
             */
            // if the messageDraft has no id, we assume the messageBody does not exist.
            // we initialize it by hand here, considering above mentioned bug in 6.2.
            // The messageBody might be initialized with some values as specified
            // in the constructor's config-argument
            if (!conjoon.cn_core.Util.unchain('links.messageDraft.id', config)) {
                me.set('messageDraft.messageBody',
                    me.getSession().createRecord('MessageBody', messageBody || {})
                );
            }
        }
    },


    /**
     * Loads a copy of the MessageDraft with the specified id and applies a copy
     * of its data to this vm, so it can be saved with a new id.
     *
     * @param {String} id
     *
     * @private
     */
    loadMessageDraftCopy : function(id) {
        var me = this;

        conjoon.cn_mail.model.mail.message.MessageDraft.load(id, {
            success : me.onMessageDraftLoad,
            scope   : me
        });
    },


    privates : {

        /**
         * Callback for a successfull load operation of a MessageDraft requested
         * via loadMessageDraftCopy. Will trigger loading the Atatchments and
         * the MessageBody for this vm's editor.
         *
         * @param {conjoon.cn_mail.model.mail.message.MessageDraft} record
         */
        onMessageDraftLoad : function(record) {

            var me    = this,
                draft = record.copy(null);

            me.linkTo('messageDraft', {
                type   : 'MessageDraft',
                create : {
                    subject : draft.get('subject'),
                    to      : [draft.get('from')]
                }
            });

            record.getMessageBody({
                success : me.onMessageBodyLoad,
                scope   : me
            });

            record.attachments().load({
                callback : me.onAttachmentsLoad,
                scope    : me
            });
        },


        /**
         * Callback for a successfull load operation of a MessageBody requested
         * via loadMessageDraftCopy.
         *
         * @param {conjoon.cn_mail.model.mail.message.MessageBody} record
         */
        onMessageBodyLoad : function(record) {

            var me          = this,
                messageBody = record.copy(null);

            me.set(
                'messageDraft.messageBody',
                me.getSession().createRecord('MessageBody', {textHtml : messageBody.get('textHtml')})
            );
        },


        /**
         * Callback for a successfull load operation of a Attachmnets requested
         * via loadMessageDraftCopy.
         *
         * @param {conjoon.cn_mail.model.mail.message.SraftAttachment} record
         */
        onAttachmentsLoad : function(records, operation, success) {

            var me = this;

            if (success) {
                for (var i = 0, len = records.length; i < len; i++) {
                    me.get('messageDraft').attachments().add(records[i].copy(null));
                }
            }

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