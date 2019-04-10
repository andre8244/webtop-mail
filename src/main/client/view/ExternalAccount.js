/*
 * webtop-contacts is a WebTop Service developed by Sonicle S.r.l.
 * Copyright (C) 2014 Sonicle S.r.l.
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License version 3 as published by
 * the Free Software Foundation with the addition of the following permission
 * added to Section 15 as permitted in Section 7(a): FOR ANY PART OF THE COVERED
 * WORK IN WHICH THE COPYRIGHT IS OWNED BY SONICLE, SONICLE DISCLAIMS THE
 * WARRANTY OF NON INFRINGEMENT OF THIRD PARTY RIGHTS.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program; if not, see http://www.gnu.org/licenses or write to
 * the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301 USA.
 *
 * You can contact Sonicle S.r.l. at email address sonicle@sonicle.com
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License
 * version 3, these Appropriate Legal Notices must retain the display of the
 * "Powered by Sonicle WebTop" logo. If the display of the logo is not reasonably
 * feasible for technical reasons, the Appropriate Legal Notices must display
 * the words "Powered by Sonicle WebTop".
 */
Ext.define('Sonicle.webtop.mail.view.ExternalAccount', {
	extend: 'WTA.sdk.ModelView',
	requires: [
		'Sonicle.webtop.mail.model.ExternalAccount',
		'WTA.store.MailboxProtocols'
	],
	
	dockableConfig: {
		width: 480,
		height: 520,
		title: '{externalAccount.tit}',
		iconCls: 'wtmail-icon-emailaccount-xs'
	},
	
	profileId: null,
	confirm: 'yn',
	autoToolbar: false,
	modelName: 'Sonicle.webtop.mail.model.ExternalAccount',
	
	constructor: function(cfg) {
		var me = this;
		me.callParent([cfg]);
		
		me.getViewModel().onCreateWithId = function(record, id) {
			WTU.applyExtraParams(record.getProxy(), {
				optionsProfile: me.profileId
			});
		};
	},
	
	initComponent: function() {
		var me = this;
		
		Ext.apply(me, {
			tbar: [
				me.addAct('saveClose', {
					text: WT.res('act-saveClose.lbl'),
					tooltip: null,
					iconCls: 'wt-icon-saveClose-xs',
					handler: function() {
						me.saveView(true);
						}
					})
			]
		});
		me.callParent(arguments);
		
		var main = {
			xtype: 'wtform',
			layout: 'column',
			defaults: {
				xtype: 'container',
				layout: 'anchor',
				modelValidation: true
			},
			items: [{
				defaults: {
					labelWidth: 150,
					width: 450
				},
				items: [ {
					xtype: 'textfield',
					bind: '{record.accountDescription}',
					fieldLabel: me.res('externalAccount.fld-accountDescription.lbl')
				}, {
					xtype: 'textfield',
					bind: '{record.displayName}',
					fieldLabel: me.res('externalAccount.fld-displayName.lbl')
				}, {
					xtype: 'textfield',
					bind: '{record.email}',
					fieldLabel: me.res('externalAccount.fld-email.lbl')
				}, WTF.lookupCombo('id', 'desc', {
					bind: '{record.protocol}',
					reference: 'protocolField',
					store: Ext.create('WTA.store.MailboxProtocols', {
						autoLoad: true
					}),
					fieldLabel: me.res('externalAccount.fld-protocol.lbl'),
					width: 260,
					needLogin: true,
					listeners: { 
						blur: { fn: me.onBlurAutoSave, scope: me },
						change: {fn: me.onProtocolSelectionChange, scope: me }
					}
				}), {
					xtype: 'textfield',
					bind: '{record.host}',
					fieldLabel: me.res('externalAccount.fld-host.lbl')
				}, {
					xtype: 'numberfield',
					reference: 'portField',
					bind: '{record.port}',
					fieldLabel: me.res('externalAccount.fld-port.lbl'),
					listeners: { 
						change: {fn: me.onPortSelectionChange, scope: me }
					}
				}, {
					xtype: 'textfield',
					bind: '{record.userName}',
					fieldLabel: me.res('externalAccount.fld-userName.lbl')
				}, {
					xtype: 'sopasswordfield',
					bind: '{record.password}',
					fieldLabel: me.res('externalAccount.fld-password.lbl')
				}, {
					xtype: 'textfield',
					bind: '{record.folderPrefix}',
					fieldLabel: me.res('externalAccount.fld-folderPrefix.lbl')
				}, {
					xtype: 'textfield',
					bind: '{record.folderSent}',
					reference: 'folderSentField',
					fieldLabel: me.res('externalAccount.fld-folderSent.lbl')
				}, {
					xtype: 'textfield',
					bind: '{record.folderDrafts}',
					reference: 'folderDraftsField',
					fieldLabel: me.res('externalAccount.fld-folderDrafts.lbl')
				}, {
					xtype: 'textfield',
					bind: '{record.folderTrash}',
					reference: 'folderTrashField',
					fieldLabel: me.res('externalAccount.fld-folderTrash.lbl')
				}, {
					xtype: 'textfield',
					bind: '{record.folderSpam}',
					reference: 'folderSpamField',
					fieldLabel: me.res('externalAccount.fld-folderSpam.lbl')
				}, {
					xtype: 'textfield',
					bind: '{record.folderArchive}',
					reference: 'folderArchiveField',
					fieldLabel: me.res('externalAccount.fld-folderArchive.lbl')
				}]
			}]
		};
		
		me.add({
			region: 'center',
			xtype: 'container',
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			items: main
		});
	},
	
	onProtocolSelectionChange: function(field, newValue, oldValue, eOpts) {
		var me = this;
		
			if(newValue === 'imaps') {
			me.lref('portField').setValue(993);
			} else if(newValue === 'imap') {
			me.lref('portField').setValue(143);
			}
	},
	
	onPortSelectionChange: function(field, newValue, oldValue, eOpts) {
		var me = this;
		
			if(newValue === 143) {
			me.lref('protocolField').setValue('imap');
			} else if(newValue === 993) {
			me.lref('protocolField').setValue('imaps');
			}
	},
	
	onModelLoad: function(success, model, op, pass) {
		var me = this;
		me.callParent(arguments);
			WTU.applyExtraParams(model.getProxy(), {
				optionsProfile: me.profileId
			});
	
			if(me.mode === 'new') {
				me.lref('protocolField').setValue('imaps');
				me.lref('portField').setValue(993);
				me.lref('folderSentField').setValue(me.mys.getVar('folderSent'));
				me.lref('folderDraftsField').setValue(me.mys.getVar('folderDrafts'));
				me.lref('folderTrashField').setValue(me.mys.getVar('folderTrash'));
				me.lref('folderSpamField').setValue(me.mys.getVar('folderSpam'));
				me.lref('folderArchiveField').setValue(me.mys.getVar('folderArchive'));
			}
	}
	
});
