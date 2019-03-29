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

import { SimpleChange } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { FormFieldModel, FormFieldTypes, FormOutcomeEvent, FormOutcomeModel, LogService, ContainerModel } from '@alfresco/adf-core';
import { FormCloudService } from '../services/form-cloud.services';
import { FormCloudComponent } from './form-cloud.component';
import { WidgetVisibilityService } from '../../../../../core/form/services/widget-visibility.service';
import { FormCloudModel } from '../models/form-cloud.model';
import { cloudFormMock } from '../mocks/cloud-form.mock';

describe('FormCloudComponent', () => {

    let formService: FormCloudService;
    let formComponent: FormCloudComponent;
    let visibilityService: WidgetVisibilityService;
    let logService: LogService;

    beforeEach(() => {
        logService = new LogService(null);
        visibilityService = new WidgetVisibilityService(null, logService);
        spyOn(visibilityService, 'refreshVisibility').and.stub();
        formService = new FormCloudService(null, null, logService);
        formComponent = new FormCloudComponent(formService, visibilityService);
    });

    it('should check form', () => {
        expect(formComponent.hasForm()).toBeFalsy();
        formComponent.form = new FormCloudModel();
        expect(formComponent.hasForm()).toBeTruthy();
    });

    it('should allow title if task name available', () => {
        let formModel = new FormCloudModel();
        formComponent.form = formModel;

        expect(formComponent.showTitle).toBeTruthy();
        expect(formModel.taskName).toBe(FormCloudModel.UNSET_TASK_NAME);
        expect(formComponent.isTitleEnabled()).toBeTruthy();

        // override property as it's the readonly one
        Object.defineProperty(formModel, 'taskName', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: null
        });

        expect(formComponent.isTitleEnabled()).toBeFalsy();
    });

    it('should not allow title', () => {
        let formModel = new FormCloudModel();

        formComponent.form = formModel;
        formComponent.showTitle = false;

        expect(formModel.taskName).toBe(FormCloudModel.UNSET_TASK_NAME);
        expect(formComponent.isTitleEnabled()).toBeFalsy();
    });

    it('should return primary color for complete button', () => {
        expect(formComponent.getColorForOutcome('COMPLETE')).toBe('primary');
    });

    it('should not enable outcome button when model missing', () => {
        expect(formComponent.isOutcomeButtonVisible(null, false)).toBeFalsy();
    });

    it('should enable custom outcome buttons', () => {
        let formModel = new FormCloudModel();
        formComponent.form = formModel;
        let outcome = new FormOutcomeModel(<any>formModel, { id: 'action1', name: 'Action 1' });
        expect(formComponent.isOutcomeButtonVisible(outcome, formComponent.form.readOnly)).toBeTruthy();
    });

    it('should allow controlling [complete] button visibility', () => {
        let formModel = new FormCloudModel();
        formComponent.form = formModel;
        let outcome = new FormOutcomeModel(<any>formModel, { id: '$save', name: FormOutcomeModel.SAVE_ACTION });

        formComponent.showSaveButton = true;
        expect(formComponent.isOutcomeButtonVisible(outcome, formComponent.form.readOnly)).toBeTruthy();

        formComponent.showSaveButton = false;
        expect(formComponent.isOutcomeButtonVisible(outcome, formComponent.form.readOnly)).toBeFalsy();
    });

    it('should show only [complete] button with readOnly form ', () => {
        let formModel = new FormCloudModel();
        formModel.readOnly = true;
        formComponent.form = formModel;
        let outcome = new FormOutcomeModel(<any>formModel, { id: '$complete', name: FormOutcomeModel.COMPLETE_ACTION });

        formComponent.showCompleteButton = true;
        expect(formComponent.isOutcomeButtonVisible(outcome, formComponent.form.readOnly)).toBeTruthy();
    });

    it('should not show [save] button with readOnly form ', () => {
        let formModel = new FormCloudModel();
        formModel.readOnly = true;
        formComponent.form = formModel;
        let outcome = new FormOutcomeModel(<any>formModel, { id: '$save', name: FormOutcomeModel.SAVE_ACTION });

        formComponent.showSaveButton = true;
        expect(formComponent.isOutcomeButtonVisible(outcome, formComponent.form.readOnly)).toBeFalsy();
    });

    it('should show [custom-outcome] button with readOnly form and selected custom-outcome', () => {
        let formModel = new FormCloudModel({formRepresentation: {formDefinition: {selectedOutcome: 'custom-outcome'}}});
        formModel.readOnly = true;
        formComponent.form = formModel;
        let outcome = new FormOutcomeModel(<any>formModel, { id: '$customoutome', name: 'custom-outcome' });

        formComponent.showCompleteButton = true;
        formComponent.showSaveButton = true;
        expect(formComponent.isOutcomeButtonVisible(outcome, formComponent.form.readOnly)).toBeTruthy();

        outcome = new FormOutcomeModel(<any>formModel, { id: '$customoutome2', name: 'custom-outcome2' });
        expect(formComponent.isOutcomeButtonVisible(outcome, formComponent.form.readOnly)).toBeFalsy();
    });

    it('should allow controlling [save] button visibility', () => {
        let formModel = new FormCloudModel();
        formModel.readOnly = false;
        formComponent.form = formModel;
        let outcome = new FormOutcomeModel(<any>formModel, { id: '$save', name: FormOutcomeModel.COMPLETE_ACTION });

        formComponent.showCompleteButton = true;
        expect(formComponent.isOutcomeButtonVisible(outcome, formComponent.form.readOnly)).toBeTruthy();

        formComponent.showCompleteButton = false;
        expect(formComponent.isOutcomeButtonVisible(outcome, formComponent.form.readOnly)).toBeFalsy();
    });

    it('should load form on refresh', () => {
        spyOn(formComponent, 'loadForm').and.stub();

        formComponent.onRefreshClicked();
        expect(formComponent.loadForm).toHaveBeenCalled();
    });


    it('should get task variables if a task form is rendered', () => {
        spyOn(formService, 'getTaskForm').and.callFake((currentTaskId) => {
            return new Observable((observer) => {
                observer.next({ formRepresentation: { taskId: currentTaskId }});
                observer.complete();
            });
        });

        spyOn(formService, 'getTaskVariables').and.returnValue(of({}));
        spyOn(formService, 'getTask').and.callFake((currentTaskId) => {
            return new Observable((observer) => {
                observer.next({ formRepresentation: { taskId: currentTaskId }});
                observer.complete();
            });
        });
        const taskId = '123';
        const appName = 'test-app';

        formComponent.appName = appName;
        formComponent.taskId = taskId;
        formComponent.loadForm();

        expect(formService.getTaskVariables).toHaveBeenCalledWith(appName, taskId);
    });

    it('should not get task variables and form if task id is not specified', () => {
        spyOn(formService, 'getTaskForm').and.callFake((currentTaskId) => {
            return new Observable((observer) => {
                observer.next({ taskId: currentTaskId });
                observer.complete();
            });
        });

        spyOn(formService, 'getTaskVariables').and.returnValue(of({}));

        formComponent.appName = 'test-app';
        formComponent.taskId = null;
        formComponent.loadForm();

        expect(formService.getTaskForm).not.toHaveBeenCalled();
        expect(formService.getTaskVariables).not.toHaveBeenCalled();
    });

    it('should get form definition by form id on load', () => {
        spyOn(formComponent, 'getFormById').and.stub();
        
        const formId = '123';
        const appName = 'test-app'

        formComponent.appName = appName;
        formComponent.formId = formId;
        formComponent.loadForm();

        expect(formComponent.getFormById).toHaveBeenCalledWith(appName, formId);
    });

    it('should refresh visibility when the form is loaded', () => {
        spyOn(formService, 'getForm').and.returnValue(of({formRepresentation: {formDefinition:{}}}));
        const formId = '123';
        const appName = 'test-app';

        formComponent.appName = appName;
        formComponent.formId = formId;
        formComponent.loadForm();

        expect(formService.getForm).toHaveBeenCalledWith(appName, formId);
        expect(visibilityService.refreshVisibility).toHaveBeenCalled();
    });

    it('should reload form by task id on binding changes', () => {
        spyOn(formComponent, 'getFormByTaskId').and.stub();
        const taskId = '<task id>';

        const appName = 'test-app';
        formComponent.appName = appName;
        let change = new SimpleChange(null, taskId, true);
        formComponent.ngOnChanges({ 'taskId': change });

        expect(formComponent.getFormByTaskId).toHaveBeenCalledWith(appName, taskId);
    });

    it('should reload form definition by form id on binding changes', () => {
        spyOn(formComponent, 'getFormById').and.stub();
        const formId = '123';
        const appName = 'test-app'

        formComponent.appName = appName;
        let change = new SimpleChange(null, formId, true);
        formComponent.ngOnChanges({ 'formId': change });

        expect(formComponent.getFormById).toHaveBeenCalledWith(appName, formId);
    });

    it('should not get form on load', () => {
        spyOn(formComponent, 'getFormByTaskId').and.stub();
        spyOn(formComponent, 'getFormById').and.stub();

        formComponent.taskId = null;
        formComponent.formId = null;
        formComponent.loadForm();

        expect(formComponent.getFormByTaskId).not.toHaveBeenCalled();
        expect(formComponent.getFormById).not.toHaveBeenCalled();
    });

    xit('should not reload form on binding changes', () => {
        spyOn(formComponent, 'getFormByTaskId').and.stub();
        spyOn(formComponent, 'getFormById').and.stub();

        formComponent.ngOnChanges({ 'tag': new SimpleChange(null, 'hello world', true) });

        expect(formComponent.getFormByTaskId).not.toHaveBeenCalled();
        expect(formComponent.getFormById).not.toHaveBeenCalled();
    });

    it('should complete form on custom outcome click', () => {
        let formModel = new FormCloudModel();
        let outcomeName = 'Custom Action';
        let outcome = new FormOutcomeModel(<any>formModel, { id: 'custom1', name: outcomeName });

        let saved = false;
        formComponent.form = formModel;
        formComponent.formSaved.subscribe((v) => saved = true);
        spyOn(formComponent, 'completeTaskForm').and.stub();

        let result = formComponent.onOutcomeClicked(outcome);
        expect(result).toBeTruthy();
        expect(saved).toBeTruthy();
        expect(formComponent.completeTaskForm).toHaveBeenCalledWith(outcomeName);
    });

    it('should save form on [save] outcome click', () => {
        let formModel = new FormCloudModel();
        let outcome = new FormOutcomeModel(<any>formModel, {
            id: FormCloudComponent.SAVE_OUTCOME_ID,
            name: 'Save',
            isSystem: true
        });

        formComponent.form = formModel;
        spyOn(formComponent, 'saveTaskForm').and.stub();

        let result = formComponent.onOutcomeClicked(outcome);
        expect(result).toBeTruthy();
        expect(formComponent.saveTaskForm).toHaveBeenCalled();
    });

    it('should complete form on [complete] outcome click', () => {
        let formModel = new FormCloudModel();
        let outcome = new FormOutcomeModel(<any>formModel, {
            id: FormCloudComponent.COMPLETE_OUTCOME_ID,
            name: 'Complete',
            isSystem: true
        });

        formComponent.form = formModel;
        spyOn(formComponent, 'completeTaskForm').and.stub();

        let result = formComponent.onOutcomeClicked(outcome);
        expect(result).toBeTruthy();
        expect(formComponent.completeTaskForm).toHaveBeenCalled();
    });

    it('should emit form saved event on custom outcome click', () => {
        let formModel = new FormCloudModel();
        let outcome = new FormOutcomeModel(<any>formModel, {
            id: FormCloudComponent.CUSTOM_OUTCOME_ID,
            name: 'Custom',
            isSystem: true
        });

        let saved = false;
        formComponent.form = formModel;
        formComponent.formSaved.subscribe((v) => saved = true);

        let result = formComponent.onOutcomeClicked(outcome);
        expect(result).toBeTruthy();
        expect(saved).toBeTruthy();
    });

    it('should do nothing when clicking outcome for readonly form', () => {
        let formModel = new FormCloudModel();
        const outcomeName = 'Custom Action';
        let outcome = new FormOutcomeModel(<any>formModel, { id: 'custom1', name: outcomeName });

        formComponent.form = formModel;
        spyOn(formComponent, 'completeTaskForm').and.stub();

        expect(formComponent.onOutcomeClicked(outcome)).toBeTruthy();
        formComponent.readOnly = true;
        expect(formComponent.onOutcomeClicked(outcome)).toBeFalsy();
    });

    it('should require outcome model when clicking outcome', () => {
        formComponent.form = new FormCloudModel();
        formComponent.readOnly = false;
        expect(formComponent.onOutcomeClicked(null)).toBeFalsy();
    });

    it('should require loaded form when clicking outcome', () => {
        let formModel = new FormCloudModel();
        const outcomeName = 'Custom Action';
        let outcome = new FormOutcomeModel(<any>formModel, { id: 'custom1', name: outcomeName });

        formComponent.readOnly = false;
        formComponent.form = null;
        expect(formComponent.onOutcomeClicked(outcome)).toBeFalsy();
    });

    it('should not execute unknown system outcome', () => {
        let formModel = new FormCloudModel();
        let outcome = new FormOutcomeModel(<any>formModel, { id: 'unknown', name: 'Unknown', isSystem: true });

        formComponent.form = formModel;
        expect(formComponent.onOutcomeClicked(outcome)).toBeFalsy();
    });

    it('should require custom action name to complete form', () => {
        let formModel = new FormCloudModel();
        let outcome = new FormOutcomeModel(<any>formModel, { id: 'custom' });

        formComponent.form = formModel;
        expect(formComponent.onOutcomeClicked(outcome)).toBeFalsy();

        outcome = new FormOutcomeModel(<any>formModel, { id: 'custom', name: 'Custom' });
        spyOn(formComponent, 'completeTaskForm').and.stub();
        expect(formComponent.onOutcomeClicked(outcome)).toBeTruthy();
    });

    it('should fetch and parse form by task id', (done) => {
        const appName = 'test-app';
        const taskId = '456';

        spyOn(formService, 'getTask').and.returnValue(of({}));
        spyOn(formService, 'getTaskVariables').and.returnValue(of({}));
        spyOn(formService, 'getTaskForm').and.returnValue(of({formRepresentation: {taskId: taskId, formDefinition: {selectedOutcome: 'custom-outcome'}}}));

        formComponent.formLoaded.subscribe(() => {
            expect(formService.getTaskForm).toHaveBeenCalledWith(appName, taskId);
            expect(formComponent.form).toBeDefined();
            expect(formComponent.form.taskId).toBe(taskId);
            done();
        });

        formComponent.appName = appName;
        formComponent.taskId = taskId;
        formComponent.loadForm();
    });

    it('should handle error when getting form by task id', (done) => {
        const error = 'Some error';

        spyOn(formService, 'getTask').and.returnValue(of({}));
        spyOn(formService, 'getTaskVariables').and.returnValue(of({}));
        spyOn(formComponent, 'handleError').and.stub();
        spyOn(formService, 'getTaskForm').and.callFake(() => {
            return throwError(error);
        });

        formComponent.getFormByTaskId('test-app', '123').then((_) => {
            expect(formComponent.handleError).toHaveBeenCalledWith(error);
            done();
        });
    });

    it('should fetch and parse form definition by id', (done) => {
        spyOn(formService, 'getForm').and.callFake((appName, currentFormId) => {
            return new Observable((observer) => {
                observer.next({ formRepresentation: {id: currentFormId, formDefinition: {}}});
                observer.complete();
            });
        });

        const appName = 'test-app';
        const formId = '456';
        formComponent.formLoaded.subscribe(() => {
            expect(formComponent.form).toBeDefined();
            expect(formComponent.form.id).toBe(formId);
            done();
        });

        formComponent.appName = appName;
        formComponent.formId = formId;
        formComponent.loadForm();        
    });

    it('should handle error when getting form by definition id', () => {
        const error = 'Some error';

        spyOn(formComponent, 'handleError').and.stub();
        spyOn(formService, 'getForm').and.callFake(() => throwError(error));

        formComponent.getFormById('test-app', '123');
        expect(formComponent.handleError).toHaveBeenCalledWith(error);
    });

    it('should save task form and raise corresponding event', () => {
        spyOn(formService, 'saveTaskForm').and.callFake(() => {
            return new Observable((observer) => {
                observer.next();
                observer.complete();
            });
        });

        let saved = false;
        let savedForm = null;
        formComponent.formSaved.subscribe((form) => {
            saved = true;
            savedForm = form;
        });

        const taskId = '123-223';
        const appName = 'test-app';

        const formModel = new FormCloudModel({
            formRepresentation: {
                id: '23',
                taskId: taskId,
                formDefinition: {
                    fields: [
                        { id: 'field1' },
                        { id: 'field2' }
                    ]
                }
            }
        });
        formComponent.form = formModel;
        formComponent.taskId = taskId;
        formComponent.appName = appName;

        formComponent.saveTaskForm();

        expect(formService.saveTaskForm).toHaveBeenCalledWith(appName, formModel.taskId, formModel.id, formModel.values);
        expect(saved).toBeTruthy();
        expect(savedForm).toEqual(formModel);
    });

    it('should handle error during form save', () => {
        const error = 'Error';
        spyOn(formService, 'saveTaskForm').and.callFake(() => throwError(error));
        spyOn(formComponent, 'handleError').and.stub();

        const taskId = '123-223';
        const appName = 'test-app';
        const formModel = new FormCloudModel({
            formRepresentation: {
                id: '23',
                taskId: taskId,
                formDefinition: {
                    fields: [
                        { id: 'field1' },
                        { id: 'field2' }
                    ]
                }
            }
        });
        formComponent.form = formModel;
        formComponent.taskId = taskId;
        formComponent.appName = appName;

        formComponent.saveTaskForm();

        expect(formComponent.handleError).toHaveBeenCalledWith(error);
    });

    it('should require form with appName and taskId to save', () => {
        spyOn(formService, 'saveTaskForm').and.stub();

        formComponent.form = null;
        formComponent.saveTaskForm();

        formComponent.form = new FormCloudModel();

        formComponent.appName = 'test-app';
        formComponent.saveTaskForm();

        formComponent.appName = null;
        formComponent.taskId = '123';
        formComponent.saveTaskForm();

        expect(formService.saveTaskForm).not.toHaveBeenCalled();
    });

    it('should require form with appName and taskId to complete', () => {
        spyOn(formService, 'completeTaskForm').and.stub();

        formComponent.form = null;
        formComponent.completeTaskForm('save');

        formComponent.form = new FormCloudModel();
        formComponent.appName = 'test-app';
        formComponent.completeTaskForm('complete');

        formComponent.appName = null;
        formComponent.taskId = '123';
        formComponent.completeTaskForm('complete');

        expect(formService.completeTaskForm).not.toHaveBeenCalled();
    });

    it('should complete form and raise corresponding event', () => {
        spyOn(formService, 'completeTaskForm').and.callFake(() => {
            return new Observable((observer) => {
                observer.next();
                observer.complete();
            });
        });

        const outcome = 'complete';
        let completed = false;
        formComponent.formCompleted.subscribe(() => completed = true);

        const taskId = '123-223';
        const appName = 'test-app';
        const formModel = new FormCloudModel({
            formRepresentation: {
                id: '23',
                taskId: taskId,
                formDefinition: {
                    fields: [
                        { id: 'field1' },
                        { id: 'field2' }
                    ]
                }
            }
        });

        formComponent.form = formModel;
        formComponent.taskId = taskId;
        formComponent.appName = appName;
        formComponent.completeTaskForm(outcome);

        expect(formService.completeTaskForm).toHaveBeenCalledWith(appName, formModel.taskId, formModel.id, formModel.values, outcome);
        expect(completed).toBeTruthy();
    });

    it('should require json to parse form', () => {
        expect(formComponent.parseForm(null)).toBeNull();
    });

    it('should parse form from json', () => {
        let form = formComponent.parseForm({
            formRepresentation: {
                id: '1',
                formDefinition: {
                    fields: [
                        { id: 'field1', type: FormFieldTypes.CONTAINER }
                    ]
                }
            }
        });

        expect(form).toBeDefined();
        expect(form.id).toBe('1');
        expect(form.fields.length).toBe(1);
        expect(form.fields[0].id).toBe('field1');
    });

    it('should provide outcomes for form definition', () => {
        spyOn(formComponent, 'getFormDefinitionOutcomes').and.callThrough();

        let form = formComponent.parseForm({ formRepresentation:{ id: 1, formDefinition: {}}});
        expect(formComponent.getFormDefinitionOutcomes).toHaveBeenCalledWith(form);
    });

    it('should prevent default outcome execution', () => {

        let outcome = new FormOutcomeModel(<any>new FormCloudModel(), {
            id: FormCloudComponent.CUSTOM_OUTCOME_ID,
            name: 'Custom'
        });

        formComponent.form = new FormCloudModel();
        formComponent.executeOutcome.subscribe((event: FormOutcomeEvent) => {
            expect(event.outcome).toBe(outcome);
            event.preventDefault();
            expect(event.defaultPrevented).toBeTruthy();
        });

        let result = formComponent.onOutcomeClicked(outcome);
        expect(result).toBeFalsy();
    });

    it('should not prevent default outcome execution', () => {
        let outcome = new FormOutcomeModel(<any>new FormCloudModel(), {
            id: FormCloudComponent.CUSTOM_OUTCOME_ID,
            name: 'Custom'
        });

        formComponent.form = new FormCloudModel();
        formComponent.executeOutcome.subscribe((event: FormOutcomeEvent) => {
            expect(event.outcome).toBe(outcome);
            expect(event.defaultPrevented).toBeFalsy();
        });

        spyOn(formComponent, 'completeTaskForm').and.callThrough();

        let result = formComponent.onOutcomeClicked(outcome);
        expect(result).toBeTruthy();

        expect(formComponent.completeTaskForm).toHaveBeenCalledWith(outcome.name);
    });

    it('should check visibility only if field with form provided', () => {

        formComponent.checkVisibility(null);
        expect(visibilityService.refreshVisibility).not.toHaveBeenCalled();

        let field = new FormFieldModel(null);
        formComponent.checkVisibility(field);
        expect(visibilityService.refreshVisibility).not.toHaveBeenCalled();

        field = new FormFieldModel(<any>new FormCloudModel());
        formComponent.checkVisibility(field);
        expect(visibilityService.refreshVisibility).toHaveBeenCalledWith(field.form);
    });

    it('should disable outcome buttons for readonly form', () => {
        let formModel = new FormCloudModel();
        formModel.readOnly = true;
        formComponent.form = formModel;

        let outcome = new FormOutcomeModel(<any>new FormCloudModel(), {
            id: FormCloudComponent.CUSTOM_OUTCOME_ID,
            name: 'Custom'
        });

        expect(formComponent.isOutcomeButtonEnabled(outcome)).toBeFalsy();
    });

    it('should require outcome to eval button state', () => {
        formComponent.form = new FormCloudModel();
        expect(formComponent.isOutcomeButtonEnabled(null)).toBeFalsy();
    });

    it('should disable complete outcome button when disableCompleteButton is true', () => {
        let formModel = new FormCloudModel();
        formComponent.form = formModel;
        formComponent.disableCompleteButton = true;

        expect(formModel.isValid).toBeTruthy();
        let completeOutcome = formComponent.form.outcomes.find((outcome) => outcome.name === FormOutcomeModel.COMPLETE_ACTION);

        expect(formComponent.isOutcomeButtonEnabled(completeOutcome)).toBeFalsy();
    });

    it('should disable start process outcome button when disableStartProcessButton is true', () => {
        let formModel = new FormCloudModel();
        formComponent.form = formModel;
        formComponent.disableStartProcessButton = true;

        expect(formModel.isValid).toBeTruthy();
        let startProcessOutcome = formComponent.form.outcomes.find((outcome) => outcome.name === FormOutcomeModel.START_PROCESS_ACTION);

        expect(formComponent.isOutcomeButtonEnabled(startProcessOutcome)).toBeFalsy();
    });

    it('should raise [executeOutcome] event for formService', (done) => {
        formComponent.executeOutcome.subscribe(() => {
            done();
        });

        let outcome = new FormOutcomeModel(<any>new FormCloudModel(), {
            id: FormCloudComponent.CUSTOM_OUTCOME_ID,
            name: 'Custom'
        });

        formComponent.form = new FormCloudModel();
        formComponent.onOutcomeClicked(outcome);
    });

    it('should refresh form values when data is changed', () => {
        formComponent.form = new FormCloudModel(JSON.parse(JSON.stringify(cloudFormMock)));
        let formFields = formComponent.form.getFormFields();

        let labelField = formFields.find((field) => field.id === 'text1');
        let radioField = formFields.find((field) => field.id === 'number1');
        expect(labelField.value).toBeNull();
        expect(radioField.value).toBeUndefined();

        let formValues: any = {text1: 'test', number1: 23};
    
        let change = new SimpleChange(null, formValues, false);
        formComponent.data = formValues;
        formComponent.ngOnChanges({ 'data': change });

        formFields = formComponent.form.getFormFields();
        labelField = formFields.find((field) => field.id === 'text1');
        radioField = formFields.find((field) => field.id === 'number1');
        expect(labelField.value).toBe('test');
        expect(radioField.value).toBe(23);
    });

    it('should refresh radio buttons value when id is given to data', () => {
        formComponent.form = new FormCloudModel(JSON.parse(JSON.stringify(cloudFormMock)));
        let formFields = formComponent.form.getFormFields();
        let radioFieldById = formFields.find((field) => field.id === 'radiobuttons1');

        let formValues: any = {radiobuttons1: 'option_2'};
        let change = new SimpleChange(null, formValues, false);
        formComponent.data = formValues;
        formComponent.ngOnChanges({ 'data': change });

        formFields = formComponent.form.getFormFields();
        radioFieldById = formFields.find((field) => field.id === 'radiobuttons1');
        expect(radioFieldById.value).toBe('option_2');
    });
});
