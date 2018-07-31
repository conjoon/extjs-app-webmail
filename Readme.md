# app-cn_mail  [![Build Status](https://travis-ci.org/conjoon/app-cn_mail.svg?branch=master)](https://travis-ci.org/conjoon/app-cn_mail)


##### Global Events
Global events fired by this Package are:
 * *```cn_mail-beforemessageitemdelete```* - gets fired before a MessageItem should
 be deleted. The following event-information is available as arguments:
 ```messageItem``` The ```conjoon.cn_mail.model.mail.message.MessageItem``` that
 is about to get deleted. This event is cancelable. Return ```false``` in any listener
 to prevent the deleting of the specified MessageItem. 