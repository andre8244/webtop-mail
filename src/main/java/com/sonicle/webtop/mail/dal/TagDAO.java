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
package com.sonicle.webtop.mail.dal;

import com.sonicle.webtop.core.dal.BaseDAO;
import com.sonicle.webtop.core.dal.DAOException;
import com.sonicle.webtop.mail.bol.OTag;
import static com.sonicle.webtop.mail.jooq.Tables.TAGS;
import com.sonicle.webtop.mail.jooq.tables.records.TagsRecord;
import java.sql.Connection;
import org.jooq.DSLContext;
import java.util.List;

/**
 *
 * @author gbulfon
 */
public class TagDAO extends BaseDAO {
	
	private final static TagDAO INSTANCE = new TagDAO();
	public static TagDAO getInstance() {
		return INSTANCE;
	}
	
	public List<OTag> selectByProfile(Connection con, String domainId, String userId) throws DAOException {
		DSLContext dsl = getDSL(con);
		return dsl
			.select()
			.from(TAGS)
			.where(
				TAGS.DOMAIN_ID.equal(domainId)
				.and(TAGS.USER_ID.equal(userId))
			)
			.fetchInto(OTag.class);
	}
	
	public OTag selectById(Connection con, String domainId, String userId, String tagId) throws DAOException {
		DSLContext dsl = getDSL(con);
		return dsl
			.select()
			.from(TAGS)
			.where(
				TAGS.DOMAIN_ID.equal(domainId)
				.and(TAGS.USER_ID.equal(userId)
				.and(TAGS.TAG_ID.equal(tagId)))
			)
			.fetchOneInto(OTag.class);
	}
	
	public int insert(Connection con, OTag item) throws DAOException {
		DSLContext dsl = getDSL(con);
		TagsRecord record = dsl.newRecord(TAGS, item);
		return dsl
			.insertInto(TAGS)
			.set(record)
			.execute();
	}
	
	public int deleteById(Connection con, String domainId, String userId, String tagId) throws DAOException {
		DSLContext dsl = getDSL(con);
		return dsl
			.delete(TAGS)
			.where(
				TAGS.DOMAIN_ID.equal(domainId)
				.and(TAGS.USER_ID.equal(userId)
				.and(TAGS.TAG_ID.equal(tagId)))
			)
			.execute();
	}
	
	public int update(Connection con,String oldTagId, OTag item) throws DAOException {
		DSLContext dsl = getDSL(con);
		return dsl
			.update(TAGS)
			.set(TAGS.TAG_ID,item.getTagId())
			.set(TAGS.DESCRIPTION,item.getDescription())
			.set(TAGS.COLOR,item.getColor())
			.where(
				TAGS.DOMAIN_ID.equal(item.getDomainId())
				.and(TAGS.USER_ID.equal(item.getUserId())
				.and(TAGS.TAG_ID.equal(oldTagId)))
			)
			.execute();
	}
}
