'use strict';

/**
 * order service
 */
 
const axios = require('axios').default;
const paymentAPI = axios.create({ 
    baseURL: process.env.PAYMENT_API || 'https://api.payment.yihu.team/api/'
})
paymentAPI.interceptors.request.use((config) => {
    // config.headers.Authorization = `Bearer ***`;
    config.headers['Content-Type'] = 'application/json';
    return config;
});
 const wayCodes = [
    'QR_CASHIER',	//聚合扫码(用户扫商家)
    'AUTO_BAR',	//聚合条码(商家扫用户)
    'ALI_BAR',	//支付宝条码
    'ALI_JSAPI',	//支付宝生活号
    'ALI_APP',	//支付宝APP
    'ALI_WAP',	//支付宝WAP
    'ALI_PC',	//支付宝PC网站
    'ALI_QR',	//支付宝二维码
    'WX_BAR',	//微信条码
    'WX_JSAPI',	//微信公众号
    'WX_LITE',	//微信小程序
    'WX_APP',	//微信APP
    'WX_H5',	//微信H5
    'WX_NATIVE',	//微信扫码
    'YSF_BAR',	//云闪付条码
    'YSF_JSAPI'	//云闪付jsapi
]
const paySubjects = ['card']

const crypto = require('crypto');

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::order.order', ({strapi}) => ({
    createPaymentMchOrderNO(...args) {
        const [user_id, wayCode, commodity] = args;
        const NumberByWayCode = wayCodes.findIndex(i => i === wayCode);
        if(NumberByWayCode === -1){
            const ctx = strapi.requestContext.get();
            ctx.throw(403, '无效的支付方式')
        }
        const subjectCode = paySubjects.findIndex(i => i === commodity.subject);
        if(subjectCode === -1){
            const ctx = strapi.requestContext.get();
            ctx.throw(403, '无效的产品型号')
        }
        const stringToHexWithTimestamp = (str) => {
            const timestamp = Date.now(); // 获取当前时间戳
            const combinedString = str + timestamp; // 拼接字符串和时间戳
            let hexString = '';
            for (let i = 0; i < combinedString.length; i++) {
                hexString += combinedString.charCodeAt(i).toString(16); // 转换为16进制
            }
            return hexString; // 返回16进制字符串
        }
        
        return stringToHexWithTimestamp(`M${user_id}${NumberByWayCode}${subjectCode}`)
    },
    async createPaymentOrder(params) {
        try {
          const { data } = await paymentAPI.post(`pay/unifiedOrder`,params);
          return data
        } catch (error) {
          console.error(error.data);
        }
    },
    // 获取渠道用户ID
    async getChannelUserId(...args) {
        const [ params ] = args;
        try {
          return await paymentAPI.get(`channelUserId/jump`,params);
        } catch (error) {
          console.error(error.data);
        }
    },
    // 关闭订单
    async closeOrder(...args){
        const [params] = args;
        try {
          const { data } = await paymentAPI.post(`pay/close`,params);
          return data
        } catch (error) {
          console.error(error.data);
        }
    },
    sign(params, secretKey) {
      // 过滤空值并排序
      const sortedParams = Object.keys(params)
        .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
        .sort()
        .reduce((result, key) => {
          result[key] = params[key];
          return result;
        }, {});
    
      // 拼接成字符串
      const stringA = Object.keys(sortedParams)
        .map(key => `${key}=${sortedParams[key]}`)
        .join('&');
    
      // 拼接密钥
      const stringSignTemp = `${stringA}&key=${secretKey}`;
    
      // MD5运算并转换为大写
      const sign = crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
    
      return sign;

    },
    card_populate() {
        return {
            overviews: {
                populate: {
                    media: {
                        fields: ['id', 'ext','url']
                    },
                }
            },
            cover: {
                fields: ['id', 'ext', 'url']
            },
            storage: {
                populate: {
                    files: {
                        fields: ['id','name','ext','url']
                    },
                    sub_folders: true
                }
            },
            card_documents: {
                populate: {
                    creator: {
                        fields: ['id','username'],
                        populate: {
                            profile: {
                                populate: {
                                    avatar: {
                                        fields: ['id','ext','url']
                                    }
                                }
                            }
                        }
                    }
                }
            },
        }
    },
    async ispaied(...args) {
        const [user_id, card_id] = args;
        
        const order = await strapi.db.query('api::order.order').findOne({
            where: {
                buyer: user_id,
                orderState: 2,
                card: card_id
            }
        })
        return order ? true :false
    }
}));
