// @ts-nocheck
'use strict';

/**
 * storage controller
 */

const archiver = require('archiver');
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::storage.storage',({strapi}) => ({
    async findOne(ctx) {
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;
        const storage_id = id
        
        const { share_code, share_by } = ctx.request.query;
        if((!share_code || !share_by) && (share_code || share_by)){
            ctx.throw(404, '无效的共享连接')
        }
        // if(share_code && share_by){
            
        // }

        if(!user_id) {
            ctx.throw(401, '您无权访问该数据')
        }
        if(!id) {
            ctx.throw(400, '需要提供存储ID')
        }

        let auth
        const checkAuth = 'read'
        const selfAuth = await strapi.service('api::storage.storage').storageSelfAuth({storage_id,user_id,checkAuth});
        auth = selfAuth.read
        if(!auth){
            const assign = 'storage'
            const collections = await strapi.service('api::storage.storage').getCollections({
                assign, user_id, storage_id
            })
            auth = collections.filter(i => i.modify)?.length > 0
        }
        
        if(auth){
            return await strapi.entityService.findOne('api::storage.storage',id,{
                fields: ['id','name'],
                populate: {
                    sub_folders: true,
                    storage_files: {
                        populate: {
                            file: {
                                fields: ['id','name','url','ext']
                            },
                        }
                    },
                }
            })
        } else {
            ctx.throw(403, '您无权访问该数据')
        }
    },
    async update(ctx) {
        const user_id = Number(ctx.state.user.id);
        const { id:storage_id } = ctx.params;
        let body = ctx.request.body;

        let data = body.data;

        if(!user_id) {
            ctx.throw(401, '您无权执行此操作')
        }
        let auth
        const checkAuth = 'write'
        const storage = await strapi.service('api::storage.storage').get_storage_byID(storage_id);
        const selfAuth = await strapi.service('api::storage.storage').storageSelfAuth({storage_id,user_id,checkAuth});
        auth = selfAuth.write
        if(!auth){
            const assign = 'storage'
            const collections = await strapi.service('api::storage.storage').getCollections({
                assign, user_id, storage_id
            })
            auth = collections.filter(i => i.modify)?.length > 0
        }

        if (auth && storage) {
            let old_file_ids = storage.files?.map(i => i.id) || [];
            let params = {};
            if(body.data.new_storageFiles) {
                let new_file_ids = body.data.new_storageFiles.map(i => Number(i));
                params.files = [...old_file_ids.filter(i => !new_file_ids.includes(i)),...new_file_ids];
            }
            if(body.data.remove_storageFiles) {
                let remove_file_ids = body.data.remove_storageFiles.map(i => Number(i));
                params.files = old_file_ids.filter(i => !remove_file_ids.includes(i))
            }
            if(data.name) {
                params.name = data.name
            }
            if(data.color_marker) {
                params.color_marker = data.color_marker
            }
            const update = await strapi.entityService.update('api::storage.storage',storage_id,{
                data: params,
                fields: ['id','name'],
                populate: {
                    sub_folders: true,
                    storage_files: {
                        populate: {
                            file: {
                                fields: ['id','name','url','ext']
                            },
                        }
                    }
                }
            })
            if(update) {
                let response = {
                    team_id: ctx.default_team?.id,
                    data: update
                }
                if(storage.belonged_project){
                    response.project_id = storage.belonged_project.id
                }
                if(storage.belonged_card){
                    response.card_id = storage.belonged_card.id
                }
                strapi.$publish('storage:updated', [ctx.room_name], response);
                return update
            }
        }
        
    },
    async create(ctx) {
        const user_id = Number(ctx.state.user.id);
        let body = ctx.request.body;
        // console.log('body',body);
        let data = body.data;
        let assign_card = Number(data.assign_card);
        let assign_project = Number(data.assign_project);
        let assign_storage = Number(data.assign_storage);
        let name = data.name;
        let type = data.type;

        // console.log('assign_storage',assign_storage);

        if(!user_id) {
            ctx.throw(401, '您无权执行此操作')
        }
        if(!name) {
            ctx.throw(401, '文件夹名称不能缺少')
        }

        let auth;
        if(assign_card){
            const assign = 'card'
            const collections = await strapi.service('api::storage.storage').getCollections({
                assign,user_id,assign_card
            })
            auth = collections.filter(i => i.create)?.length > 0
        }
        if(assign_project){
            const assign = 'project'
            const project_id = assign_project
            const collections = await strapi.service('api::storage.storage').getCollections({
                assign,user_id,assign_project
            })
            auth = collections.filter(i => i.create)?.length > 0
        }
        if(assign_storage){
            const storage_id = assign_storage
            const checkAuth = 'write'
            const selfAuth = await strapi.service('api::storage.storage').storageSelfAuth({storage_id,user_id,checkAuth});
            auth = selfAuth.read
            if(!auth){
                const assign = 'storage'
                const collections = await strapi.service('api::storage.storage').getCollections({
                    assign,user_id,storage_id
                })
                auth = collections.filter(i => i.create)?.length > 0
            }
        }
        // console.log('auth',auth);
        
        if(auth) {
            let params = {};
            params.name = name;
            params.type = type;
            params.color_marker = [];
            if(assign_storage) {
                params.storage = {
                    set: [assign_storage]
                }
            } else if(assign_card) { //提供了附加目标Card
                params.belonged_card = {
                    set: [assign_card]
                }
            } else if(assign_project) { //提供了附加目标项目
                params.belonged_project = {
                    set: [assign_project]
                }
            } else {
                params.belonged_user = {
                    set: [user_id]
                }
            }
            if(data.azureInfo){
                const azureInfo = data.azureInfo;
                if(!azureInfo.accountName){
                    ctx.throw(400, 'Account Name 不能缺少')
                } else if(!azureInfo.accountKey){
                    ctx.throw(400, 'Account key 不能缺少')
                } else if(!azureInfo.EndpointSuffix){
                    ctx.throw(400, 'EndpointSuffix 不能缺少')
                } else if(!azureInfo.containerName){
                    ctx.throw(400, 'containerName 不能缺少')
                } else if(!azureInfo.directoryName){
                    ctx.throw(400, 'directoryName 不能缺少')
                } else if(!azureInfo.endSlash){
                    ctx.throw(400, 'endSlash 不能缺少')
                } else {
                    params.azureInfo = azureInfo
                }
            };
            // console.log(params);
            let create_storage = await strapi.entityService.create('api::storage.storage',{
                data: {
                    ...params,
                    creator: {
                        set: [user_id]
                    }
                }
            })
            if(create_storage) {
                delete create_storage.azureInfo
                let response = {
                    team_id: ctx.default_team?.id,
                    data: create_storage
                }
                if(assign_project){
                    response.project_id = assign_project
                }
                if(assign_card){
                    response.card_id = assign_card
                }
                if(assign_storage){
                    response.parent_storage_id = assign_storage
                }
                strapi.$publish('storage:created', [ctx.room_name], response);
                return create_storage
            }
        } else {
            ctx.throw(403, '您无权执行此操作')
        }
    },
    async delete(ctx) {
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;
        if(!user_id) {
            ctx.throw(403, '您无权执行此操作')
        }

        let auth = true
        const storage = await strapi.service('api::storage.storage').get_storage_byID(id);
        if(storage){
            // console.log('__storage AAA',storage);
            if(storage?.private){
                auth = storage.creator?.id === user_id || storage.belonged_user?.id === user_id
            } else {
                const res = await strapi.service('api::storage.storage').calc_collection_auth(id,user_id);
                if(res){
                    // console.log('res auth', res);
                    auth = res.auth?.remove;
                    // console.log('auth auth', auth);
                }
            }
        }
        // console.log('auth',auth);
        if(auth) {

            let __remove = {
                storage_need_delete: [id],
                file_need_delete: [],
                source_file_need_delete: [],
                file_size_for_count: []
            }
            let count = 0
            const process_ids_for_delete = async (id) => {
                count++
                const this_storage = await strapi.entityService.findOne('api::storage.storage', id, {
                    populate: {
                        sub_folders: {
                            fields: ['id']
                        },
                        storage_files: {
                            fields: ['id'],
                            populate: {
                                file: {
                                    fields: ['id','size']
                                }
                            }
                        }
                    }
                });
                if (this_storage) {
                    if (this_storage.storage_files?.length > 0) {
                        // console.log('this_storage',this_storage);
                        const files = this_storage.storage_files.map(i => i.id);
                        __remove.file_need_delete.push(...files);
                        // console.log('file_need_delete',__remove.file_need_delete);
                        
                        const files_sizes = this_storage.storage_files.map(i => i.file?.size);
                        __remove.file_size_for_count.push(...files_sizes);
                        // console.log('file_size_for_count',__remove.file_size_for_count);
                        
                        const source_files_ids = this_storage.storage_files.map(i => i.file?.id);
                        __remove.source_file_need_delete.push(...source_files_ids);
                        // console.log('source_file_need_delete',__remove.source_file_need_delete);
                    }
                    if (this_storage.sub_folders?.length > 0) {
                        const subfolders = this_storage.sub_folders.map(i => i.id);
                        __remove.storage_need_delete.push(...subfolders);
                        // console.log('subfolders',subfolders);
                        await Promise.allSettled(
                            subfolders.map(async (i) => {
                                await process_ids_for_delete(i);
                            })
                        );
                    } 
                    // console.log('process_ids_for_delete',__remove);
                }
                return __remove;
            };
            
            const res = await process_ids_for_delete(Number(id));   
            if(res){
                // console.log('res',res);
                let storage_need_delete = res.storage_need_delete;
                let file_need_delete = res.file_need_delete;
                let total_remove_size = res.file_size_for_count.reduce((a, b) => a + b, 0);
                let source_file_need_delete = res.source_file_need_delete;
                
                process.nextTick(async () => {
                    try {
                        let done = [ false, false ]
                        if(storage_need_delete.length > 0){
                            // console.log('storage_need_delete',storage_need_delete);
                            const results = await Promise.allSettled(
                                storage_need_delete.map(async(i) => {
                                    await strapi.entityService.delete('api::storage.storage',i)
                                })
                            )
                            if(results) {
                                done[0] = true
                            }
                        } else {
                            done[0] = true
                        }
                        if(file_need_delete.length > 0){
                            // console.log('file_need_delete',file_need_delete);
                            const results = await Promise.allSettled(
                                file_need_delete.map(async(i) => {
                                    await strapi.entityService.delete('api::storage-file.storage-file',i)
                                })
                            )
                            if(results) {
                                done[1] = true
                            }
                        } else {
                            done[1] = true
                        }
                        // console.log('done',done);
                        if(done.includes(false)) {
                            console.error(res, '批量删除出错')
                        }
                        if(source_file_need_delete?.length > 0){
                          // 删除多个文件
                          source_file_need_delete.map(async(i) => {
                              await strapi.plugins.upload.services.upload.remove({id: i});
                          })
                        }
                    } catch (error) {
                      console.error('After update processing error:', error);
                    }
                });
                let response = {
                    team_id: ctx.default_team?.id,
                    data: {
                        removed_storage_id: id
                    }
                }
                strapi.$publish('storage:removed', [ctx.room_name], response);
                return 'OK'
            }
        } else {
            return false
        }
    },
    async Azure(ctx) {
        const user_id = Number(ctx.state.user.id);
        const { storage_id } = ctx.params;
        const body = ctx.request.body;
        const {
            action,
            data,
            path,
            names,
            name,
            newName,
            renameFiles,
            targetPath,
            searchString,
            caseSensitive,
            showHiddenItems
        } = body
        if(!user_id) {
            ctx.throw(401, '您无权访问该数据')
        }
        let azureInfo;
        if(!storage_id) {
            ctx.throw(400, '需要提供存储ID')
        } else {
            const storage = await strapi.entityService.findOne('api::storage.storage',storage_id);
            azureInfo = storage.azureInfo
        }
        let auth
        // const { auth, fields_permission } = strapi.service('api::document.document').cala_auth(document_id,user_id);
        const res = await strapi.service('api::storage.storage').calc_collection_auth(storage_id,user_id);
        if(res){
            auth = res.auth?.read;
        }

        if(auth && azureInfo){
            const { directoryName } = await strapi.service('api::storage.storage').get_AzBlobInfo(azureInfo);
            if (typeof body !== 'undefined' && action === 'delete') {
                return await strapi.service('api::storage.storage').deleteFoldersAndFiles(data, path, names, azureInfo);
            }
            if (typeof body !== 'undefined' && action === 'details') {
                // console.log('azureInfo', azureInfo)
                return await strapi.service('api::storage.storage').getDetails(data, path, names, azureInfo);
            }
            if (typeof body !== 'undefined' && action === 'create') {
                const res =await strapi.service('api::storage.storage').createFolder(name, path, azureInfo);
                if(res) {
                    return res
                }
            }
            if (typeof body !== 'undefined' && action === 'rename') {
                const res = await strapi.service('api::storage.storage').rename(name, newName, path, data, azureInfo);
                if(res) {
                    return res
                }
            }
            if (typeof body !== 'undefined' && (action === 'copy' || action === 'move')) {
                const res = await strapi.service('api::storage.storage').copyAndMoveFiles(action, data, path, targetPath, renameFiles, azureInfo);
                if(res) {
                    return res
                }
            }
            if (typeof body !== 'undefined' && action === 'search') {
                const res = await strapi.service('api::storage.storage').searchFiles(path, azureInfo, searchString, caseSensitive, showHiddenItems);
                if(res) {
                    return res
                }
            }
            if (typeof body !== 'undefined' && action === 'read') {
                let totalFiles = await strapi.service('api::storage.storage').getFiles(path, azureInfo);
                let cwdFiles = {};
                cwdFiles.name = body.data.length != 0 && body.data[0] != null ? body.data[0].name : directoryName;
                cwdFiles.type = "File Folder";
                cwdFiles.filterPath = body.data.length != 0 && body.data[0] != null ? body.data[0].filterPath : "";
                cwdFiles.size = 0;
                cwdFiles.hasChild = true;
        
                let response = {};
                response = { cwd: cwdFiles, files: totalFiles };
                return response
            }
        } else {
            ctx.throw(403, '您无权执行此操作')
        }

    },
    async GetImage(ctx) {
        const path = ctx.query.path;
        const { storage_id } = ctx.params;

        if(!storage_id) {
            ctx.throw(400, '需要提供存储ID')
        }
        let azureInfo;
        if(!storage_id) {
            ctx.throw(400, '需要提供存储ID')
        } else {
            const storage = await strapi.entityService.findOne('api::storage.storage',storage_id);
            azureInfo = storage.azureInfo
        }
        const { directoryName, containerClient } = await strapi.service('api::storage.storage').get_AzBlobInfo(azureInfo);
        try {
            const blobClient = containerClient.getBlobClient(directoryName + path);
            // Download the image as a readable stream
            const downloadResponse = await blobClient.download();
            ctx.set('Content-Type', 'image/jpg');
            ctx.body = downloadResponse.readableStreamBody;
        }
        catch (error) {
            ctx.throw(404, path + " not found in given location.");
        }
    },
    async Download(ctx) {
        const body = ctx.request.body;
        const { storage_id } = ctx.params;

        if(!storage_id) {
            ctx.throw(400, '需要提供存储ID')
        }
        let azureInfo;
        if(!storage_id) {
            ctx.throw(400, '需要提供存储ID')
        } else {
            const storage = await strapi.entityService.findOne('api::storage.storage',storage_id);
            azureInfo = storage.azureInfo
        }

        const { directoryName, containerClient } = await strapi.service('api::storage.storage').get_AzBlobInfo(azureInfo);
        let downloadObj = JSON.parse(body.downloadInput);
        if (downloadObj.names.length === 1 && downloadObj.data[0].isFile) {
            // Get a reference to the file blob
            const blockBlobClient = containerClient.getBlockBlobClient(directoryName + downloadObj.path + downloadObj.names[0]);
            // Download the file to a local destination
            const downloadResponse = await blockBlobClient.download(0);
            ctx.set('Content-Disposition', `attachment; filename=${downloadObj.names[0]}`);
            ctx.set('Content-Type', downloadResponse.contentType);
            ctx.set('Content-Length', downloadResponse.contentLength);
            // Stream the file directly to the response
            ctx.body = downloadResponse.readableStreamBody;
        } else {
            // console.log(downloadObj.names.length);
            const zipFileName = downloadObj.names.length > 1 ? 'Files.zip' : `${downloadObj.names[0]}.zip`;
            ctx.set('Content-Disposition', `attachment; filename=${zipFileName}`);
            ctx.set('Content-Type', 'application/zip');
            const archive = archiver('zip', {
                gzip: true,
                zlib: { level: 9 }
            });
    
            archive.pipe(ctx.res);
            for (const name of downloadObj.names) {
                if (downloadObj.data.find((item) => item.name === name && !item.isFile)) {
                    const directoryPath = directoryName + downloadObj.path + name + endSlash;
                    const getArchieveFolder = async (directoryPath) => {
                        for await (const item of containerClient.listBlobsByHierarchy('/', { prefix: directoryPath })) {
                            if (item.kind === 'blob') {
                                const blockBlobClient = containerClient.getBlockBlobClient(item.name);
                                const downloadResponse = await blockBlobClient.download(0);
                                const entryName = item.name.replace((directoryName + downloadObj.path), "");
                                archive.append(downloadResponse.readableStreamBody, { name: entryName });
                            }
                            else {
                                await getArchieveFolder(item.name)
                            }
                        }
                    }
                    await getArchieveFolder(directoryPath)
                } else {
                    const blockBlobClient = containerClient.getBlockBlobClient(directoryName + downloadObj.path + name);
                    const downloadResponse = await blockBlobClient.download(0);
                    const entryName = basename(directoryName + downloadObj.path + name);
                    archive.append(downloadResponse.readableStreamBody, { name: entryName });
                }
            }
            archive.finalize();
        }
        
    },
    async Upload(ctx) {
        const user_id = Number(ctx.state.user.id);
        const body = ctx.request.body;
        const { path, action, data, filename } = body
        const { uploadFiles } = ctx.request.files;
        // console.log('uploadFiles', uploadFiles?.path)
        const filePath = uploadFiles?.path;
        const { storage_id } = ctx.params;


        if(!user_id) {
            ctx.throw(401, '您无权访问该数据')
        }
        if(!storage_id) {
            ctx.throw(400, '需要提供存储ID')
        }
        let azureInfo;
        if(!storage_id) {
            ctx.throw(400, '需要提供存储ID')
        } else {
            const storage = await strapi.entityService.findOne('api::storage.storage',storage_id);
            azureInfo = storage.azureInfo
        }

        let auth
        const res = await strapi.service('api::storage.storage').calc_collection_auth(storage_id,user_id);
        if(res){
            auth = res.auth?.modify;
        }

        if(auth){
            const { directoryName, containerClient } = await strapi.service('api::storage.storage').get_AzBlobInfo(azureInfo);
            if (body != null && body.path != null) {
                const fs = require('fs');
                
                if (action === 'save') {
                    const blobClient = containerClient.getBlockBlobClient(directoryName + body.path + body.filename);
                    if (!await blobClient.exists()) {
                        fs.readFile(filePath, (err, data) => {  
                          if (err) {
                            console.error('Error reading file:', err);  
                            // ...  
                          } else {
                            blobClient.uploadData(data)
                              .then(() => {  
                                // 文件上传成功，现在删除临时文件  
                                fs.unlink(filePath, (unlinkErr) => {  
                                  if (unlinkErr) {  
                                    // 处理删除临时文件时的错误  
                                    console.error('Error deleting temporary file:', unlinkErr);  
                                    // ...  
                                  } else {  
                                    console.log('Temporary file deleted successfully.');  
                                  }  
                                });  
                              })  
                              .catch((uploadErr) => {  
                                // 处理文件上传错误  
                                console.error('Error uploading file:', uploadErr);  
                              }); 
                          }  
                        });
                        // await blobClient.uploadData(uploadFiles);
                        ctx.send('Success');
                    }
                    else {
                        let errorMsg = {
                            fileExists: body.filename,
                            message: "File Already Exists.",
                            statusMessage: "File Already Exists.",
                            code: "400"
                        };
                        let response = { error: errorMsg, files: [] };
                        ctx.throw(400, response)
                    }
                } else if (action === 'keepboth') {
                    var fileNameWithoutExtension = body.filename.substring(0, body.filename.lastIndexOf('.'));
                    var fileExtension = extname(body.filename);
                    var newFileName = '';
                    var counter = 1;
                    while (true) {
                        newFileName = fileNameWithoutExtension + "(" + counter + ")" + fileExtension;
                        const newBlobClient = containerClient.getBlockBlobClient(directoryName + body.path + newFileName);
                        if (!await newBlobClient.exists()) {
                            fs.readFile(filePath, (err, data) => {  
                              if (err) {
                                console.error('Error reading file:', err);  
                                // ...  
                              } else {
                                newBlobClient.uploadData(data).then(() => {  
                                // 文件上传成功，现在删除临时文件  
                                fs.unlink(filePath, (unlinkErr) => {  
                                  if (unlinkErr) {  
                                    // 处理删除临时文件时的错误  
                                    console.error('Error deleting temporary file:', unlinkErr);  
                                    // ...  
                                  } else {  
                                    console.log('Temporary file deleted successfully.');  
                                  }  
                                });  
                              })  
                              .catch((uploadErr) => {  
                                // 处理文件上传错误  
                                console.error('Error uploading file:', uploadErr);  
                              }); 
                              }  
                            });
                            ctx.send('Success');
                            break;
                        }
                        counter++;
                    }
                } else if (action === 'replace') {
                    const blobClient = containerClient.getBlockBlobClient(directoryName + body.path + body.filename);
                    if (await blobClient.exists()) {
                        fs.readFile(filePath, (err, data) => {  
                          if (err) {
                            console.error('Error reading file:', err);  
                            // ...  
                          } else {
                            blobClient.uploadData(data).then(() => {  
                                // 文件上传成功，现在删除临时文件  
                                fs.unlink(filePath, (unlinkErr) => {  
                                  if (unlinkErr) {  
                                    // 处理删除临时文件时的错误  
                                    console.error('Error deleting temporary file:', unlinkErr);  
                                    // ...  
                                  } else {  
                                    console.log('Temporary file deleted successfully.');  
                                  }  
                                });  
                              })  
                              .catch((uploadErr) => {  
                                // 处理文件上传错误  
                                console.error('Error uploading file:', uploadErr);  
                              }); 
                          }  
                        });
                        ctx.send('Success');
                    }
                }
            }
        } else {
            ctx.throw(403, '您无权执行此操作')
        }
    }
}));
