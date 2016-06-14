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
		'Sonicle.webtop.core.ux.RecipientsGrid',
		'Sonicle.webtop.core.ux.field.SuggestCombo',
		'Sonicle.form.field.HTMLEditor',
		'Sonicle.webtop.mail.model.MessageModel',
		'Sonicle.upload.Button'
	],
	
	statics: {
		buildMsgId: function() {
			return (new Date()).getTime();
		}
	},
	
	dockableConfig: {
		title: '{message.tit}',
		iconCls: 'wtmail-icon-newmsg-xs',
		width: 800,
		height: 500
	},
	modelName: 'Sonicle.webtop.mail.model.MessageModel',
	
	autoToolbar: false,
	identityIndex: 0,
	selectedIdentity: null,
	fontFace: 'Arial',
	fontSize: 12,
	
    showSave: true,
    showAddressBook: true,
    showReceipt: true,
    showPriority: true,
    showAttach: true,
    showIdentities: true,
    showEditToolbar: true,
    showSourceEdit: true,
    showCloud: true,
	
    autoSave: false,
    autoSaveService: 'mail',
    autoSaveAction: 'AutoSaveMessage',
    autoSaveDirty: false,
    autoSaveTask: null,
    autoSaveDelay: 30000,
	
	fax: false,
	faxident: null,
	
	msgId: 0,
	dirty: false,
	
	
	initComponent: function() {
		var me=this;
		me.callParent(arguments);
		
		if (me.msgId===0) me.msgId=Sonicle.webtop.mail.view.MessageEditor.buildMsgId();
		
		me.identities=me.mys.getOption("identities");
		//save hashed identities, by email
		me.identHash={};
		Ext.each(me.identities,function(ident) { me.identHash[ident.email]=ident},me);
		
		me.attlist=Ext.create('Sonicle.webtop.mail.EditorAttachments', {
			width: 250,
			region: 'east',
			mys: me.mys,
			bind: {
				store: '{record.attachments}'
			}
		});
		
		me.recgrid=Ext.create({
			xtype: 'wtrecipientsgrid',
			height: 90,
			region: 'center',
			tabIndex: 2,
			fields: { recipientType: 'rtype', email: 'email' },
			bind: {
				store: '{record.recipients}'
			},
			listeners: {
				exitfocus: function(recgrid) {
					me.subject.focus();
				}
			}
		});
		
		me.subject=Ext.create({
			xtype: 'wtsuggestcombo',
            sid: me.mys.ID,
            suggestionContext: 'subject',
            width: 600,
			tabIndex: 3,
			enableKeyEvents: true,
			fieldLabel: WT.res('word.subject'),
			labelWidth: 60,
			labelAlign: 'right',
			listeners: {
				keydown: function(cb, e, eOpts) {
					if (e.getKey() === e.TAB) {
						e.stopEvent();
						me.htmlEditor.focusEditor();
					}
				}
			},
			bind: '{record.subject}'
        });
		var tbitems=new Array(),
			tbx=0;
		
		tbitems[tbx++]={
			xtype: 'splitbutton',
			text: me.mys.res('editor.send.btn-send.lbl'),
			tooltip: me.mys.res('editor.send.btn-send.lbl'),
			iconCls: 'wtmail-icon-send-xs',
			handler: me.actionSend,
			scope: me,
			menu: [
				{ text: me.mys.res('editor.send.btn-send.lbl'), iconCls: 'wtmail-icon-send-xs', handler: me.actionSend, scope: me },
				{ text: me.mys.res('editor.send.btn-schedule.lbl'), iconCls: 'wtmail-icon-schedule-xs', handler: me.actionSchedule, scope: me }
			]
		};
		tbitems[tbx++]='-';
		
		if (me.showSave) {
			tbitems[tbx++]={
				xtype: 'button',
				tooltip: me.mys.res('editor.btn-save.tip'),
				iconCls: 'wt-icon-save-xs',
				handler: me.actionSave,
				scope: me
			};
			tbitems[tbx++]='-';
		}
		
		if (me.showAddressBook) {
			tbitems[tbx++]={
				xtype: 'button',
				tooltip: me.mys.res('editor.btn-addressbook.tip'),
				iconCls: 'wtmail-icon-addressbook-xs',
				handler: me.actionAddressBook,
				scope: me
			};
			tbitems[tbx++]='-';
		}
		
        var dash=false;
        if (me.showReceipt) {
			tbitems[tbx++]={
				xtype: 'button',
				enableToggle: true,
				tooltip: me.mys.res('editor.btn-receipt.tip'),
				iconCls: 'wtmail-icon-receipt-xs',
				handler: me.actionReceipt,
				scope: me,
				bind: {
					pressed: '{record.receipt}'
				}
			};
            dash=true;
        }
        if (this.showPriority) {
			tbitems[tbx++]={
				xtype: 'button',
				enableToggle: true,
				tooltip: me.mys.res('editor.btn-priority.tip'),
				iconCls: 'wtmail-icon-priority-high-xs',
				handler: me.actionPriority,
				scope: me,
				bind: {
					pressed: '{record.priority}'
				}
			};
            dash=true;
        }
        if (dash) {
            tbitems[tbx++]='-';
        }
		
        if (me.showAttach) {
			tbitems[tbx++]={
				xtype:'souploadbutton',
				tooltip: me.mys.res('editor.btn-attach.tip'),
				iconCls: 'wtmail-icon-attachment-xs',
				uploaderConfig: WTF.uploader(me.mys.ID,'UploadAttachment',{
					extraParams: {
						tag: me.msgId
					}
				}),
				listeners: {
					/*uploadstarted: function(s) {
					},*/
					beforeupload: function(s,file) {
						me.htmlEditor.showProgress(file.name);
					},
					uploadprogress: function(s,file) {
						me.htmlEditor.setProgress(file.percent);
					},
					fileuploaded: function(s,file,resp) {
						me.htmlEditor.hideProgress();
						me.setDirty(true);
						//me.attlist.addAttachItem(file.name,resp.data.uploadId,file.size);
						me.attlist.getStore().add(
								{ msgId: me.msgId, fileName: file.name, uploadId: resp.data.uploadId, fileSize: file.size }
						);
					},
					uploadcomplete: function(s,fok,ffailed) {
						//console.log("Upload completed - ok: "+fok.length+" - failed: "+ffailed.length);
					}
				}
			};		
		}
		
		if (me.showIdentities) {
            var idents=new Array(),
				selident=null;
            if (me.identities) {
				var x=0;
                for(var i=0;i<me.identities.length;++i) {
                    var id=me.identities[i];
					if (me.fax) {
						if (me.faxident && !id.fax) continue;
					} else {
						if (id.fax) continue;
					}
                    //var a=new Array);
                    //a[0]=i;
                    //a[1]=id.displayname+" - "+id.email;
                    idents[x]=id;
					if (me.identityIndex===i) selident=id;
					++x;
                }
				if (!selident) selident=idents[0];
				me.selectedIdentity=selident;
				
				tbitems[tbx++]='-';
				tbitems[tbx++]={
					xtype:'combo',
					bind: '{record.from}',
					tooltip: me.mys.res('editor.cbo-identities.tip'),
					queryMode: 'local',
					displayField: 'description',
					valueField: 'email',
					width:me.customToolbarButtons?200:300,
					matchFieldWidth: false,
					listConfig: {
						width: 300
					},
					store: Ext.create('Ext.data.Store', {
						model: 'Sonicle.webtop.mail.model.Identity',
						data : idents
					}),
					value: selident.email,
					listeners: {
						change: {
							fn: function(s,nv,ov) {
								// We are using the select event because change event is
								// fired only after blur. Within this event we have to
								// calculate new and old values manually.
								//var ov = s.lastValue || s.startValue;
								//var nv = r.get('id');
								if(!nv || !ov || ov === nv) return;
								
								if (!this.htmlEditor.isReady()) me.setHtml(me.prepareHtml(me.htmlEditor.getValue(),me.identHash[nv].mailcard));
								else me.setHtml(me.replaceMailcard(me.htmlEditor.getValue(), me.identHash[ov].mailcard.html, me.identHash[nv].mailcard.html));
							},
							scope: this
						}
					}
					
				};

            }
		}
		
		if (me.showCloud) {
			//TODO: check for vfs service
            //var vfs=WT.app.getServiceByName("vfs");
            //if (vfs) {
            //    if (vfs.hasPersonalCloud()) {
					tbitems[tbx++]='-';
					tbitems[tbx++]={
						xtype: 'button',
						tooltip: me.mys.res('editor.btn-cloud-download.tip'),
						iconCls: 'wtmail-icon-cloud-download-xs',
						handler: me.actionCloudDownload,
						scope: me
					};
					tbitems[tbx++]={
						xtype: 'button',
						tooltip: me.mys.res('editor.btn-cloud-upload.tip'),
						iconCls: 'wtmail-icon-cloud-upload-xs',
						handler: me.actionCloudUpload,
						scope: me
					};
			//	}
			//}
		}
		
		me.toolbar=Ext.create({
			xtype: 'toolbar',
			region: 'north',
			items: tbitems
		});
		
		me.add(Ext.create({
			xtype: 'panel',
			region: 'north',
//			bodyCls: 'wt-theme-bg-2',
            border: false,
            bodyBorder: false,
			height: 150,
			layout: 'anchor',
			items: [
				me.toolbar,
				Ext.create({
					xtype: 'panel',
					region: 'center',
                    border: false,
                    bodyBorder: false,
                    height: 90,
                    layout: 'border',
                    items: [
                        me.recgrid,
						me.attlist
                    ]
				}),
				me.subject
			]
		}));
		me.add(
			me.htmlEditor=Ext.create({
				xtype: 'sohtmleditor',
				region: 'center',
				bind: '{record.html}',
				enableFont: true,
				enableFontSize: true,
				enableFormat: true,
				enableColors: true,
				enableAlignments: true,
				enableLinks: true,
				enableLists: true,
				enableSourceEdit: true,
				enableClean: true,
				listeners: {
					init: function() {
						var xdoc=me.htmlEditor.getDoc(),
							xstyle=xdoc.createElement('style');

						xstyle.type='text/css';
						xstyle.appendChild(xdoc.createTextNode(
								'div#wt-mailcard { border: 1px dotted lightgray !important; } '+
								'blockquote { display: block; margin-left: 5px; border-left: solid 2px blue; padding-left: 10px; } '
						));
						xdoc.head.appendChild(xstyle);
					}
				}
			})
		);

		me.on('viewload', me.onViewLoad);
		me.on('viewclose',function() {
			this.mys.cleanupUploadedFiles(me.msgId);
		});
	},
	
	onViewLoad: function(s, success) {
		if(!success) return;
		
		var me=this,
			rg=me.recgrid,
			c=rg.getRecipientsCount();
	
		if (c===1) {
			var r=c-1,
				email=rg.getRecipientAt(r);
		
			if (email==="") rg.startEditAt(r);
		} else {
			if (me.subject.getValue()==="") me.subject.focus();
			else me.htmlEditor.focusEditor();
		}
	},
	
	startNew: function(data) {
		var me=this;
		data.html=me.prepareHtml(data.html);
		me.beginNew({
			data: data
		});
	},
	
	sendMail: function() {
		console.log("sendMail");
	},
	
    prepareHtml: function(html,mc) {
		var me=this;
		if (!mc) mc=me.identities[me.identityIndex].mailcard;
		
		if (mc) html='<br><br><div id="wt-mailcard">'+mc.html+'</div>'+html;
        html='<div style="font-family: '+me.fontFace+'; font-size: '+me.fontSize+'px;">'+html+'</div>';
        return html;
    },
	
    setHtml: function(html) {
		var me=this;
        //me.htmlEditor.initHtmlValue(html);
		me.getModel().set("html",html);
/*        var w=this.htmleditor.getWin();
        var d=w.document;
        var n=d.body.firstChild;
        if (w.getSelection) {
            var r=d.createRange();
            r.setStart(n,0);
            r.setEnd(n,0);
            var s = this.htmleditor.win.getSelection();
            s.removeAllRanges();
            s.addRange(r);
        } else if (d.selection) {
            var r=d.body.createTextRange();
            r.moveToElementText(n);
            r.collapse(true);
            r.select();
        }*/
    },

	replaceMailcard: function(html, omc, nmc) {
		if(Ext.isEmpty(omc) || Ext.isEmpty(nmc)) return html;
		
		var htmlEl = Ext.get(Ext.DomHelper.createDom({html: html})),
			mcEl = htmlEl.query('#wt-mailcard',false);
		if(mcEl) {
			mcEl=mcEl[0];
			var htmlOmc = this.htmlEditor.cleanUpHtml(omc);
			var htmlMcEl = this.htmlEditor.cleanUpHtmlFromDom(mcEl.dom);

			if (htmlMcEl == htmlOmc) {
				mcEl.dom.innerHTML = nmc;
			} else {
				WT.error(this.mys.res('editor.mailcard.replace.no'));
			}
			return htmlEl.dom.innerHTML;
		} else {
			return html;
		}
	},
	
    setDirty: function(b) {
        this.dirty=b;
        this.autoSaveDirty=b;
    }
    
	
	
	
});

Ext.define('Sonicle.webtop.mail.EditorAttachments', {
	extend: 'Ext.view.View',
	
	cls: 'x-panel-body-default',
	overItemCls: 'wtmail-table-editor-attachement-over',
	itemSelector: 'table.wtmail-table-editor-attachment',
	
	mys: null,
	
	tpl: new Ext.XTemplate(
		"<tpl for='.'>",
			"<table border=0 cellspacing=0 cellpadding=0 class='wtmail-table-editor-attachment'>",
			  "<tr>",
				"<td class='wtmail-td-editor-attachment-icon'>",
					"<img src='{[WTF.resourceUrl(WT.ID,\"filetypes/\"+WT.Util.normalizeFileType(name)+\"_16.gif\")]}'>",
				"</td>",
				"<td class='wtmail-td-editor-attachment-text'>",
					"<a href='javascript:Ext.emptyFn()' title='{fileName}'>",
						"&nbsp;{fileName}",
					"</a>",
				"</td>",
				"<td class='wtmail-td-editor-attachment-delete-icon'>",
					"<img class='wt-icon-delete-xs' style='width: 16px; height: 16px;'>",
				"</td>",
			  "</tr>",
			"</table>",
		"</tpl>"
	),
	
	listeners: {
		itemclick: function(s, r, item, ix, e) {
			var me=this,
				tgt=e.getTarget(null,null,true);

			if (tgt.hasCls('wt-icon-delete-xs')) {
				//me.ownerCt.remove(this);
				//me.fireEvent('remove',me);
				me.getStore().remove(r);
			}
			else {
				var href=WTF.processBinUrl(me.mys.ID,"PreviewAttachment",{
					uploadId: r.get("uploadId")
				});
				Sonicle.URLMgr.open(href,true,"location=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,titlebar=yes,toolbar=no,top=10,left=10,width=770,height=480");
			}
		}
	}
	
});

