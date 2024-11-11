'use strict';

/**
 * ali service
 */

const Mts20140618 = require('@alicloud/mts20140618');
const OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util');
const Tea = require('@alicloud/tea-typescript');

const createClient = () => {
    let config = new OpenApi.Config({
      accessKeyId: process.env.ACCESS_KEY_ID,
      accessKeySecret: process.env.ACCESS_KEY_SECRET,
    });
    // Endpoint 请参考 https://api.aliyun.com/product/Mts
    config.endpoint = process.env.MTS_ENDPOINT;
    return new Mts20140618.default(config);
}

let client = createClient();

const OSS = require('ali-oss');
const ossClient = new OSS({
  region: process.env.REGION, // 填写Bucket所在地域
  accessKeyId: process.env.ACCESS_KEY_ID, // 从环境变量中获取访问凭证
  accessKeySecret: process.env.ACCESS_KEY_SECRET, // 从环境变量中获取访问凭证
  bucket: process.env.BUCKET // 填写存储空间名称
});

module.exports = {
    async addMedia(...args) {
        const [ fileURL ] = args;
        let addMediaRequest = new Mts20140618.AddMediaRequest({
          fileURL: fileURL,
          mediaWorkflowId: process.env.MTS_MEDIAWORKFLOWID,
          inputUnbind: true,
        });
        let runtime = new Util.RuntimeOptions({ });
        try {
          // 复制代码运行请自行打印 API 的返回值
          const res = await client.addMediaWithOptions(addMediaRequest, runtime);
          if(res){
              return res.body
          }
        } catch (error) {
          // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
          // 错误 message
          console.log(error.message);
          // 诊断地址
          console.log(error.data["Recommend"]);
          Util.default.assertAsString(error.message);
        }
    },
    async getMediaByOverviewID(...args){
        const [overview_id] = args;

        let overview_media = await strapi.entityService.findOne('api::overview.overview',overview_id,{
            fields: ['id','mps_info'],
            populate: {
                media: {
                    fields: ['id','url','ext']
                }
            }
        });
        if(overview_media?.media?.url && overview_media?.media?.ext) {
            return strapi.service('api::ali.ali').processUrl(overview_media?.media?.url, overview_media?.media?.ext);
        } else {
            return null
        }
    },
    processUrl(...args){
        const [url, ext] = args;
        // console.log('url, ext',url, ext)

        const videoExts = ['.3gp', '.asf', '.avi', '.dat', '.dv', '.flv', '.f4v', '.gif', '.m2t', '.m3u8', '.m4v', '.mj2', '.mjpeg', '.mkv',  '.mov', '.mp4', '.mpe', '.mpg', '.mpeg', '.mts', '.ogg', '.qt', '.rm', '.rmvb', '.swf', '.vob', '.wmv', '.webm', '.mxf', '.quicktime']
        if(url && videoExts.includes(ext)) {
            return url.replace(/^https:\/\//i, 'http://')
        } else {
            return null
        }
    },
    async queryMedias(...args) {
        const [url] = args;
        if(!url){
            // console.log('need url')
            return
        }
        let queryMediaListByURLRequest = new Mts20140618.QueryMediaListByURLRequest({
          fileURLs: url,
          includeSummaryList: true,
          includeMediaInfo: true,
          includeSnapshotList: true,
          includePlayList: true,
        });
        let runtime = new Util.RuntimeOptions({ });
        try {
          // 复制代码运行请自行打印 API 的返回值
          const res = await client.queryMediaListByURLWithOptions(queryMediaListByURLRequest, runtime);
          if(res.body?.mediaList?.media[0]?.publishState === 'Published'){
            return res.body
          }
        } catch (error) {
          // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
          // 错误 message
          console.log(error.message);
          // 诊断地址
          console.log(error.data["Recommend"]);
          Util.default.assertAsString(error.message);
        }
    },
    async removeObject(args){
        const {url,urls} = args;
        // console.log('removeObject ali', url)
        /**
         * 从阿里云 OSS 完整 URL 中提取 objectName
         * @param {string} url OSS 的完整访问地址
         * @returns {string} objectName
         * @example
         * // 返回 'path/to/file.jpg'
         * getObjectNameFromUrl('https://bucket-name.oss-cn-hangzhou.aliyuncs.com/path/to/file.jpg')
         */
        function getObjectNameFromUrl(url) {
          try {
            // 创建 URL 对象
            const urlObj = new URL(url);
            
            // 获取 pathname（路径部分）
            let objectName = urlObj.pathname;
            
            // 移除开头的斜杠
            if (objectName.startsWith('/')) {
              objectName = objectName.substring(1);
            }
            
            // 处理 URL 编码
            objectName = decodeURIComponent(objectName);
            
            return objectName;
          } catch (error) {
            console.error('URL 解析失败：', error);
            throw new Error('无效的 OSS URL');
          }
        };
        
        if(url){
            const objectName = getObjectNameFromUrl(url);
            // 删除单个文件
            async function deleteFile(objectName) {
              try {
                // objectName 是文件在 OSS 中的完整路径，例如 'folder/example.jpg'
                const result = await ossClient.delete(objectName);
                // console.log('删除成功');
                return result;
              } catch (error) {
                console.error('删除失败：', error);
                throw error;
              }
            }
            await deleteFile(objectName);
        }
        if(urls){
            const objectNames = urls.map(url => {
              try {
                return getObjectNameFromUrl(url);
              } catch (error) {
                console.error('处理失败:', error);
              }
            });
            // 批量删除文件
            async function deleteMultipleFiles(objectNames) {
              try {
                // objectNames 是一个字符串数组，包含要删除的文件路径
                const result = await ossClient.deleteMulti(objectNames);
                // console.log('批量删除成功');
                return result;
              } catch (error) {
                console.error('批量删除失败：', error);
                throw error;
              }
            }
            if(objectNames?.length > 0){
                await deleteMultipleFiles(objectNames)
            }
        }
    }
}

