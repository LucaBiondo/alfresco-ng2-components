/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ApiService } from '../../core/actions/api.service';

export class ProcessInstancesService {

    api: ApiService;

    constructor(api: ApiService) {
        this.api = api;
    }

    async createProcessInstance(processDefKey, appName, options?: any) {
        const path = '/' + appName + '/rb/v1/process-instances';
        const method = 'POST';

        const queryParams = {}, postBody = {
            'processDefinitionKey': processDefKey,
            'payloadType': 'StartProcessPayload',
            ...options
        };

        return await this.api.performBpmOperation(path, method, queryParams, postBody);
    }

    async suspendProcessInstance(processInstanceId, appName) {
        const path = '/' + appName + '/rb/v1/process-instances/' + processInstanceId + '/suspend';
        const method = 'POST';

        const queryParams = {}, postBody = {};

        return await this.api.performBpmOperation(path, method, queryParams, postBody);
    }

    async deleteProcessInstance(processInstanceId, appName) {
        const path = '/' + appName + '/rb/v1/process-instances/' + processInstanceId;
        const method = 'DELETE';

        const queryParams = {}, postBody = {};

        return await this.api.performBpmOperation(path, method, queryParams, postBody);
    }

    async completeProcessInstance(processInstanceId, appName) {
        const path = '/' + appName + '/rb/v1/process-instances/' + processInstanceId + '/complete';
        const method = 'POST';

        const queryParams = {}, postBody = {};

        return await this.api.performBpmOperation(path, method, queryParams, postBody);
    }
}
