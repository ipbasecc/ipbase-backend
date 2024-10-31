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
}

