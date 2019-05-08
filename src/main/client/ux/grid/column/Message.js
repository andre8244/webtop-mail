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
Ext.define('Sonicle.webtop.mail.ux.grid.column.Message', {
	extend: 'Ext.grid.column.Template',
	alias: 'widget.wtmail-mailmessagecolumn',
	uses: [
		'Sonicle.Bytes'
	],
	
	config: {
		threaded: false,
		sentMode: false
	},
	
	/**
	 * @cfg {Boolean} [stopSelection=false]
	 * Prevent grid selection upon click.
	 * Beware that if you allow for the selection to happen then the selection model will steal focus from
	 * any possible floating window (like a message box) raised in the handler. This will prevent closing the
	 * window when pressing the Escape button since it will no longer contain a focused component.
	 */
	stopSelection: true,
	
	/**
	 * @cfg {Number} [maxTags=3]
	 * The maximum number of visible tags.
	 */
	maxTags: 3,
	
	/**
	 * @cfg {Ext.data.Store} tagsStore
	 */
	tagsStore: null,
	
	/**
	 * @cfg {Function/String} collapseHandler
	 * A function called when the thread collapse/expand icon is clicked.
	 * @cfg {Ext.view.Table} handler.view The owning TableView.
	 * @cfg {Number} handler.rowIndex The row index clicked on.
	 * @cfg {Number} handler.colIndex The column index clicked on.
	 * @cfg {Event} handler.e The click event.
	 * @cfg {Ext.data.Model} handler.record The Record underlying the clicked row.
	 * @cfg {HTMLElement} handler.row The table row clicked upon.
	 */
	
	/**
	 * @cfg {Object} scope
	 * The scope (`this` reference) in which the `{@link #collapseHandler}`
	 * functions are executed.
	 * Defaults to this Column.
	 */
	
	/**
	 * Array of flag colors
	 */
	flagColors: {
		red: '#f44336',
		orange: '#ff9800',
		green: '#4caf50',
		blue: '#3f51b5',
		purple: '#9c27b0',
		yellow: '#ffc107',
		black: '#000000',
		gray: '#9e9e9e',
		white: '#cccccc',
		brown: '#795548',
		azure: '#03a9f4',
		pink: '#e91e63'
	},
	
	collapseTooltip: 'Click to expand/collapse discussion threads',
	noRcptText: '[No recipient]',
	noSubjectText: '[No subject]',
	flagsTexts: {
		red: 'Red marker',
		orange: 'Orange marker',
		green: 'Green marker',
		blue: 'Blue marker',
		purple: 'Purple marker',
		yellow: 'Yellow marker',
		black: 'Black marker',
		gray: 'Gray marker',
		white: 'White marker',
		brown: 'Brown marker',
		azure: 'Azure marker',
		pink: 'Pink marker',
		completed: 'Completed',
		special: 'Special'
	},
	
	dateShortFormat: 'm/d/Y',
	dateLongFormat: 'M d Y',
	timeShortFormat: 'g:i A',
	timeLongFormat: 'H:i:s',
	
	threadCollapseSelector: '.x-grid-group-title',
	
	tpl: [
		'<div class="wtmail-grid-cell-messagecolumn">',
			'<div class="wtmail-messagecolumn-head-float">',
				'<tpl if="headFloatIcon">',
					'<div class="wtmail-messagecolumn-icon {headFloatIcon.iconCls}" style="height:16px;" data-qtip="{headFloatIcon.tooltip}"></div>',
				'</tpl>',
				'<span <tpl if="unread">class="wtmail-grid-cell-messagecolumn-unread"</tpl> data-qtip="{date.tooltip}">{date.text}</span>',
			'</div>',
			'<div class="wtmail-messagecolumn-head">',
				'<tpl if="threaded">',
					'<tpl if="threadIndent == 0 && threadHasChildren">',
						'<div class="wtmail-messagecolumn-thread x-grid-group-hd-collapsible <tpl if="!threadOpen">x-grid-group-hd-collapsed</tpl>" style="{threadIndentStyle}" data-qtip="{collapseTooltip}">',
							'<span class="x-grid-group-title">&nbsp;</span>',
						'</div>',
					'<tpl else>',
						'<div class="wtmail-messagecolumn-thread" style="{threadIndentStyle}"></div>',
					'</tpl>',
					'<tpl if="!threadOpen && threadUnseenChildren &gt; 0">',
						'<b>+{threadUnseenChildren}&nbsp;</b>',
					'</tpl>',
				'<tpl else>',
					'<div class="wtmail-messagecolumn-thread"></div>',
				'</tpl>',
				'<tpl if="headIconCls">',
					'<div class="wtmail-messagecolumn-icon {headIconCls}" style="margin-right:4px;height:16px;"></div>',
				'</tpl>',
				'<span <tpl if="unread">class="wtmail-grid-cell-messagecolumn-unread"</tpl> data-qtip="{rcpt.tooltip}">{rcpt.text}</span>',
			'</div>',
			'<div class="wtmail-messagecolumn-body-float">',
				'<tpl for="tags">',
					'<div class="wtmail-messagecolumn-glyph" style="color:{color};" data-qtip="{tooltip}">',
						'<i class="fa fa-tag"></i>',
					'</div>',
				'</tpl>',
				'<tpl if="flag">',
					'<div class="wtmail-messagecolumn-glyph" style="color:{flag.color};" data-qtip="{flag.tooltip}">',
						'<i class="fa fa-{flag.glyph}"></i>',
					'</div>',
				'</tpl>',
				'<span data-qtip="{size.tooltip}">{size.text}</span>',
			'</div>',
			'<div class="wtmail-messagecolumn-body">',
				'<tpl if="threaded">',
					'<div class="wtmail-messagecolumn-thread" style="{threadIndentStyle}">',
				'<tpl else>',
					'<div class="wtmail-messagecolumn-thread">',
				'</tpl>',
					'<tpl if="hasAttachment">',
						'<div class="wtmail-messagecolumn-glyph" style="font-size:1.1em;">',
							'<i class="fa fa-paperclip"></i>',
						'</div>',
					'</tpl>',
					'</div>',
				'<tpl if="highPriority">',
					'<div class="wtmail-messagecolumn-glyph" style="margin-right:5px;color:#f44336;">',
						'<i class="fa fa-exclamation"></i>',
					'</div>',
				'</tpl>',
				'<tpl if="threaded && !threadOpen && threadUnseenChildren &gt; 0">',
					'<span data-qtip="{subject.tooltip}"><u>{subject.text}</u></span>',
				'<tpl else>',
					'<span data-qtip="{subject.tooltip}">{subject.text}</span>',
				'</tpl>',
			'</div>'
	],
	
	constructor: function(cfg) {
		var me = this;
		me.origScope = cfg.scope || me.scope;
		me.scope = cfg.scope = null;
		me.callParent([cfg]);
	},
	
	processEvent: function(type, view, cell, recordIndex, cellIndex, e, record, row) {
		var me = this,
			isClick = type === 'click',
			disabled = me.disabled,
			ret;
		
		if (!disabled && isClick) {
			if (e.getTarget(me.threadCollapseSelector)) {
				// Flag event to tell SelectionModel not to process it.
				e.stopSelection = me.stopSelection;
				// Do not allow focus to follow from this mousedown unless the grid is already in actionable mode 
				if (isClick && !view.actionableMode) {
					e.preventDefault();
				}
				Ext.callback(me.collapseHandler, me.origScope, [view, recordIndex, cellIndex, e, record, row], undefined, me);
			}
		} else {
			ret = me.callParent(arguments);
		}
		return ret;
	},
	
	defaultRenderer: function(val, meta, rec, ridx, cidx, sto) {
		var me = this,
				threaded = me.getThreaded(),
				data = {},
				rcpt;
		
		if (me.getSentMode()) {
			rcpt = {text: rec.get('to'), tooltip: rec.get('toemail')};
		} else {
			rcpt = {text: rec.get('from'), tooltip: rec.get('fromemail')};
		}
		
		Ext.apply(data, {
			threaded: threaded,
			threadOpen: threaded ? rec.get('threadOpen') : false,
			threadHasChildren: threaded ? rec.get('threadHasChildren') : false,
			threadUnseenChildren: threaded ? rec.get('threadUnseenChildren') : -1,
			threadIndent: threaded ? rec.get('threadIndent') : -1,
			threadIndentStyle: threaded ? me.buildThreadIndentStyle(rec.get('threadIndent')) : '',
			date: me.buildDate(sto, rec.get('istoday'), rec.get('fmtd'), rec.get('date')),
			size: me.buildSize(rec.get('size')),
			rcpt: rcpt,
			subject: me.buildSubject(rec.get('subject')),
			highPriority: rec.get('priority') < 3 ? true : false,
			hasAttachment: rec.get('atts'),
			flag: me.buildFlag(rec.get('flag')),
			tags: me.buildTags(rec.get('tags')),
			unread: rec.get('unread') === true,
			headIconCls: me.buildStatusIcon(rec),
			headFloatIcon: me.buildTypeIcon(rec),
			collapseTooltip: me.collapseTooltip
		});
		return this.tpl.apply(data);
	},
	
	buildThreadIndentStyle: function(indent) {
		var mright = 0;
		if (Ext.isNumber(indent)) {
			mright = indent * 15;
		}
		return 'margin-right:' + mright + 'px;';
	},
	
	buildDate: function(store, today, fmtd, date) {
		var me = this,
				textFmt, tipFmt;
		if (!fmtd && (today || (store.getGroupField && store.getGroupField() === 'gdate'))) {
			textFmt = me.timeShortFormat;
			tipFmt = me.dateShortFormat + ' ' + me.timeLongFormat;
		} else {
			textFmt = me.dateLongFormat;
			tipFmt = me.dateShortFormat + ' ' + me.timeLongFormat;
		}
		return {
			text: Ext.Date.format(date, textFmt),
			tooltip: Ext.Date.format(date, tipFmt)
		};
	},
	
	buildSize: function(size) {
		return {
			text: Sonicle.Bytes.format(size, {decimals: 0}),
			tooltip: Sonicle.Bytes.format(size)
		};
	},
	
	buildSubject: function(subject) {
		var sub = Ext.isEmpty(subject) ? this.noSubjectText : subject;
		return {
			text: sub,
			tooltip: sub
		};
	},
	
	buildTags: function(tags) {
		var sto = this.tagsStore,
				limit = this.maxTags,
				arr = [];
		if (sto) {
			Ext.iterate(tags, function(itm) {
				if (arr.length >= limit) return false;
				var rec = sto.findRecord('tagId', itm);
				if (rec) arr.push({color: rec.get('color'), tooltip: rec.get('description')});
			});
		}
		return arr;
	},
	
	buildFlag: function(flag) {
		var txts = this.flagsTexts;
		if (Ext.isEmpty(flag)) return null;
		if (flag === 'special') {
			return {glyph: 'star', color: '#ffc107', tooltip: txts['special']};
		} else if (flag === 'complete') {
			return {glyph: 'check', color: 'initial', tooltip: txts['completed']};
		} else {
			var k = Sonicle.String.removeEnd(flag, '-complete'),
					co = this.flagColors[k];
			if (Ext.String.endsWith(flag, '-complete')) {
				return {glyph: 'check-square', color: co, tooltip: Ext.String.format('{0} ({1})', txts[k], txts['completed'].toLowerCase())};
			} else {
				return {glyph: 'bookmark', color: co, tooltip: txts[k]};
			}
		}
	},
	
	buildStatusIcon: function(rec) {
		var status = rec.get('status');
		switch(status) {
			case 'new':
				//return 'fa-envelope';
				return 'wtmail-icon-status-new';
			case 'replied':
				//return 'fa-reply';
				return 'wtmail-icon-status-replied';
			case 'forwarded':
				//return 'fa-share';
				return 'wtmail-icon-status-forwarded';
			case 'repfwd':
				//return 'fa-retweet';
				return 'wtmail-icon-status-replied-forwarded';
		}
		return null;
	},
	
	buildTypeIcon: function(rec) {
		var pstatus = rec.get('pecstatus');
		//TODO: add support other message types (eg. appointment invitation)
		switch(pstatus) {
			case 'posta-certificata':
				return {iconCls: 'wtmail-pec', tooltip: 'Messaggio PEC'};
			case 'accettazione':
				return {iconCls: 'wtmail-pec-accepted', tooltip: 'PEC (ricevuta di accettazione)'};
			case 'non-accettazione':
				return {iconCls: 'wtmail-pec-not-accepted', tooltip: 'PEC (ricevuta di NON accettazione)'};
			case 'avvenuta-consegna':
				return {iconCls: 'wtmail-pec-delivered', tooltip: 'PEC (ricevuta di consegna)'};
			case 'errore':
				return {iconCls: 'wtmail-pec-error', tooltip: 'PEC (errore)'};
		}
		return null;
	}
});
