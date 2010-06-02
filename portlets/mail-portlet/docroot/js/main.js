AUI().add(
	'liferay-plugin-mail',
	function(A) {
		Liferay.Mail = {
			init: function(params) {
				var instance = this;

				instance.namespace = params.namespace;

				instance.accountId = params.initialAccountId;
				instance.folderId = params.initialFolderId;

				instance.accountsContainer = A.one('#accountsContainer');
				instance.composeContainer = A.one('#composeContainer');
				instance.controlContainer = A.one('#controlContainer');
				instance.contentContainer = A.one('#contentContainer');
				instance.foldersContainer = A.one('#foldersContainer');
				instance.mailContainer = A.one('#mailContainer');
				instance.manageFoldersContainer = A.one('#manageFoldersContainer');
				instance.messageContainer = A.one('#messageContainer');
				instance.messagesContainer = A.one('#messagesContainer');

				instance._assignEvents();

				if (instance.accountId == 0) {
					return;
				}

				instance.loadFolders(instance.accountId);
				instance.loadMessages(instance.folderId, 1, instance.orderByField, instance.orderByType, instance.keywords);
			},

			addAccount: function () {
				new A.Dialog(
					{
						centered: true,
						cssClass: 'mail-dialog',
						destroyOnClose: true,
						modal: true,
						title: Liferay.Language.get('add-account'),
						width: 600
					}
				).plug(
					A.Plugin.IO,
					{
						uri: themeDisplay.getLayoutURL() + '/-/mail/add_account'
					}
				).render();
			},

			deleteMessages: function(messageIds) {
				var instance = this;

				instance.setStatus('info', Liferay.Language.get('deleting-messages'));

				A.io.request(
					themeDisplay.getLayoutURL() + '/-/mail/delete_messages',
					{
						data: {messageIds: messageIds},
						dataType: 'json',
						method: 'POST',
						on: {
							failure: function (event, id, obj) {
								instance.setStatus('error', Liferay.Language.get('unable-to-connect-with-mail-server'));
							},
							success: function (event, id, obj) {
								var results = this.get('responseData');

								instance.setStatus(results.status, results.message);

								if (results.status == 'success') {
									instance.loadMessages(instance.folderId, instance.pageNumber, instance.orderByField, instance.orderByType, instance.keywords);
								}
							}
						}
					}
				);
			},

			loadAccounts: function(accountId) {
				var instance = this;

				instance.accountsContainer.io.set('data', {accountId: accountId});

				instance.accountsContainer.io.start();
			},

			loadAccount: function(accountId, inboxFolderId) {
				var instance = this;

				instance._displayContainer(instance.messagesContainer);

				A.io.request(
					themeDisplay.getLayoutURL() + '/-/mail/password_saved',
					{
						data: {
							accountId: accountId,
							inboxFolderId: inboxFolderId
						},
						method: 'POST',
						on: {
							failure: function (event, id, obj) {
								instance.setStatus('error', Liferay.Language.get('unable-to-connect-with-mail-server'));
							},
							success: function (event, id, obj) {
								var results = this.get('responseData');

								if (results == 'true') {
									instance.loadFolders(accountId);
									instance.loadMessages(inboxFolderId, 1, 'sentDate', 'desc', '');
								}
								else {
									instance.promptForPassword(accountId, inboxFolderId);
								}
							}
						}
					}
				);
			},

			loadFolders: function(accountId) {
				var instance = this;

				instance.foldersContainer.io.set('data', {accountId: accountId});

				instance.foldersContainer.io.start();
			},

			loadMessage: function(folderId, messageNumber, orderByField, orderByType, keywords) {
				var instance = this;

				instance.folderId = folderId;
				instance.orderByField = orderByField;
				instance.orderByType = orderByType;
				instance.keywords = keywords;

				instance._displayContainer(instance.messageContainer);

				instance.messageContainer.io.set(
					'data',
					{
						folderId: folderId,
						messageNumber: messageNumber,
						orderByField: orderByField,
						orderByType: orderByType,
						keywords: keywords
					}
				);

				instance.messageContainer.io.start();
			},

			loadMessages: function(folderId, pageNumber, orderByField, orderByType, keywords) {
				var instance = this;

				instance.folderId = folderId;
				instance.pageNumber = pageNumber;
				instance.orderByField = orderByField;
				instance.orderByType = orderByType;
				instance.keywords = keywords;

				instance._displayContainer(instance.messagesContainer);

				instance.messagesContainer.io.set(
					'data',
					{
						folderId: folderId,
						pageNumber: pageNumber,
						orderByField: orderByField,
						orderByType: orderByType,
						keywords: keywords
					}
				);

				instance.messagesContainer.io.start();
			},

			setStatus: function(type, message) {
				var messageType = 'portlet-msg-error';

				if (type == 'success') {
					messageType = 'portlet-msg-success';
				}
				else if (type == 'info') {
					messageType = 'portlet-msg-info';
				}

				A.all('.mail-status').html('<table style="margin: 0 auto;"><tr><td>&nbsp;</td><td><span class="message ' + messageType + '">' + message + '</span></td><td>&nbsp;</td></tr></table>');
			},

			_assignEvents: function() {
				var instance = this;

				instance.accountsContainer.plug(
					A.Plugin.IO,
					{
						autoLoad: true,
						data: {accountId: instance.accountId},
						method: 'POST',
						showLoading: false,
						uri: themeDisplay.getLayoutURL() + '/-/mail/view_accounts'
					}
				);

				instance.foldersContainer.plug(
					A.Plugin.IO,
					{
						autoLoad: false,
						method: 'POST',
						uri: themeDisplay.getLayoutURL() + '/-/mail/view_folders'
					}
				);

				instance.messageContainer.plug(
					A.Plugin.IO,
					{
						autoLoad: false,
						method: 'POST',
						uri: themeDisplay.getLayoutURL() + '/-/mail/view_message'
					}
				);

				instance.messagesContainer.plug(
					A.Plugin.IO,
					{
						autoLoad: false,
						method: 'POST',
						uri: themeDisplay.getLayoutURL() + '/-/mail/view_messages'
					}
				);

				instance.accountsContainer.delegate(
					'click',
					function(event) {
						var link = event.currentTarget;

						var accountId = link.getAttribute('data-accountId');
						var inboxFolderId = link.getAttribute('data-inboxFolderId');

						instance.loadAccounts(accountId);
						instance.loadAccount(accountId, inboxFolderId);
					},
					'.folders-link'
				);

				instance.contentContainer.delegate(
					'click',
					function(event) {
						var link = event.currentTarget;

						var folderId = link.getAttribute('data-folderId');
						var messageNumber = link.getAttribute('data-messageNumber');
						var orderByField = link.getAttribute('data-orderByField');
						var orderByType = link.getAttribute('data-orderByType');
						var keywords = link.getAttribute('data-keywords');

						instance.loadMessage(folderId, messageNumber, orderByField, orderByType, keywords);
					},
					'.message-link'
				);

				instance.mailContainer.delegate(
					'click',
					function(event) {
						var link = event.currentTarget;

						var folderId = link.getAttribute('data-folderId');
						var pageNumber = link.getAttribute('data-pageNumber');
						var orderByField = link.getAttribute('data-orderByField');
						var orderByType = link.getAttribute('data-orderByType');
						var keywords = link.getAttribute('data-keywords');

						instance.loadMessages(folderId, pageNumber, orderByField, orderByType, keywords);
					},
					'.messages-link'
				);

				instance.messageContainer.delegate(
					'click',
					function(event) {
						var button = event.currentTarget.one('input[type="button"]');

						var messageId = button.getAttribute('data-messageId');

						instance.deleteMessages([messageId]);
					},
					'.delete-message'
				);

				instance.messagesContainer.delegate(
					'click',
					function(event) {
						var messageIds = instance._getSelectedMessageIds();

						instance.deleteMessages(messageIds);
					},
					'.delete-messages'
				);

				instance.messagesContainer.delegate(
					'click',
					function(event) {
						instance.messagesContainer.all('input[type=checkbox]').each(
							function(item, index, collection) {
								item.set('checked', true);
							}
						);
					},
					'.select-all'
				);

				instance.messagesContainer.delegate(
					'click',
					function(event) {
						instance.messagesContainer.all('input[type=checkbox]').each(
							function(item, index, collection) {
								item.set('checked', false);
							}
						);
					},
					'.select-none'
				);
			},

			_displayContainer: function(container) {
				var instance = this;

				instance.composeContainer.hide();
				instance.manageFoldersContainer.hide();
				instance.messagesContainer.hide();
				instance.messageContainer.hide();

				container.show();
			},

			_getSelectedMessageIds: function() {
				var instance = this;

				var messageIds = [];

				instance.messagesContainer.all('input[type=checkbox]').each(
					function(item, index, collection) {
						var messageId = item.getAttribute('messageId');

						if (messageId && item.get('checked')) {
							messageIds.push(messageId);
						}
					}
				);

				return messageIds;
			},

			accountId: null,
			folderId: null,
			keywords: '',
			orderByField: 'sentDate',
			orderByType: 'desc',
			pageNumber: 1
		};
	},
	'',
	{
		requires: ['aui-base', 'aui-dialog', 'aui-io']
	}
);