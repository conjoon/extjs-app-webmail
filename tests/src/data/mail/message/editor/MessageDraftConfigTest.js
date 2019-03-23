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

describe('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfigTest', function(t) {


    t.it("constructor()", function(t) {
        var config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
        });
        t.expect(config.getTo()).toBeUndefined();
        t.expect(config.getCc()).toBeUndefined();
        t.expect(config.getBcc()).toBeUndefined();
        t.expect(config.getSubject()).toBeUndefined();
        t.expect(config.getTextPlain()).toBeUndefined();
        t.expect(config.getTextHtml()).toBeUndefined();
        t.expect(config.getAttachments()).toBeUndefined();
        t.expect(config.getMailFolderId()).toBeUndefined();
        t.expect(config.getMailAccountId()).toBeUndefined();

        t.expect(config.getSeen()).toBe(true);
        t.expect(config.getRecent()).toBe(false);
        t.expect(config.getAnswered()).toBe(false);
        t.expect(config.getFlagged()).toBe(false);
        t.expect(config.getDraft()).toBe(true);
    });


    t.it("applyAddressFactory()", function(t) {
        var config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
        });

        var tests = [{
            args     : [[{name : 'Peter', address : 'name@domain.tld'}], 'to'],
            expected : [{
                name    : 'Peter',
                address : 'name@domain.tld'
            }]
        }, {
            args     : ['name@domain.tld', 'to'],
            expected : [{
                name    : 'name@domain.tld',
                address : 'name@domain.tld'
            }]
        }, {
            args     : [['name@domain.tld'], 'cc'],
            expected : [{
                name    : 'name@domain.tld',
                address : 'name@domain.tld'
            }]
        }, {
            args     : [['name@domain.tld', 'somename@somedomain.tld'], 'bcc'],
            expected : [{
                name    : 'name@domain.tld',
                address : 'name@domain.tld'
            }, {
                name    : 'somename@somedomain.tld',
                address : 'somename@somedomain.tld'
            }]
        }, {
            args     : ['name@domain.tld', 'to'],
            expected : 'Exception'
        }, {
            args     : ['name@domain.tld', 'cc'],
            expected : 'Exception'
        }, {
            args     : ['name@domain.tld', 'bcc'],
            expected : 'Exception'
        }], test, exc, e, tCount = 0;

        for (var i = 0, len = tests.length; i < len; i++) {
            test = tests[i];
            if (test.expected == 'Exception') {
                continue;
            }
            t.expect(
                config.applyAddressFactory.apply(config, test.args)
            ).toEqual(
                test.expected
            );
            tCount++;
        }

        t.expect(tCount).toBe(4);

        config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
            to  : 'name.to@domain.tld',
            cc  : 'name.cc@domain.tld',
            bcc : 'name.bcc@domain.tld'
        });

        var excCount = 0;
        for (var i = 0, len = tests.length; i < len; i++) {
            test = tests[i];
            exc = e = undefined;
            if (test.expected == 'Exception') {
                try{
                    config.applyAddressFactory.apply(config, test.args);
                } catch(e){
                    exc = e;
                }
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toContain("is immutable");
                excCount++;
            }
        }

        t.expect(excCount).toBe(3);

    });

    t.it("applyTo()", function(t) {
        var config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
        });
        t.isCalledOnce('applyAddressFactory', config);
        t.isArray(config.applyTo('name@domain.tld'));
    });


    t.it("applyCc()", function(t) {
        var config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
        });
        t.isCalledOnce('applyAddressFactory', config)
        t.isArray(config.applyCc('name@domain.tld'));
    });


    t.it("applyBcc()", function(t) {
        var config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
        });
        t.isCalledOnce('applyAddressFactory', config)
        t.isArray(config.applyBcc('name@domain.tld'));
    });



    t.it("applyAttachments()", function(t) {
        var config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
        });

        var attachments = [{
            type           : 'TYPE1',
            text           : 'TEXT1',
            size           : 1111,
            sourceId       : '51',
            previewImgSrc  : 'PREVIEWIMGSRC1',
            downloadImgUrl : 'DOWNLOADIMGURL1'
        }, {
            type           : 'TYPE12',
            text           : 'TEXT2',
            size           : 1112,
            sourceId       : '52',
            previewImgSrc  : 'PREVIEWIMGSRC2',
            downloadImgUrl : 'DOWNLOADIMGURL2'
        }];

        var result    = config.applyAttachments(attachments),
            propCount = 0;

        t.isArray(result);
        t.expect(result.length).toBe(2);

        // test properties
        for (var i = 0, len = result.length; i < len; i++) {
            propCount = 0;
            for (var prop in result[i]) {
                if (!result[i].hasOwnProperty(prop)) {
                    continue;
                }
                t.expect(result[i][prop]).toBe(attachments[i][prop]);
                propCount++;
            }
            t.expect(propCount).toBe(6);
        }

        // test references
        t.expect(result[0]['text']).toBe(attachments[0]['text']);
        attachments[0]['text'] = "NEWTEXT";
        t.expect(result[0]['text']).not.toBe(attachments[0]['text']);

        // test exceptions
        var exc, e;
        config.setAttachments([]);
        try{config.applyAttachments([]);}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("is immutable");

        exc = e = undefined;
        var config2 = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
        });
        try{config2.applyAttachments('foo');}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("must be an array");
    });


    t.it("toObject()", function(t) {

        var config,
            tests = [{
                args : {
                    to  : 'name.to@domain.tld',
                    cc  : 'name.cc@domain.tld',
                    bcc : 'name.bcc@domain.tld'
                },
                expected : {
                    to  : [{name : 'name.to@domain.tld',  address : 'name.to@domain.tld'}],
                    cc  : [{name : 'name.cc@domain.tld',  address : 'name.cc@domain.tld'}],
                    bcc : [{name : 'name.bcc@domain.tld', address : 'name.bcc@domain.tld'}],
                    seen : true, recent : false, flagged : false, draft : true, answered : false
                }
            }, {
                args : {
                    mailFolderId  : 'foo',
                    mailAccountId : 'bar'
                },
                expected : {
                    mailFolderId  : 'foo',
                    mailAccountId : 'bar',
                    seen : true, recent : false, flagged : false, draft : true, answered : false
                }
            }, {
                args : {
                    textHtml  : 'foo',
                    textPlain : 'bar'
                },
                expected : {
                    messageBody : {
                        textHtml  : 'foo',
                        textPlain : 'bar'
                    },
                    seen : true, recent : false, flagged : false, draft : true, answered : false
                }
            }, {
                args : {
                    seen : true
                },
                expected : {
                    seen : true, recent : false, flagged : false, draft : true, answered : false
                }
            }, {
                args : {
                    flagged : true
                },
                expected : {
                    seen : true, recent : false, flagged : true, draft : true, answered : false
                }
            }, {
                args : {
                    recent : true
                },
                expected : {
                    seen : true, recent : true, flagged : false, draft : true, answered : false
                }
            }, {
                args : {
                    answered : true
                },
                expected : {
                    seen : true, recent : false, flagged : false, draft : true, answered : true
                }
            }, {
                args : {
                    draft : true
                },
                expected : {
                    seen : true, recent : false, flagged : false, draft : true, answered : false
                }
            }, {
                args : {
                    subject : 'foobar'
                },
                expected : {
                    subject  : 'foobar',
                    seen : true, recent : false, flagged : false, draft : true, answered : false
                }
            }, {
                args : {
                    attachments : [{
                        type           : 'TYPE1',
                        text           : 'TEXT1',
                        size           : 1111,
                        sourceId       : '51',
                        previewImgSrc  : 'PREVIEWIMGSRC1',
                        downloadImgUrl : 'DOWNLOADIMGURL1'
                    }, {
                        type           : 'TYPE12',
                        text           : 'TEXT2',
                        size           : 1112,
                        sourceId       : '52',
                        previewImgSrc  : 'PREVIEWIMGSRC2',
                        downloadImgUrl : 'DOWNLOADIMGURL2'
                    }]
                },
                expected : {
                    attachments : [{
                        type           : 'TYPE1',
                        text           : 'TEXT1',
                        size           : 1111,
                        sourceId       : '51',
                        previewImgSrc  : 'PREVIEWIMGSRC1',
                        downloadImgUrl : 'DOWNLOADIMGURL1'
                    }, {
                        type           : 'TYPE12',
                        text           : 'TEXT2',
                        size           : 1112,
                        sourceId       : '52',
                        previewImgSrc  : 'PREVIEWIMGSRC2',
                        downloadImgUrl : 'DOWNLOADIMGURL2'
                    }],
                    seen : true, recent : false, flagged : false, draft : true, answered : false
                }
            }], test;

        for (var i = 0, len = tests.length; i < len; i++) {
            test = tests[i];
            config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig',
                test.args
            );
            t.expect(config.toObject()).toEqual(test.expected);
        }
    });


    t.it("app-cn_mail#84", function(t) {

        t.it("applyTo()", function(t) {
            var config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
            });

            t.expect(config.applyTo([""])).toEqual([]);
        });

    });


    t.it("app-cn_mail#47 - references, inReplyTo, xCnDraftInfo", function(t) {



            var config,
                tests = [{
                    args : {
                        references  : 'foo',
                        inReplyTo : 'bar',
                        xCnDraftInfo : 'meh.'
                    },
                    expected : {
                        references  : 'foo',
                        inReplyTo : 'bar',
                        xCnDraftInfo : 'meh.',
                        seen : true, recent : false, flagged : false, draft : true, answered : false
                    }
                }], test;

            for (var i = 0, len = tests.length; i < len; i++) {
                test = tests[i];
                config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig',
                    test.args
                );
                t.expect(config.toObject()).toEqual(test.expected);
            }


    });

});
