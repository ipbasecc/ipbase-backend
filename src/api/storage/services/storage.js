'use strict';

/**
 * storage service
 */
const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
const { basename, extname, dirname } = path;
const multer = require('multer');
const memoryStorage = multer.memoryStorage;


const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::storage.storage',({strapi}) => ({
    async find_belongedInfo_byStorageID(...args){
        const [ storage_id ] = args;
        // console.log('storage_id service',storage_id);
        let belongedInfo = {};
        const find_fn = async (id) => {
            const storage = await strapi.entityService.findOne('api::storage.storage',id,{
                populate: {
                    belonged_user: {
                        fields: ['id']
                    },
                    belonged_card: {
                        fields: ['id']
                    },
                    belonged_project: {
                        fields: ['id']
                    },
                    storage: {
                        fields: ['id']
                    }
                }
            })
            if(storage){
                if(storage.belonged_user?.id){
                    belongedInfo.user = storage.belonged_user.id;
                    return belongedInfo
                }
                if(storage.belonged_project?.id){
                    // console.log('storage.belonged_project service',storage.belonged_project?.id);
                    const project_id = storage.belonged_project.id;
                    const project = await strapi.service('api::project.project').find_projectByID(project_id)
                    if(project){
                        belongedInfo.project = project;
                        // console.log('belongedInfo project',belongedInfo);
                        return belongedInfo
                    }
                }
                if(storage.belonged_card?.id){
                    const card_id = storage.belonged_card.id;
                    const card = await strapi.service('api::card.card').find_cardByID(card_id)
                    if(card){
                        belongedInfo.card = card;
                        // console.log('belongedInfo card',belongedInfo);
                        const card_belongedInfo = await strapi.service('api::card.card').find_belongedInfo_byCardID(card.id);
                        if(card_belongedInfo){
                            belongedInfo.root_project = card_belongedInfo.belonged_project;
                            // console.log('belongedInfo root_project',belongedInfo);
                            return belongedInfo
                        }
                    }
                }
                if(storage.storage){
                    // console.log('storage.storage service',id);
                    const _storage_id = storage.storage.id
                    // console.log('storage.storage _storage_id service',_storage_id);
                    await find_fn(_storage_id);
                }
            }
        }
        await find_fn(storage_id);
        // console.log('belongedInfo',belongedInfo);
        return belongedInfo
    },
    async calc_collection_auth(...args){
        const ctx = strapi.requestContext.get();
        const [storage_id,user_id] = args
        // console.log('storage_id',storage_id);
        let auth;
        let fields_permission = []
        let members = {};

        const cala_auth = (members,member_roles,props) => {
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
            if(is_blocked){
                ctx.throw(401, '您已被管理员屏蔽，请联系管理员申诉')
            }
            let authed_fields
            if(props === 'root_project'){
                const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'card_storage');
                authed_fields = strapi.service('api::project.project').clac_authed_fields(ACL,'card_storage');
                auth = {
                    read: read,
                    create: create,
                    modify: modify,
                    remove: remove
                }
            } else {
                const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'storage');
                authed_fields = strapi.service('api::project.project').clac_authed_fields(ACL,'storage');
                auth = {
                    read: read,
                    create: create,
                    modify: modify,
                    remove: remove
                }
            }

            fields_permission = [...fields_permission, ...authed_fields]
            // console.log('belongedInfo service', auth, fields_permission);
            const data = { auth, fields_permission }
            return data
        }
        const belongedInfo = await strapi.service('api::storage.storage').find_belongedInfo_byStorageID(storage_id);
        
        if(belongedInfo){
            // console.log('belongedInfo belongedInfo',belongedInfo);
            if(belongedInfo.user_id === user_id){
                return auth = {
                    read: true,
                    create: true,
                    modify: true,
                    remove: true
                }
            }
            if(belongedInfo.project){
                const project_id = belongedInfo.project.id
                // console.log('project_id service', project_id);
                const project = await strapi.service('api::project.project').find_projectByID(project_id);
                if(project){
                    members = project.project_members;
                    const member_roles = project.member_roles;
                    // console.log('members service', members);
                    // console.log('user_id service', user_id);
                    if(members.filter(i => i.by_user.id === user_id).length > 0){
                        // console.log('members service', members);
                        const data = cala_auth(members,member_roles,'project')
                        // console.log('data',data,'storage_id',storage_id);
                        return data
                    }
                }
            }
            if(belongedInfo.card){
                const card_id = belongedInfo.card.id
                const card = await strapi.service('api::card.card').find_cardByID(card_id);
                if(card){
                    members = card.card_members;
                    const member_roles = card.member_roles;
                    if(members.filter(i => i.by_user.id === user_id).map(j => j.by_user.id).includes(user_id)){
                        // return cala_auth(members,'card')
                        
                        const data = cala_auth(members,member_roles,'card')
                        // console.log('data',data);
                        return data
                    }
                }
            }
        }
    },
    async get_storage_byID(...args){
        const [storage_id] = args;
        const __storage = await strapi.entityService.findOne('api::storage.storage',storage_id,{
            populate: {
                creator: {
                    fields: ['id']
                },
                can_read_user: {
                    fields: ['id']
                },
                can_wtite_user: {
                    fields: ['id']
                },
                belonged_card: {
                    populate: {
                        card_members: {
                            populate: {
                              by_user: {
                                fields: ['id']
                              },
                              member_roles: {
                                  fields: ['id']
                              }
                            }
                          },
                          member_roles: {
                              populate: {
                                  ACL: {
                                      populate: {
                                          fields_permission: true
                                      }
                                  }
                              }
                          },
                        creator: {
                            fields: ['id']
                        }
                    }
                },
                belonged_project: {
                    populate: {
                        project_members: {
                            populate: {
                              by_user: {
                                fields: ['id']
                              },
                              member_roles: {
                                  fields: ['id']
                              }
                            }
                          },
                          member_roles: {
                              populate: {
                                  ACL: {
                                      populate: {
                                          fields_permission: true
                                      }
                                  }
                              }
                          },
                        creator: {
                            fields: ['id']
                        },
                        blocked: {
                            fields: ['id']
                        }
                    }
                },
                belonged_user: {
                    fields: ['id']
                },
                storage: {
                    fields: ['id']
                }
            }
        })
        if(__storage){
            // console.log('__storage AAA',__storage);
            return __storage
        }
    },
    async get_AzBlobInfo(azureInfo){
        const { accountName, accountKey, EndpointSuffix, containerName, directoryName, endSlash  } = azureInfo;
        
        const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=${EndpointSuffix}`;
        //For store the file in buffer objects
        const multerConfig = {
            storage: memoryStorage()
        };
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        return {
            directoryName,
            endSlash,
            multerConfig,
            containerClient
        }
    },
    async getDateModified(...args) {
        const [ directoryPath, azureInfo ] = args;
        const { containerClient } = await strapi.service('api::storage.storage').get_AzBlobInfo(azureInfo);
        if(containerClient){
            let lastUpdated = null;
            for await (const item of containerClient.listBlobsFlat({ prefix: directoryPath })) {
                const checkFileModified = item.properties.lastModified;
                if (lastUpdated === null || lastUpdated < checkFileModified) {
                    lastUpdated = checkFileModified;
                }
            }
            return lastUpdated;
        }
    },
    
    async hasChildren(...args) {
        const [ directoryPath, azureInfo ] = args;
        const { containerClient } = await strapi.service('api::storage.storage').get_AzBlobInfo(azureInfo);
        for await (const item of containerClient.listBlobsByHierarchy('/', { prefix: directoryPath })) {
            if (item.kind === 'prefix') {
                return true;
            }
        }
        return false;
    },
    
    async getFiles(...args) {
        const [ path, azureInfo ] = args;
        // console.log('getFiles',azureInfo)
        const { directoryName, containerClient } = await strapi.service('api::storage.storage').get_AzBlobInfo(azureInfo);
        const hasChildren = async (_directoryPath) => {
            return await strapi.service('api::storage.storage').hasChildren(_directoryPath, azureInfo);
        }
        const getDateModified = async (_directoryPath) => {
            return await strapi.service('api::storage.storage').getDateModified(_directoryPath, azureInfo);
        }
        // Get the array of directories and files.
        let entry = {};
        const directoriesAndFiles = [];
    
        for await (const item of containerClient.listBlobsByHierarchy('/', { prefix: directoryName + path })) {
            if (item.kind === 'prefix') {
                // @ts-ignore
                entry = {};
                entry.name = basename(item.name);
                entry.type = "Directory";
                entry.isFile = false;
                entry.size = 0;
                entry.hasChild = await hasChildren(item.name);
                entry.filterPath = path;
                entry.dateModified = await getDateModified(item.name);
                directoriesAndFiles.push(entry);
            }
            else {
                // @ts-ignore
                entry = {};
                entry.name = basename(item.name);
                entry.type = extname(item.name);
                entry.isFile = true;
                entry.size = item.properties.contentLength;
                entry.dateModified = item.properties.lastModified;
                entry.hasChild = false;
                entry.filterPath = path;
                directoriesAndFiles.push(entry);
            }
        }
        return directoriesAndFiles;
    },
    
    async deleteFoldersAndFiles(...args) {
        const [ data, path, names, azureInfo ] = args;
        const { directoryName, containerClient, endSlash } = await strapi.service('api::storage.storage').get_AzBlobInfo(azureInfo);
        const hasChildren = async (_directoryPath) => {
            return await strapi.service('api::storage.storage').hasChildren(_directoryPath, azureInfo);
        }
        try {
            for (let i = 0; i < data.length; i++) {
                if (data[i].isFile) {
                    const blobClient = containerClient.getBlobClient(directoryName + path + names[i]);
                    await blobClient.delete();
                }
                else {
                    for await (const blob of containerClient.listBlobsFlat({ prefix: directoryName + path + names[i] + endSlash })) {
                        const blobClient = containerClient.getBlobClient(blob.name);
                        await blobClient.delete();
                    }
                    let directoryBlobClient = containerClient.getBlobClient(directoryName + path + names[i] );
                    // 尝试删除表示文件夹的虚拟Blob
                    try {
                        await directoryBlobClient.delete();
                    } catch (dirError) {
                        console.error(`Directory delete failed: ${dirError.message}`);
                    }
                }
            }

            let response = { cwd: null, details: null, error: null, files: [] };
            return response
        }
        catch (error) {
            let errorMsg = {
                message: "file not found in given location.",
                code: "404"
            };
            let response = { cwd: null, files: null, details: null, error: errorMsg };
            throw response
        }
    },
    
    async getDetails(...args) {
        let [ data, path, names, azureInfo ] = args;
        const { directoryName, containerClient, endSlash } = await strapi.service('api::storage.storage').get_AzBlobInfo(azureInfo);
        const byteConversion = async (size) => {
            return await strapi.service('api::storage.storage').byteConversion(size);
        }
        try {
            //For empty details
            if (names.length == 0 && data != 0) {
                let lastUpdated = null;
                //Get the folder name from the data
                names = data.map(item => item.name);
                let size = 0;
                for await (const blob of containerClient.listBlobsFlat({ prefix: directoryName + path })) {
                    size += blob.properties.contentLength;
                    if (lastUpdated === null || lastUpdated < blob.properties.lastModified) {
                        lastUpdated = blob.properties.lastModified;
                    }
                }
                const fileDetails = {
                    name: names[0],
                    location: directoryName + path,
                    isFile: false,
                    size: await byteConversion(size),
                    created: null,
                    modified: lastUpdated,
                    multipleFiles: false
                }
                let response = {};
                response = { cwd: null, files: null, error: null, details: fileDetails };
                return response
            } else {
                let fileDetails = {};
                let size = 0;
                let names = [];
                let location;
                let isFile = false;
                let created;
                let modified;
                for (const item of names) {
                    if (data[0].isFile) {
                        const blobClient = containerClient.getBlobClient(directoryName + path + item);
                        const properties = await blobClient.getProperties();
                        names.push(basename(blobClient.name));
                        // Replace the blobClient.name to get the common location for more thatn one files
                        if (names.length > 1) {
                            location = blobClient.name.replace("/" + item, "");
                        } else {
                            location = blobClient.name;
                            created = properties.createdOn;
                            modified = properties.lastModified;
                            isFile = true;
                        }
                        size += properties.contentLength;
                    } else {
                        let lastUpdated = null;
                        for await (const blob of containerClient.listBlobsFlat({ prefix: directoryName + path + item + endSlash })) {
                            size += (blob.properties.contentLength);
                            if (lastUpdated === null || lastUpdated < blob.properties.lastModified) {
                                lastUpdated = blob.properties.lastModified;
                            }
                        }
                        names.push(item);
                        if (names.length > 1) {
                            location = (directoryName + path + item).replace("/" + item, "");
                        } else {
                            location = directoryName + path + item;
                            modified = lastUpdated;
                            isFile = false;
                        }
    
                    }
                }
                fileDetails = {
                    name: names.join(", "),
                    location: location,
                    isFile: isFile,
                    size: await byteConversion(size),
                    created: created,
                    modified: modified,
                    multipleFiles: names.length > 1
                };
                let response = { cwd: null, files: null, error: null, details: fileDetails };
                return response
            }
        }
        catch (error) {
            let errorMsg = {
                message: "file not found in given location.",
                code: "404"
            };
            let response = { cwd: null, files: null, details: null, error: errorMsg };
            throw response
        }
    },
    
    async createFolder(...args) {
        let [ name, path, azureInfo ] = args;
        const { directoryName, containerClient, endSlash } = await strapi.service('api::storage.storage').get_AzBlobInfo(azureInfo);
        var response;
        var isExist = false;
        for await (const { } of containerClient.listBlobsFlat({ prefix: directoryName + path + name + endSlash })) {
            isExist = true;
            break;
        }
        if (isExist) {
            let errorMsg = {
                message: "File Already Exists.",
                code: "400"
            };
            let response = { cwd: null, files: null, details: null, error: errorMsg };
            throw response
        } else {
            // Create a new folder with about.txt file
            const fileName = directoryName + path + name + "/.info";
            const blockBlobClient = containerClient.getBlockBlobClient(fileName);
            const fileContent = "created by yihu.team";
            // Upload the .info to new folder.
            await blockBlobClient.uploadData(Buffer.from(fileContent), {
                blobHTTPHeaders: { blobContentType: "text/plain" },
            });
            const properties = await blockBlobClient.getProperties();
            const data = [{
                dateCreated: properties.createdOn,
                dateModified: properties.lastModified,
                filterPath: null,
                hasChild: false,
                isFile: false,
                name: name,
                size: 0,
                type: "Directory"
            }];
            response = { cwd: null, files: data, details: null, error: null };
        }
        return response
    },
    
    async rename(...args) {
        let [ name, newName, path, data, azureInfo ] = args;
        const { directoryName, containerClient, endSlash } = await strapi.service('api::storage.storage').get_AzBlobInfo(azureInfo);
        let response = {};
        if (data[0].isFile) {
    
            const sourceBlobClient = containerClient.getBlockBlobClient(directoryName + path + name);
            const targetBlobClient = containerClient.getBlockBlobClient(directoryName + path + newName);
            if (!await targetBlobClient.exists()) {
                // Copy the source file to the target file
                await targetBlobClient.beginCopyFromURL(sourceBlobClient.url);
                // Delete the source file
                await sourceBlobClient.delete();
                const properties = await targetBlobClient.getProperties();
                const files = [
                    {
                        name: targetBlobClient.name,
                        size: properties.contentLength,
                        dateModified: properties.lastModified,
                        dateCreated: properties.createdOn,
                        hasChild: false,
                        isFile: true,
                        type: basename(targetBlobClient.name),
                        filterPath: path
                    }
                ];
    
                response = { cwd: null, files: files, error: null, details: null };
                return response
            }
            else {
                let errorMsg = {
                    fileExists: newName,
                    message: "File Already Exists.",
                    statusMessage: "File Already Exists.",
                    code: "400"
                };
                let response = { cwd: null, files: null, details: null, error: errorMsg };
                throw response    
            }
        }
        else {
            var isExist = false;
            // Check the existance of directory
            for await (const { } of containerClient.listBlobsFlat({ prefix: directoryName + path + newName + endSlash })) {
                isExist = true;
                break;
            }
            if (isExist) {
                let errorMsg = {
                    fileExists: newName,
                    message: "File Already Exists.",
                    statusMessage: "File Already Exists.",
                    code: "400"
                };
                let response = { cwd: null, files: null, details: null, error: errorMsg };
                throw response
            }
            else {
                for await (const blob of containerClient.listBlobsFlat({ prefix: directoryName + path + name + endSlash })) {
                    const targetPath = blob.name.replace((directoryName + path + name), (directoryName + path + newName));
                    const sourceBlobClient = containerClient.getBlockBlobClient(blob.name);
                    const targetBlobClient = containerClient.getBlockBlobClient(targetPath);
                    await targetBlobClient.beginCopyFromURL(sourceBlobClient.url);
                    await sourceBlobClient.delete();
                }
                const files = [
                    {
                        name: newName,
                        size: 0,
                        dateModified: null,
                        dateCreated: null,
                        hasChild: false,
                        isFile: false,
                        type: "Directory",
                        filterPath: path
                    }
                ];
                response = { cwd: null, files: files, error: null, details: null };
            }
        }
        return response
    },
    
    async copyAndMoveFiles(...args) {
        let [ action, data, path, targetPath, renameFiles, azureInfo ] = args;
        const { directoryName, containerClient, endSlash } = await strapi.service('api::storage.storage').get_AzBlobInfo(azureInfo);
        const files = [];
        let response = {};
        var errorMsg;
        var isRename = renameFiles.length > 0;
        for (const item of data) {
            if (item.type == "Directory") {
                var isExist = false;
                // Here prevented the checking of existance, if the request is rename.
                if (!isRename) {
                    // Check the existance of the target directory, using the blob is available or not in that path.
                    // Here the prefix is "Files/Document/". that end '/' added for get the exact directory.
                    // For example If this '/' is not added it wil take the "Files/Document" and "Files/Documents". 
                    for await (const { } of containerClient.listBlobsFlat({ prefix: directoryName + targetPath + item.name + endSlash })) {
                        isExist = true;
                        break;
                    }
                    if (isExist) {
                        let errorMsg = {
                            fileExists: renameFiles,
                            message: "File Already Exists.",
                            statusMessage: "File Already Exists.",
                            code: "400"
                        };
                        let response = { cwd: null, files: null, details: null, error: errorMsg };
                        throw response   
                    }
                }
                if (!isExist) {
                    var newDirectoryName = item.name;
                    for await (const blob of containerClient.listBlobsFlat({ prefix: directoryName + path + item.name + endSlash })) {
                        // Here replace the source path with empty string. if source path is "Files/Pictures/tom.png" the targetPath is "tom.png".
                        // Here "directoryName = Files" and "req.body.path = /Pictures/".
                        const targetBlob = blob.name.replace((directoryName + path), "");
                        const sourceBlobClient = containerClient.getBlockBlobClient(blob.name);
                        var destinationBlobClient = containerClient.getBlockBlobClient(directoryName + targetPath + targetBlob);
                        if (isRename) {
                            // Change the target path if get rename request.
                            var rootTatgetPath = targetBlob.substring(0, targetBlob.indexOf("/"));
                            var targetSubPath = targetBlob.substring(targetBlob.indexOf("/"));
                            var newTargetPath;
                            var counter = 1;
                            while (true) {
                                newTargetPath = rootTatgetPath + "(" + counter + ")" + targetSubPath;
                                destinationBlobClient = containerClient.getBlockBlobClient(directoryName + targetPath + newTargetPath);
                                if (!await destinationBlobClient.exists()) {
                                    newDirectoryName = item.name + "(" + counter + ")";
                                    await destinationBlobClient.beginCopyFromURL(sourceBlobClient.url);
                                    break;
                                }
                                counter++;
                            }
    
                        } else {
                            await destinationBlobClient.beginCopyFromURL(sourceBlobClient.url);
                        }
                        // Delete the Source blob if the sction is "move".
                        if (action == "move") {
                            await sourceBlobClient.delete();
                        }
                    }
                    const data = {
                        name: newDirectoryName,
                        size: 0,
                        hasChild: false,
                        isFile: false,
                        type: item.type,
                        filterPath: targetPath
                    };
                    files.push(data)
                }
            }
            else {
                var isExist = false;
                const sourceBlobClient = containerClient.getBlockBlobClient(directoryName + path + item.name);
                var destinationBlobClient = containerClient.getBlockBlobClient(directoryName + targetPath + item.name);
                if (!isRename) {
                    if (await destinationBlobClient.exists()) {
                        isExist = true
                        let errorMsg = {
                            fileExists: renameFiles,
                            message: "File Already Exists.",
                            statusMessage: "File Already Exists.",
                            code: "400"
                        };
                        let response = { cwd: null, files: null, details: null, error: errorMsg };
                        throw response 
    
                    }
                }
                if (!isExist) {
                    if (isRename) {
                        var fileNameWithoutExtension = item.name.substring(0, item.name.lastIndexOf('.'));
                        var fileExtension = extname(item.name);
                        var newFileName;
                        var counter = 1;
                        while (true) {
                            newFileName = fileNameWithoutExtension + "(" + counter + ")" + fileExtension;
                            destinationBlobClient = containerClient.getBlockBlobClient(directoryName + targetPath + newFileName);
                            if (!await destinationBlobClient.exists()) {
                                await destinationBlobClient.beginCopyFromURL(sourceBlobClient.url);
                                break;
                            }
                            counter++;
                        }
    
                    } else {
                        await destinationBlobClient.beginCopyFromURL(sourceBlobClient.url);
                    }
                    if (action == "move") {
                        await sourceBlobClient.delete();
                    }
                    const properties = await destinationBlobClient.getProperties();
    
                    const data = {
                        name: basename(destinationBlobClient.name),
                        size: properties.contentLength,
                        previousName: null,
                        dateModified: properties.lastModified,
                        dateCreated: properties.createdOn,
                        hasChild: false,
                        isFile: true,
                        type: extname(destinationBlobClient.name),
                        filterPath: targetPath
                    };
                    files.push(data)
                }
            }
        }
        response = { cwd: null, files: files, error: errorMsg, details: null };
        return response
    },
    
    
    async searchFiles(...args) {
        let [ path, azureInfo, searchString, caseSensitive, showHiddenItems ] = args;
        const { directoryName, containerClient, endSlash } = await strapi.service('api::storage.storage').get_AzBlobInfo(azureInfo);
        var currentPath = path;
        console.log('searchString',searchString);
        searchString = searchString.replace(/\*/g, "");
    
        const directories = [];
        const getDateModified = async (_directoryPath) => {
            return await strapi.service('api::storage.storage').getDateModified(_directoryPath, azureInfo);
        }
    
        // Helper function` to search in folders
        const searchInFolder = async (prefix, directory) => {
            for await (const item of containerClient.listBlobsByHierarchy("/", { prefix })) {
                if (item.kind === 'prefix') {
                    if (basename(item.name).toLowerCase().includes(searchString.toLowerCase())) {
                        let entry = {};
                        entry.name = basename(item.name);
                        entry.type = "Directory";
                        entry.isFile = false;
                        entry.size = 0;
                        entry.hasChild = true;
                        entry.filterPath = (dirname(item.name)).replace(directoryName, "");
                        entry.dateModified = await getDateModified(item.name);
                        directory.push(entry);
                    }
                    await searchInFolder(item.name, directory);
                } else {
                    if (basename(item.name).toLowerCase().includes(searchString.toLowerCase())) {
                        const filterPath = dirname(item.name).substring(directoryName.length) + endSlash;
                        console.log('filterPath',filterPath);
                        let entry = {};
                        entry.name = basename(item.name);
                        entry.type = extname(item.name);
                        entry.isFile = true;
                        entry.size = item.properties.contentLength;
                        entry.dateModified = item.properties.lastModified;
                        entry.hasChild = false;
                        entry.filterPath = filterPath;
                        directory.push(entry);
                    }
                }
            }
        }
        await searchInFolder(directoryName + currentPath, directories);
        let response = {};
        response = { cwd: null, files: directories, error: null, details: null };
        return response
    },
    
    async byteConversion(fileSize) {
        try {
            const index = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];
            if (fileSize === 0) {
                return "0 B";
            }
            const value = Math.floor(Math.log(Math.abs(fileSize)) / Math.log(1024));
            const result = (Math.sign(fileSize) * Math.round(Math.abs(fileSize) / Math.pow(1024, value))).toFixed(1);
            const output = result + " " + index[value];
            return output;
        } catch (error) {
            return 0;
        }
    }

}));
