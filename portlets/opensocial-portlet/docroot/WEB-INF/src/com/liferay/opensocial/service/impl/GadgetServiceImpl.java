/**
 * Copyright (c) 2000-2011 Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.opensocial.service.impl;

import com.liferay.opensocial.model.Gadget;
import com.liferay.opensocial.service.base.GadgetServiceBaseImpl;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.exception.SystemException;
import com.liferay.portal.service.ServiceContext;

/**
 * The implementation of the gadget remote service.
 *
 * <p>
 * All custom service methods should be put in this class. Whenever methods are added, rerun ServiceBuilder to copy their definitions into the {@link com.liferay.opensocial.service.GadgetService} interface.
 *
 * <p>
 * This is a remote service. Methods of this service are expected to have security checks based on the propagated JAAS credentials because this service can be accessed remotely.
 * </p>
 *
 * @author Brian Wing Shun Chan
 * @see com.liferay.opensocial.service.base.GadgetServiceBaseImpl
 * @see com.liferay.opensocial.service.GadgetServiceUtil
 */
public class GadgetServiceImpl extends GadgetServiceBaseImpl {

	public Gadget addGadget(
			long companyId, String url, String portletCategoryNames,
			ServiceContext serviceContext)
		throws PortalException, SystemException {

		return gadgetLocalService.addGadget(
			companyId, url, portletCategoryNames, serviceContext);
	}

}