/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
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

var FormFields = require('../formFields');
var Util = require('../../../../util/util');


var DynamicTable = function () {

    var formFields = new FormFields();

    var labelLocator = by.css("dynamic-table-widget div div");
    var columnNameLocator = by.css("table[id*='dynamic-table'] th");
    var addButton = element(by.id("label-add-row"));
    var addRow = element(by.id("dynamictable-add-row"));
    var columnDateTime = element(by.id("columnDateTime"));
    var columnDate = element(by.id("columnDate"));
    var calendarHeader = element(by.css("div[class='mat-datetimepicker-calendar-header-date-time']"));
    var calendarContent = element(by.css("div[class='mat-datetimepicker-calendar-content']"));
    var saveButton = element(by.cssContainingText('button span', 'Save'));
    var cancelButton = element(by.cssContainingText('button span', 'Cancel'));
    var editButton = element(by.cssContainingText('button span', 'edit'));
    var errorMessage = element(by.css('div[class="adf-error-text"]'));
    var dateWidget = element(by.css('button[aria-label="Open calendar"]'));
    var calendarNumber = element.all(by.css('td div'));
    var tableRow = element.all(by.css('tbody tr'));
    var datatableInput = element(by.id("id"));

    this.setDatatableInput = function (text) {
        Util.waitUntilElementIsVisible(datatableInput);
        datatableInput.clear();
        return datatableInput.sendKeys(text);
    };

    this.getFieldLabel = function (fieldId) {
        return formFields.getFieldLabel(fieldId, labelLocator);
    };

    this.getColumnName = function (fieldId) {
        return formFields.getFieldText(fieldId, columnNameLocator);
    };

    this.clickAddButton = function () {
        Util.waitUntilElementIsVisible(addButton);
        return addButton.click();
    };

    this.clickAddRow = function () {
        Util.waitUntilElementIsVisible(addRow);
        return addRow.click();
    };

    this.clickEditButton = function () {
        Util.waitUntilElementIsVisible(editButton);
        return editButton.click();
    };

    this.clickColumnDateTime = function () {
        Util.waitUntilElementIsVisible(columnDateTime);
        columnDateTime.click();
        Util.waitUntilElementIsVisible(calendarHeader);
        Util.waitUntilElementIsVisible(calendarContent);
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
    };

    this.addRandomStringOnDateTime = function (randomText) {
        Util.waitUntilElementIsVisible(columnDateTime);
        columnDateTime.click();
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        columnDateTime.sendKeys(randomText);
        columnDateTime.sendKeys(protractor.Key.ENTER);
        return columnDateTime.getAttribute('value');
    };
    
    this.addRandomStringOnDate = function(randomText) {
        Util.waitUntilElementIsVisible(columnDate);
        columnDate.click();
        return columnDate.sendKeys(randomText);
    }; 
    
    this.clickSaveButton = function () {
        Util.waitUntilElementIsVisible(saveButton);
        return saveButton.click();
    };

    this.clickCancelButton = function () {
        Util.waitUntilElementIsVisible(cancelButton);
        return cancelButton.click();
    };

    this.checkErrorMessage = function () {
        Util.waitUntilElementIsVisible(errorMessage);
        return errorMessage.getText();
    };

    this.clickDateWidget = function () {
        Util.waitUntilElementIsVisible(dateWidget);
        return dateWidget.click();
    };

    this.getDateCalendarNumber = function (date) {
        return calendarNumber.get(date).click();
    };

    this.getTableRow = function (rowNumber) {
        return Util.waitUntilElementIsVisible(tableRow.get(rowNumber));
    };

    this.clickTableRow = function (rowNumber) {
        let tableRowByIndex = element(by.id('dynamictable-row-' + rowNumber));
        Util.waitUntilElementIsVisible(tableRowByIndex);
        return tableRowByIndex.click();
    };

    this.getTableRow = function (rowNumber) {
        let tableRowByIndex = element(by.id('dynamictable-row-' + rowNumber));
        Util.waitUntilElementIsVisible(tableRowByIndex);
        return tableRowByIndex.getText();
    };

    this.checkTableRowIsVisible = function (rowNumber) {
        let tableRowByIndex = element(by.id('dynamictable-row-' + rowNumber));
        return Util.waitUntilElementIsVisible(tableRowByIndex);
    };

    this.checkTableRowIsNotVisible = function (rowNumber) {
        let tableRowByIndex = element(by.id('dynamictable-row-' + rowNumber));
        return Util.waitUntilElementIsNotVisible(tableRowByIndex);
    };

    this.getTableRow = function (rowNumber) {
        let tableRowByIndex = element(by.css('tr[id="dynamictable-row-' + rowNumber));
        Util.waitUntilElementIsVisible(tableRowByIndex);
        return tableRowByIndex.getText();
    };

    this.waitForCalendarToDisappear = function () {
        Util.waitUntilElementIsNotVisible(calendarNumber);
    };
};

module.exports = DynamicTable;