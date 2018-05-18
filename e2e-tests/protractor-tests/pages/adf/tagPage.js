/**
 * Created by Cristina Jalba on 20/02/2018.
 */

var TestConfig = require("../../test.config.js");
var Util = require("../../util/util.js");
var ContentList = require("./dialog/contentList.js");


var TagPage = function () {

    var tagURL = TestConfig.adf.base + TestConfig.adf.adf_port + "/tag";
    var addTagButton = element(by.css("button[id='add-tag']"));
    var insertNodeId = element(by.css("input[id='nodeId']"));
    var newTagInput = element(by.css("input[id='new-tag-text']"));
    var tagListRow = element(by.css("adf-tag-node-actions-list mat-list-item"));
    var tagListByNodeIdRow = element(by.css("adf-tag-node-list mat-chip"));
    var errorMessage = element(by.css("mat-hint[data-automation-id='errorMessage']"));
    var tagListRowLocator = by.css("adf-tag-node-actions-list mat-list-item div");
    var tagListByNodeIdRowLocator = by.css("adf-tag-node-list mat-chip span");
    var tagListContentServicesRowLocator = by.css("div[class='adf-list-tag']");

    this.goToTagPage = function () {
        browser.driver.get(tagURL);
        Util.waitUntilElementIsVisible(addTagButton);
        return this;
    };

    this.getNodeId = function () {
        Util.waitUntilElementIsVisible(insertNodeId);
        return insertNodeId.getAttribute('value');
    };

    this.insertNodeId = function (nodeId) {
        Util.waitUntilElementIsVisible(insertNodeId);
        return insertNodeId.sendKeys(nodeId);
    };

    this.addNewTagInput = function(tag) {
        Util.waitUntilElementIsVisible(newTagInput);
        newTagInput.sendKeys(tag);
        return this;
    };

    this.addTag = function(tag){
        this.addNewTagInput(tag);
        Util.waitUntilElementIsVisible(addTagButton);
        Util.waitUntilElementIsClickable(addTagButton);
        Util.waitUntilElementIsPresent(addTagButton);
        addTagButton.click();
        return this;
    };

    this.getNewTagInput = function() {
        Util.waitUntilElementIsVisible(newTagInput);
        return newTagInput.getAttribute('value');
    };

    this.getNewTagPlaceholder = function() {
        Util.waitUntilElementIsVisible(newTagInput);
        return newTagInput.getAttribute("placeholder");
    };

    this.addTagButtonIsEnabled = function() {
        Util.waitUntilElementIsVisible(addTagButton);
        return addTagButton.isEnabled();
    };

    this.checkTagIsDisplayedInTagList = function(tagName) {
        var tag = element(by.cssContainingText("div[id*='tag_name']", tagName));
        Util.waitUntilElementIsVisible(tag);
    };

    this.checkTagIsNotDisplayedInTagList = function(tagName) {
        var tag = element(by.cssContainingText("div[id*='tag_name']", tagName));
        Util.waitUntilElementIsNotOnPage(tag);
    };

    this.checkTagListIsEmpty = function() {
        Util.waitUntilElementIsNotOnPage(tagListRow);
    };

    this.checkTagIsDisplayedInTagListByNodeId = function(tagName) {
        var tag = element(by.cssContainingText("span[id*='tag_name']", tagName));
        Util.waitUntilElementIsVisible(tag);
    };

    this.checkTagListByNodeIdIsEmpty = function() {
        Util.waitUntilElementIsNotOnPage(tagListByNodeIdRow);
    };

    this.checkTagIsDisplayedInTagListContentServices = function(tagName) {
        var tag = element(by.cssContainingText("div[class='adf-list-tag'][id*='tag_name']", tagName));
        Util.waitUntilElementIsVisible(tag);
    };

    this.getErrorMessage = function() {
        Util.waitUntilElementIsPresent(errorMessage);
        return errorMessage.getText();
    };

    this.checkTagListIsOrderedAscending = function () {
        var deferred = protractor.promise.defer();
        new ContentList().checkListIsSorted(false, tagListRowLocator).then(function(result) {
            deferred.fulfill(result);
        });
        return deferred.promise;
    };

    this.checkTagListByNodeIdIsOrderedAscending = function () {
        var deferred = protractor.promise.defer();
        new ContentList().checkListIsSorted(false, tagListByNodeIdRowLocator).then(function(result) {
            deferred.fulfill(result);
        });
        return deferred.promise;
    };

    this.checkTagListContentServicesIsOrderedAscending = function () {
        var deferred = protractor.promise.defer();
        new ContentList().checkListIsSorted(false, tagListContentServicesRowLocator).then(function(result) {
            deferred.fulfill(result);
        });
        return deferred.promise;
    };

};
module.exports = TagPage;
