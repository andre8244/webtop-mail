/*
 * webtop-mail is a WebTop Service developed by Sonicle S.r.l.
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

Ext.define('Sonicle.webtop.mail.view.MessageEditor', {
	extend: 'WT.sdk.ModelView',
	requires: [
		'Sonicle.webtop.mail.model.MessageModel',
		'Ext.ux.form.TinyMCETextArea'
	],
	
	title: '@message.tit',
	iconCls: 'wtmail-icon-newmsg-xs',
	model: 'Sonicle.webtop.mail.model.MessageModel',
	
	tmce: null,
	
	initComponent: function() {
		var me=this;
		me.callParent(arguments);
		
		me.add(Ext.create({
			xtype: 'panel',
			region: 'north',
			height: 100
		}));
		me.add(
			Ext.create({
				xtype: 'panel',
				region: 'center',
				layout: 'fit',
				border: 0,
				tbar:  [
					{
						xtype: 'combo', 
						width: 100,
						store: Ext.create('Ext.data.Store', {
							fields: ['fn'],
							data : [
								{ fn: "Arial" },
								{ fn: "Comic Sans MS"},
								{ fn: "Courier New"}
							]
						}),
						forceSelection: true,
						autoSelect: true,
						displayField: 'fn',
						valueField: 'fn',
						queryMode: 'local',
						listeners: {
							'select': function(c,r,o) {
								me.execCommand('fontname',false,r.get('fn'));
							}
						}
					},
					'-',
					{
						xtype: 'button', iconCls: 'wtmail-icon-bold-xs' , text: 'B',
						handler: function() {
							me.execCommand('bold');
						}
					},
					{
						xtype: 'button', iconCls: 'wtmail-icon-italic-xs' , text: 'I',
						handler: function() {
							me.execCommand('italic');
						}
					},
					{
						xtype: 'button', iconCls: 'wtmail-icon-underline-xs' , text: 'U',
						handler: function() {
							me.execCommand('underline');
						}
					}
					
				],
				items: [
					me.tmce=Ext.create({
						xtype: 'tinymce_textarea',
						region: 'center',
						fieldStyle: 'font-family: Courier New; font-size: 12px;',
						style: { border: '0' },
						tinyMCEConfig: {
							plugins: [
							"advlist autolink lists link image charmap print preview hr anchor pagebreak",
							"searchreplace wordcount visualblocks visualchars code fullscreen",
							"insertdatetime media nonbreaking save table contextmenu directionality",
							"emoticons template paste textcolor"
							],

							toolbar: false,
							//toolbar1: "newdocument fullpage | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | styleselect formatselect fontselect fontsizeselect",
							//toolbar2: "cut copy paste | searchreplace | bullist numlist | outdent indent blockquote | undo redo | link unlink anchor image media code | inserttime preview | forecolor backcolor",
							//toolbar3: "table | hr removeformat | subscript superscript | charmap emoticons | print fullscreen | ltr rtl | spellchecker | visualchars visualblocks nonbreaking template pagebreak restoredraft",
							menubar: false,
							toolbar_items_size: 'small'
						},
						value: 'This is the WebTop-TinyMCE HTML Editor'

					})
				]
			})
		);
	},
	
	execCommand: function(cmd, ui, value, obj) {
		var ed = tinymce.get(this.tmce.getInputId());
		ed.execCommand(cmd,ui,value,obj);
	}
});