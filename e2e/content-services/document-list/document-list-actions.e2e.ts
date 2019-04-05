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

import { browser } from 'protractor';
import { LoginPage } from '@alfresco/adf-testing';
import { ContentServicesPage } from '../../pages/adf/contentServicesPage';
import { NavigationBarPage } from '../../pages/adf/navigationBarPage';
import { AcsUserModel } from '../../models/ACS/acsUserModel';
import TestConfig = require('../../test.config');
import resources = require('../../util/resources');
import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';
import { UploadActions } from '../../actions/ACS/upload.actions';
import { FileModel } from '../../models/ACS/fileModel';
import { StringUtil } from '@alfresco/adf-testing';
import { Util } from '../../util/util';
import { CopyMoveDialog } from '../../pages/adf/dialog/copyMoveDialog';
import { PaginationPage } from '../../pages/adf/paginationPage';
import { NotificationPage } from '../../pages/adf/notificationPage';
import { BreadCrumbPage } from '../../pages/adf/content-services/breadcrumb/breadCrumbPage';
import { BreadCrumbDropdownPage } from '../../pages/adf/content-services/breadcrumb/breadCrumbDropdownPage';
import { FolderModel } from '../../models/ACS/folderModel';

describe('Document List Component - Actions', () => {

    const loginPage = new LoginPage();
    const contentServicesPage = new ContentServicesPage();
    const navigationBarPage = new NavigationBarPage();
    const contentListPage = contentServicesPage.getDocumentList();
    const copyMoveDialog = new CopyMoveDialog();
    const paginationPage = new PaginationPage();
    const notificationPage = new NotificationPage();
    const breadCrumbPage = new BreadCrumbPage();
    const breadCrumbDropdownPage = new BreadCrumbDropdownPage();

    let uploadedFolder, secondUploadedFolder;
    const uploadActions = new UploadActions();
    let acsUser = null;
    let pdfUploadedNode;
    let folderName;
    let fileNames = [];
    const nrOfFiles = 5;

    const pdfFileModel = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.PDF.file_name,
        'location': resources.Files.ADF_DOCUMENTS.PDF.file_location
    });
    const testFileModel = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.TEST.file_name,
        'location': resources.Files.ADF_DOCUMENTS.TEST.file_location
    });

    const files = {
        base: 'newFile',
        extension: '.txt'
    };
    let alfrescoJsApi = new AlfrescoApi({
        provider: 'ECM',
        hostEcm: TestConfig.adf.url
    });

    beforeAll(async (done) => {

        acsUser = new AcsUserModel();
        folderName = `TATSUMAKY_${StringUtil.generateRandomString(5)}_SENPOUKYAKU`;
        await alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
        await alfrescoJsApi.core.peopleApi.addPerson(acsUser);
        await alfrescoJsApi.login(acsUser.id, acsUser.password);
        pdfUploadedNode = await uploadActions.uploadFile(alfrescoJsApi, pdfFileModel.location, pdfFileModel.name, '-my-');
        await uploadActions.uploadFile(alfrescoJsApi, testFileModel.location, testFileModel.name, '-my-');
        uploadedFolder = await uploadActions.createFolder(alfrescoJsApi, folderName, '-my-');
        secondUploadedFolder = await uploadActions.createFolder(alfrescoJsApi, 'secondFolder', '-my-');

        fileNames = Util.generateSequenceFiles(1, nrOfFiles, files.base, files.extension);
        await uploadActions.createEmptyFiles(alfrescoJsApi, fileNames, uploadedFolder.entry.id);

        loginPage.loginToContentServicesUsingUserModel(acsUser);

        browser.driver.sleep(15000);
        done();
    });

    beforeEach(async (done) => {
        navigationBarPage.clickAboutButton();
        navigationBarPage.clickContentServicesButton();
        done();
    });

    describe('File Actions', () => {

        it('[C213257] Should be able to copy a file', () => {
            contentServicesPage.checkContentIsDisplayed(pdfUploadedNode.entry.name);

            contentServicesPage.getDocumentList().rightClickOnRow(pdfFileModel.name);
            contentServicesPage.pressContextMenuActionNamed('Copy');

            contentServicesPage.typeIntoNodeSelectorSearchField(folderName);
            contentServicesPage.clickContentNodeSelectorResult(folderName);
            contentServicesPage.clickChooseButton();
            contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);
            contentServicesPage.doubleClickRow(uploadedFolder.entry.name);
            contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);
        });

        it('[C297491] Should be able to move a file', () => {
            contentServicesPage.checkContentIsDisplayed(testFileModel.name);

            contentServicesPage.getDocumentList().rightClickOnRow(testFileModel.name);
            contentServicesPage.pressContextMenuActionNamed('Move');
            contentServicesPage.typeIntoNodeSelectorSearchField(folderName);
            contentServicesPage.clickContentNodeSelectorResult(folderName);
            contentServicesPage.clickChooseButton();
            contentServicesPage.checkContentIsNotDisplayed(testFileModel.name);
            contentServicesPage.doubleClickRow(uploadedFolder.entry.name);
            contentServicesPage.checkContentIsDisplayed(testFileModel.name);
        });

        it('[C280561] Should be able to delete a file via dropdown menu', () => {
            contentServicesPage.doubleClickRow(uploadedFolder.entry.name);

            contentServicesPage.checkContentIsDisplayed(fileNames[0]);
            contentServicesPage.deleteContent(fileNames[0]);
            contentServicesPage.checkContentIsNotDisplayed(fileNames[0]);
        });

        it('[C280562] Only one file is deleted when multiple files are selected using dropdown menu', () => {
            contentServicesPage.doubleClickRow(uploadedFolder.entry.name);

            contentListPage.selectRow(fileNames[1]);
            contentListPage.selectRow(fileNames[2]);
            contentServicesPage.deleteContent(fileNames[1]);
            contentServicesPage.checkContentIsNotDisplayed(fileNames[1]);
            contentServicesPage.checkContentIsDisplayed(fileNames[2]);
        });

        it('[C280565] Should be able to delete a file using context menu', () => {
            contentServicesPage.doubleClickRow(uploadedFolder.entry.name);

            contentListPage.rightClickOnRow(fileNames[2]);
            contentServicesPage.pressContextMenuActionNamed('Delete');
            contentServicesPage.checkContentIsNotDisplayed(fileNames[2]);
        });

        it('[C280567] Only one file is deleted when multiple files are selected using context menu', () => {
            contentServicesPage.doubleClickRow(uploadedFolder.entry.name);

            contentListPage.selectRow(fileNames[3]);
            contentListPage.selectRow(fileNames[4]);
            contentListPage.rightClickOnRow(fileNames[3]);
            contentServicesPage.pressContextMenuActionNamed('Delete');
            contentServicesPage.checkContentIsNotDisplayed(fileNames[3]);
            contentServicesPage.checkContentIsDisplayed(fileNames[4]);
        });

        it('[C280566] Should be able to open context menu with right click', () => {
            contentServicesPage.getDocumentList().rightClickOnRow(pdfFileModel.name);
            contentServicesPage.checkContextActionIsVisible('Download');
            contentServicesPage.checkContextActionIsVisible('Copy');
            contentServicesPage.checkContextActionIsVisible('Move');
            contentServicesPage.checkContextActionIsVisible('Delete');
            contentServicesPage.checkContextActionIsVisible('Info');
            contentServicesPage.checkContextActionIsVisible('Manage versions');
            contentServicesPage.checkContextActionIsVisible('Permission');
            contentServicesPage.checkContextActionIsVisible('Lock');
            contentServicesPage.closeActionContext();
        });

    });

    describe('Folder Actions', () => {

        it('[C260138] Should be able to copy a folder', () => {
            contentServicesPage.copyContent(folderName);
            contentServicesPage.typeIntoNodeSelectorSearchField(secondUploadedFolder.entry.name);
            contentServicesPage.clickContentNodeSelectorResult(secondUploadedFolder.entry.name);
            contentServicesPage.clickChooseButton();
            contentServicesPage.checkContentIsDisplayed(folderName);
            contentServicesPage.doubleClickRow(secondUploadedFolder.entry.name);
            contentServicesPage.checkContentIsDisplayed(folderName);
        });

        it('[C260123] Should be able to delete a folder using context menu', () => {
            contentServicesPage.deleteContent(folderName);
            contentServicesPage.checkContentIsNotDisplayed(folderName);
        });

        it('[C280568] Should be able to open context menu with right click', () => {
            contentServicesPage.checkContentIsDisplayed(secondUploadedFolder.entry.name);

            contentListPage.rightClickOnRow(secondUploadedFolder.entry.name);
            contentServicesPage.checkContextActionIsVisible('Download');
            contentServicesPage.checkContextActionIsVisible('Copy');
            contentServicesPage.checkContextActionIsVisible('Move');
            contentServicesPage.checkContextActionIsVisible('Delete');
            contentServicesPage.checkContextActionIsVisible('Info');
            contentServicesPage.checkContextActionIsVisible('Permission');
        });

    });

    describe('Folder Actions - Copy and Move', () => {

        const folderModel1 = new FolderModel({'name': StringUtil.generateRandomString()});
        const folderModel2 = new FolderModel({'name': StringUtil.generateRandomString()});
        const folderModel3 = new FolderModel({'name': StringUtil.generateRandomString()});
        const folderModel4 = new FolderModel({'name': StringUtil.generateRandomString()});
        const folderModel5 = new FolderModel({'name': StringUtil.generateRandomString()});
        const folderModel6 = new FolderModel({'name': StringUtil.generateRandomString()});

        let folder1, folder2, folder3, folder4, folder5, folder6;

        let folders;
        const contentServicesUser = new AcsUserModel();

        beforeAll(async (done) => {

            await alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
            await alfrescoJsApi.core.peopleApi.addPerson(contentServicesUser);
            await alfrescoJsApi.login(contentServicesUser.id, contentServicesUser.password);
            folder1 = await uploadActions.createFolder(alfrescoJsApi, 'A' + folderModel1.name, '-my-');
            folder2 = await uploadActions.createFolder(alfrescoJsApi, 'B' + folderModel2.name, '-my-');
            folder3 = await uploadActions.createFolder(alfrescoJsApi, 'C' + folderModel3.name, '-my-');
            folder4 = await uploadActions.createFolder(alfrescoJsApi, 'D' + folderModel4.name, '-my-');
            folder5 = await uploadActions.createFolder(alfrescoJsApi, 'E' + folderModel5.name, '-my-');
            folder6 = await uploadActions.createFolder(alfrescoJsApi, 'F' + folderModel6.name, '-my-');
            folders = [folder1, folder2, folder3, folder4, folder5, folder6];
            done();
        });

        beforeEach(async (done) => {
            loginPage.loginToContentServicesUsingUserModel(contentServicesUser);
            contentServicesPage.goToDocumentList();
            contentServicesPage.waitForTableBody();
            paginationPage.selectItemsPerPage('5');
            contentServicesPage.checkAcsContainer();
            contentListPage.waitForTableBody();
            done();
        });

        afterAll(async (done) => {
            await alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
            await folders.forEach(function (folder) {
                uploadActions.deleteFilesOrFolder(alfrescoJsApi, folder.entry.id);
            });
            done();
        });

        fit('[C260132] Move action on folder with - Load more', () => {

            expect(paginationPage.getCurrentItemsPerPage()).toEqual('5');
            expect(paginationPage.getPaginationRange()).toEqual('Showing 1-' + 5 + ' of ' + 6);
            contentListPage.rightClickOnRow('A' + folderModel1.name);
            contentServicesPage.checkContextActionIsVisible('Move');
            contentServicesPage.pressContextMenuActionNamed('Move');
            copyMoveDialog.checkDialogIsDisplayed();
            expect(copyMoveDialog.getDialogHeaderText()).toBe('Move \'' + 'A' + folderModel1.name + '\' to...');
            copyMoveDialog.checkSearchInputIsDisplayed();
            expect(copyMoveDialog.getSearchLabel()).toBe('Search');
            copyMoveDialog.checkSelectedSiteIsDisplayed('My files');
            copyMoveDialog.checkCancelButtonIsDisplayed();
            copyMoveDialog.checkMoveCopyButtonIsDisplayed();
            expect(copyMoveDialog.getMoveCopyButtonText()).toBe('MOVE');
            expect(copyMoveDialog.numberOfResultsDisplayed()).toBe(5);
            copyMoveDialog.clickLoadMoreButton();
            expect(copyMoveDialog.numberOfResultsDisplayed()).toBe(6);
            copyMoveDialog.checkLoadMoreButtonIsNotDisplayed();
            copyMoveDialog.selectRow('F' + folderModel6.name);
            copyMoveDialog.checkRowIsSelected('F' + folderModel6.name);
            copyMoveDialog.clickCancelButton();
            copyMoveDialog.checkDialogIsNotDisplayed();
            contentServicesPage.checkContentIsDisplayed('A' + folderModel1.name);

            contentListPage.rightClickOnRow('A' + folderModel1.name);
            contentServicesPage.checkContextActionIsVisible('Move');
            contentServicesPage.pressContextMenuActionNamed('Move');
            copyMoveDialog.checkDialogIsDisplayed();
            copyMoveDialog.clickLoadMoreButton();
            copyMoveDialog.selectRow('F' + folderModel6.name);
            copyMoveDialog.checkRowIsSelected('F' + folderModel6.name);
            copyMoveDialog.clickMoveCopyButton().then(() => {
                notificationPage.checkNotifyContains('Move successful');
            });
            contentServicesPage.checkContentIsNotDisplayed('A' + folderModel1.name);
            contentServicesPage.doubleClickRow('F' + folderModel6.name);
            contentServicesPage.checkContentIsDisplayed('A' + folderModel1.name);

            contentListPage.rightClickOnRow('A' + folderModel1.name);
            contentServicesPage.checkContextActionIsVisible('Move');
            contentServicesPage.pressContextMenuActionNamed('Move');
            copyMoveDialog.checkDialogIsDisplayed();
            breadCrumbDropdownPage.clickParentFolder();
            breadCrumbDropdownPage.checkBreadCrumbDropdownIsDisplayed();
            breadCrumbDropdownPage.choosePath(contentServicesUser.id);
            contentListPage.waitForTableBody();
            copyMoveDialog.clickMoveCopyButton();
            contentServicesPage.checkContentIsNotDisplayed('A' + folderModel1.name);

            breadCrumbPage.chooseBreadCrumb(contentServicesUser.id);
            contentListPage.waitForTableBody();
            contentServicesPage.checkContentIsDisplayed('A' + folderModel1.name);

        });

        it('[C305051] Copy action on folder with - Load more', () => {

            expect(paginationPage.getCurrentItemsPerPage()).toEqual('5');
            expect(paginationPage.getPaginationRange()).toEqual('Showing 1-' + 5 + ' of ' + 6);
            contentListPage.rightClickOnRow('A' + folderModel1.name);
            contentServicesPage.checkContextActionIsVisible('Copy');
            contentServicesPage.pressContextMenuActionNamed('Copy');
            copyMoveDialog.checkDialogIsDisplayed();
            expect(copyMoveDialog.getDialogHeaderText()).toBe('Copy \'' + 'A' + folderModel1.name + '\' to...');
            copyMoveDialog.checkSearchInputIsDisplayed();
            expect(copyMoveDialog.getSearchLabel()).toBe('Search');
            copyMoveDialog.checkSelectedSiteIsDisplayed('My files');
            copyMoveDialog.checkCancelButtonIsDisplayed();
            copyMoveDialog.checkMoveCopyButtonIsDisplayed();
            expect(copyMoveDialog.getMoveCopyButtonText()).toBe('COPY');
            expect(copyMoveDialog.numberOfResultsDisplayed()).toBe(5);
            copyMoveDialog.clickLoadMoreButton();
            expect(copyMoveDialog.numberOfResultsDisplayed()).toBe(6);
            copyMoveDialog.checkLoadMoreButtonIsNotDisplayed();
            copyMoveDialog.selectRow('F' + folderModel6.name);
            copyMoveDialog.checkRowIsSelected('F' + folderModel6.name);
            copyMoveDialog.clickCancelButton();
            copyMoveDialog.checkDialogIsNotDisplayed();
            contentServicesPage.checkContentIsDisplayed('A' + folderModel1.name);

            contentListPage.rightClickOnRow('A' + folderModel1.name);
            contentServicesPage.checkContextActionIsVisible('Copy');
            contentServicesPage.pressContextMenuActionNamed('Copy');
            copyMoveDialog.checkDialogIsDisplayed();
            copyMoveDialog.clickLoadMoreButton();
            copyMoveDialog.selectRow('F' + folderModel6.name);
            copyMoveDialog.checkRowIsSelected('F' + folderModel6.name);
            copyMoveDialog.clickMoveCopyButton().then(() => {
                notificationPage.checkNotifyContains('Copy successful');
            });
            contentServicesPage.checkContentIsDisplayed('A' + folderModel1.name);
            paginationPage.clickOnNextPage();
            contentListPage.waitForTableBody();
            contentServicesPage.doubleClickRow('F' + folderModel6.name);
            contentServicesPage.checkContentIsDisplayed('A' + folderModel1.name);

        });

    });

});
