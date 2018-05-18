/*
 * Copyright (c) 2005 - 2018 Alfresco Software, Ltd. All rights reserved.
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/*
 * Author: Ciprian Topala
 *
 * Created on: March 15 2018
 */

let Util = require('../../../util/util.js');

/**
 * Create Json Object for standalone task
 *
 * @param details - JSON object used to overwrite the default values
 * @constructor
 */

var StandaloneTask = function (details) {

    this.name = Util.generateRandomString();

    Object.assign(this, details);
};
module.exports = StandaloneTask;