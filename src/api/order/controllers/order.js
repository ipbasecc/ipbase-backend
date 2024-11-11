'use strict';

/**
 * order controller
 */

const mchNo = 'M1730785808';
const appId = '6729b2e6f6d8ea09bd5e5fcf';
const notifyUrl = "http://127.0.0.1:1337/api/order/order_notify"; // 修复引号
const secretKey = 'jTi5E9kJecgdkEHRDe8CWosl3wE3RRcKIc1FR86KoPMNEnEoyFzyu8a6K8ISWRGrxDNwpuFfHAJYBR55s8kCGQ94YXQPRX0cAcd3hhKYv0rhVDEMn93hJ6fwYgwoEtgh';
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({strapi}) => ({
    async paymentRedirect(ctx) {
      const channelUserId = ctx.query.channelUserId;
      return { channelUserId };
    },
    async createOrder(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(403, '请先登陆')
        }
        
        const { commodity, wayCode, currency, returnUrl, distroy_order } = ctx.request.body;
        const isEmptyObject = (obj) => {
            return obj && typeof obj === 'object' && Object.keys(obj).length === 0;
        }
        if(!commodity){
            ctx.throw(403, '请提供购买内容')
        }
        if(!wayCode){
            ctx.throw(403, '缺少支付方式')
        }
        
        const orderParams = {
            buyer: user_id,
            orderState: 0
        }
        let _commodity
        if(commodity.subject === 'card'){
            // 如果是购买者请求数据，直接返回数据
            const order = await strapi.db.query('api::order.order').findOne({
                where: {
                    buyer: user_id,
                    orderState: 2,
                    card: commodity.id
                }
            })
            if(order){
                const card_populate = strapi.service('api::order.order').card_populate();
                return await strapi.entityService.findOne('api::card.card', commodity.id, {
                    populate: card_populate
                })
            }
            orderParams.card = commodity.id
            _commodity = await strapi.entityService.findOne('api::card.card', commodity.id, {
                fields: ['id', 'price']
            })
        }
        if(_commodity && (!_commodity.price || _commodity.price < 0)){
            ctx.throw(403, '非售卖内容')
        }
        if(commodity.purpose){
            orderParams.purpose = commodity.purpose
        }
        orderParams.mchOrderNo = strapi.service('api::order.order').createPaymentMchOrderNO(user_id, wayCode, commodity);
        
        let strapiOrder
        // 如果用户切换支付方式
        // 本地系统订单更新
        // 支付系统订单关闭
        if(distroy_order){
            strapiOrder = await strapi.db.query('api::order.order').findOne({
                where: {
                    payOrderId: distroy_order
                }
            });
            
            let closeOrderParams = {
              "payOrderId": distroy_order,
              "appId": appId,
              "signType": "MD5",
              "reqTime": Date.now(),
              "mchNo": mchNo,
              "version": "1.0"
            }
            closeOrderParams.sign = strapi.service('api::order.order').sign(closeOrderParams, secretKey);
            await strapi.service('api::order.order').closeOrder(closeOrderParams);
        }
        if(!strapiOrder){
            strapiOrder = await strapi.entityService.create('api::order.order', {
                data: orderParams
            })
        }
        
        
        if (strapiOrder) {
            const commoditySubject = _commodity.name || `id为${_commodity.id}的${commodity.subject}`;
            const extParam = {
                order_id: strapiOrder.id
            };
            const clientIp = ctx.request.ip || ctx.request.ips[0];
            const commodity_body = `商品${commoditySubject}的订单`;
            const divisionMode = 0;
            
            // 获取渠道ID
            const getChannelUserId = async () => {
                let getChannelUserId_params = {
                  "mchNo": mchNo,
                  "appId": appId,
                  "ifCode": "AUTO",
                  "redirectUrl": "https://www.jeequan.com",
                  "signType": "MD5",
                  "reqTime": Date.now(),
                  "version": "1.0"
                }
                const getChannelUserId_sign = strapi.service('api::order.order').sign(getChannelUserId_params, secretKey);
                getChannelUserId_params.sign = getChannelUserId_sign
                const { channelUserId } = await strapi.service('api::order.order').getChannelUserId(getChannelUserId_params)
                return channelUserId
            }
            let params = {
                "amount": _commodity.price, // 支付金额
                "extParam": JSON.stringify(extParam), // 商户扩展参数
                "mchOrderNo": orderParams.mchOrderNo, // 商户生成的订单号
                "subject": commoditySubject, // 商品标题
                "body": commodity_body, // 商品描述
                "wayCode": wayCode, // 支付方式
                "returnUrl": returnUrl, // 支付结果同步跳转通知URL
                "reqTime": Date.now(), // 请求接口时间
                "version": "1.0", // 接口版本号
                // "channelExtra": "{\"authCode\":\"280812820366966512\"}", // 特定渠道发起的额外参数
                "appId": appId, // 应用ID
                "clientIp": clientIp, // 客户端IPV4地址
                "notifyUrl": notifyUrl, // 支付结果异步回调URL
                "signType": "MD5", // 签名类型
                "currency": "cny", // 三位货币代码
                "mchNo": mchNo, // 商户号
                "divisionMode": divisionMode // 分账模式
            };
        
            let sign = strapi.service('api::order.order').sign(params, secretKey);
            params.sign = sign;
            // console.log('params with sign:', params);
            
            const paymentOrder = await strapi.service('api::order.order').createPaymentOrder(params);
            // console.log('paymentOrder', paymentOrder);
            await strapi.entityService.update('api::order.order', strapiOrder.id, {
                data: {
                    payOrderId: paymentOrder.data.payOrderId,
                    jeepay_order: paymentOrder
                }
            })
            if (paymentOrder) {
                return paymentOrder;
            } else {
                ctx.throw(403, '创建订单失败，请刷新重试')
            }
        }
    },
    async orderNotify(ctx) {
        // console.log('orderNotify')
        // return 'orderNotify'
        // https://docs.jeequan.com/docs/jeepay/payment_api#fjimzr
        // 业务系统处理后同步返回给支付中心
        // 返回字符串 success 则表示成功，返回非success则表示处理失败
        // 支付中心会再次通知业务系统。（通知频率为0/30/60/90/120/150,单位：秒）
        let body = ctx.request.body;
        if(!body.extParam){
            console.error('缺少关联内部订单数据', body)
            return 'success'
        }
        const extParam = JSON.parse(body.extParam)
        body.extParam = extParam
        const order_id = extParam.order_id
        const card_populate = strapi.service('api::order.order').card_populate();
        const updateOrder = await strapi.entityService.update('api::order.order', order_id, {
            data: {
                orderState: body.state,
                jeepay_order: body
            },
            populate: {
                buyer: {
                    fields: ['id']
                },
                card: {
                    populate: card_populate
                }
            }
        })
        if(updateOrder){
            const pay_room = `pay_room_${updateOrder.id}`
            strapi.socket.join(pay_room);
            let resps = {
                payOrderId: body.payOrderId,
                state: body.state,
            }
            if(Number(body.state) === 2){
                let _card = updateOrder.card
                _card.hasDetialAuth = true
                resps.commodity = _card 
            }
            strapi.$io.raw({ event: 'pay:completed', rooms: [pay_room], data: resps });
            
        } else {
            console.error('缺少待更新内部订单数据', body)
        }
        return 'success'
    }
}));
