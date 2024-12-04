'use strict';

/**
 * order controller
 */

const mchNo = process.env.MCHNO;
const appId = process.env.APPID;
const notifyUrl = process.env.NOTIFY_URL;
const transferNotifyUrl = process.env.TRANSFER_NOTIFY_URL;
const secretKey = process.env.SECRET_KEY;
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
        
        const { commodity, wayCode, currency, returnUrl, distroy_order, auth_type } = ctx.request.body;
        if(commodity.type === 'resource' && !auth_type){
            ctx.throw(402, '购买资源必须选择购买授权类型')
        }
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
        if(auth_type){
            orderParams.authed_type = auth_type
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
                const is_new_auth_type = order.authed_type !== auth_type
                if(!is_new_auth_type || commodity.type === 'classroom'){
                    const card_populate = strapi.service('api::order.order').card_populate(commodity.type);
                    return await strapi.entityService.findOne('api::card.card', commodity.id, {
                        populate: card_populate
                    })
                }
            }
            orderParams.card = commodity.id
            _commodity = await strapi.entityService.findOne('api::card.card', commodity.id, {
                fields: ['id', 'type', 'price', 'price_by_auth'],
            })
            console.log('_commodity', _commodity)
        }
        if(commodity.subject === 'project'){
            // 如果是购买者请求数据，直接返回数据
            const order = await strapi.db.query('api::order.order').findOne({
                where: {
                    buyer: user_id,
                    orderState: 2,
                    project: commodity.id
                }
            })
            if(order){
                return await strapi.service('api::project.project').find_projectByID(commodity.id);
            }
            orderParams.project = commodity.id
            _commodity = await strapi.entityService.findOne('api::project.project', commodity.id, {
                fields: ['id', 'price']
            })
        }
        if(_commodity){
            if(_commodity.type === 'resource' && (!_commodity.price_by_auth || _commodity.price_by_auth?.length === 0)){
                crx.throw(402, '当前资源需要按照授权类型销售，但是却没有对应的可供销售的授权类型')
            }
            let isNotForSale
            if(_commodity.type === 'classroom' && (!_commodity.price || _commodity.price < 0)){
                isNotForSale = true
            }
            if(_commodity.type === 'resource'){
                const prices = _commodity.price_by_auth?.filter(i => i.price > 0)
                console.log('_commodity', prices)
                isNotForSale = prices?.length === 0
            }
            if(isNotForSale){
                ctx.throw(403, '非售卖内容')
            }
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
            let amount
            if(_commodity.type === 'classroom'){
                amount = _commodity.price
            }
            if(_commodity.type === 'resource'){
                amount = _commodity.price_by_auth.find(i => i.auth_type === auth_type)?.price
            }
            if(!amount){
                ctx.throw(402, '未能获取到付款价格')
            }
            const commoditySubject = _commodity.name || `id为${_commodity.id}的${commodity.subject}`;
            const extParam = {
                order_id: strapiOrder.id
            };
            if(commodity.subject === 'project'){
                extParam.project_id = commodity.id
            }
            if(commodity.subject === 'card'){
                extParam.card_id = commodity.id
                extParam.card_type = commodity.type
            }
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
                "amount": amount, // 支付金额
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
        let user_id
        const extParam = JSON.parse(body.extParam)
        body.extParam = extParam
        const {order_id, card_id, card_type, project_id} = extParam
        let updateOrder
        try{
            let res_populate = {
                buyer: {
                    fields: ['id']
                }
            }
            const card_populate = strapi.service('api::order.order').card_populate(card_type);
            if(card_id){
                res_populate.card = {
                    populate: card_populate
                }
            }
            updateOrder = await strapi.entityService.update('api::order.order', order_id, {
                data: {
                    orderState: body.state,
                    jeepay_order: body
                },
                populate: res_populate
            })
            if(updateOrder){
                // console.log('updateOrder', body)
                if(card_id){
                    user_id = updateOrder.card.creator.id
                }
                if(project_id){
                    const _project = await strapi.db.query('api::project.project').findOne({
                        where: {
                            id: project_id
                        },
                        populate: {
                            creator: {
                                select: ['id']
                            },
                            by_team: {
                                select: ['id', 'mm_team']
                            }
                        }
                    })
                    if(_project?.creator?.id){
                        user_id = _project.creator.id
                    } else {
                        const _member = await strapi.db.query('api::member.member').findOne({
                            where: {
                                by_project: project_id,
                                subject: {
                                    $in: ['creator', 'owner'],
                                }
                            },
                            populate: {
                                by_user: {
                                    select: ['id']
                                }
                            }
                        })
                        if(_member?.by_user?.id){
                            user_id = _member.by_user.id
                        }
                    }
                    // 将购买者设置为项目成员
                    const buyer_id = updateOrder.buyer?.id;
                    if(buyer_id && Number(body.state) === 2){
                        const buyer_team_member = await strapi.db.query('api::member.member').findOne({
                            where: {
                                by_team: _project.by_team?.id,
                                by_user: buyer_id
                            }
                        })
                        if(buyer_team_member){
                            await strapi.entityService.update('api::project.project', project_id, {
                                data: {
                                    project_members: {
                                        connect: [buyer_team_member.id]
                                    }
                                }
                            })
                            const project_member_role = await strapi.db.query('api::member-role.member-role').findOne({
                                where: {
                                    subject: 'member',
                                    by_project: project_id
                                }
                            })
                            if(project_member_role){
                                await strapi.db.query('api::member-role.member-role').update({
                                    where: {
                                        id: project_member_role.id,
                                    },
                                    data: {
                                        members: {
                                            connect: [buyer_team_member.id]
                                        }
                                    }
                                })
                            }
                            const project = _project
                            const target_user_id = buyer_id
                            const target_member = buyer_team_member
                            await strapi.service('api::project.project').addUser_to_mmChannel(project,target_user_id,target_member);
                        }
                    }
                }
                console.log('user_id', user_id)
                if(!user_id){
                    console.error('error on update daily-transaction, cant find creator, order_id is:', updateOrder?.id)
                    return
                }
                // 更新订单统计
                if(Number(body.state) === 2){
                    const moment = require('moment');
                    const transaction_date = moment().format('YYYY-MM-DD'); // 格式化为 YYYY-MM-DD
                    
                    const daily_transaction = await strapi.db.query('api::daily-transaction.daily-transaction').findOne({
                        where: {
                            transaction_date: transaction_date,
                            by_user: user_id
                        }
                    });
                    // console.log('daily_transaction', daily_transaction)
                    if(daily_transaction){
                        const new_amount = Number(body.amount) + Number(daily_transaction.income)
                        await strapi.db.query('api::daily-transaction.daily-transaction').update({
                            where: {
                                id: daily_transaction.id
                            },
                            data: {
                                completed_orders: {
                                    connect: order_id
                                },
                                income: new_amount,
                                completed_orders_count: daily_transaction.completed_orders_count + 1
                            }
                        })
                        // console.log('has daily_transaction')
                    } else {
                        await strapi.db.query('api::daily-transaction.daily-transaction').create({
                            data: {
                                transaction_date: transaction_date,
                                completed_orders: [order_id],
                                by_user: user_id,
                                income: Number(body.amount),
                                completed_orders_count: 1
                            }
                        })
                        // console.log('no daily_transaction')
                    }
                    
                    const user =  await strapi.entityService.findOne('plugin::users-permissions.user',user_id,{
                        fields: ['id','username','income','withdraw','partner_level'],
                        populate: {
                            business_account: true
                        }
                    })
                    let partner_level = user.partner_level;
                    // 兼容旧名称
                    if(partner_level === 'level 1'){
                        partner_level = 'Enterprise'
                    }
                    if(partner_level === 'level 2'){
                        partner_level = 'Professional'
                    }
                    if(partner_level === 'level 3'){
                        partner_level = 'Regular'
                    }
                    
                    const platform = await strapi.db.query('api::platform.platform').findOne({
                        where: {
                            id: 1
                        },
                        populate: {
                            partner: true
                        }
                    })
                    // console.log('platform', platform)
                    const partner_info = platform.partner.find(i => i.level === partner_level)
                    const total_amount = body.amount
                    
                    // 收入总金额 * (1 - 去掉支付平台费用比例) * 当前合作级别分成比例
                    // const transfer_amount = parseFloat(total_amount * ((100 - partner_info.transaction_fee) / 100) * (partner_info.interest / 100).toFixed(2));
                    const _amount = Math.round(total_amount * ((100 - partner_info?.transaction_fee || 0.6) / 100) * (partner_info.interest / 100));
                    
                    // const _amount = body.amount
                    if(_amount){
                        const income = _amount;
                        await strapi.entityService.update('plugin::users-permissions.user',user_id,{
                            data: {
                                income: user.income + _amount
                            }
                        })
                    }
                }
                //订单统计结束
            } else {
                console.error('缺少待更新内部订单数据', body)
            }
        }catch(e){
            console.error('afterPayment error:', e)
        }finally{
            if(updateOrder){
                const buyer_id = updateOrder.buyer?.id
                if(buyer_id){
                    const self_room = `user_room_${buyer_id}`
                    let resps = {
                        payOrderId: body.payOrderId,
                        state: body.state,
                    }
                    if(card_id){
                        resps.card_id = card_id
                    }
                    if(updateOrder?.card){
                        let _card = updateOrder.card
                        if(_card.type === 'resource'){
                            const orders = await strapi.db.query('api::order.order').findMany({
                                where: {
                                    buyer: buyer_id,
                                    card: _card.id
                                }
                            })
                            if(orders?.length > 0){
                                _card.authed_type = orders.map(i => i.authed_type)
                            }
                        }
                        _card.hasDetialAuth = true
                        _card.is_buyer = true
                        resps.commodity = _card 
                    }
                    if(project_id){
                        resps.project_id = project_id
                    }
                    console.log('self_room', self_room)
                    strapi.$io.raw({ event: 'pay:completed', rooms: [self_room], data: resps });
                }
            }
            return 'success'
        }
    },
    async withdraw(ctx) {
        // https://docs.jeequan.com/docs/jeepay/transfer_api
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(403, '请先登陆')
        }
        const { orders, exchange_code } = ctx.request.body?.data;
        // const bcrypt = require('bcryptjs');
        // console.log('ctx.request.body', ctx.request.body)
        
        // const isMatch = await bcrypt.compare(user_code, db_code);
        const userInfo = await strapi.entityService.findOne('plugin::users-permissions.user', user_id, {
            fields: ['id','username','income','withdraw','partner_level'],
            populate: {
                business_account: true
            }
        })
        if(userInfo){
            if(!userInfo.business_account?.exchange_code){
                ctx.throw(403, '请检查经营账户信息，补充操作密码')
            }
            // console.log('userInfo', userInfo)
            // console.log('exchange_code', exchange_code)
            
            const validExchangeCode = await strapi.plugins['users-permissions'].services.user.validatePassword(
              exchange_code,
              userInfo.business_account.exchange_code
            );
            
            // const auth = await isMatch(exchange_code, userInfo.business_account.exchange_code)
            if(!validExchangeCode){
                ctx.throw(403, '操作密码错误')
            }
        }
        /**
         * 准备数据
         * orders:提款订单id数组，用来验证并计算金额
         * 从用户个人数据中提取：business_account下三个字段：真实姓名，转账方式（目前限定支付宝），收款账号
        */
        if(!orders){
            ctx.throw(403, '请提供需要提现的订单号')
        }
        // console.log('userInfo', userInfo)
        if(!userInfo){
            ctx.throw(403,'请补充完整的用户商务资料')
        } else {
            if(!userInfo.business_account.real_name){
                ctx.throw(403,'请补充真实姓名')
            }
            if(!userInfo.business_account.cash_entry_type){ // 这里不要出现在前端要求用户填写，已近自动默认填写了支付宝，目前暂时只支持支付宝提现
                ctx.throw(403,'请补充收款方式')
            }
            if(!userInfo.business_account.accountNo){
                ctx.throw(403,'请补充收款账号')
            }
        }
        
        const withdraw_orders = await strapi.db.query('api::order.order').findMany({
            where: {
                id: {
                    $in: orders
                },
                card: {
                    creator: user_id
                },
                orderState: 2
            }
        })
        // console.log('withdraw_orders', withdraw_orders)
        if(withdraw_orders){
            const diff = orders.filter(i => !withdraw_orders.map(j => j.id)?.includes(i));
            if(diff?.length > 0){
                ctx.throw(404,`您要取现的订单：${diff?.map(i => `"${i}"`)}，没有查询到相应数据，请核实，或 联系管理人员协助`)
            }
            // console.log('userInfo', userInfo)
            const partner_level = userInfo.partner_level;
            const platform = await strapi.db.query('api::platform.platform').findOne({
                where: {
                    id: 1
                },
                populate: {
                    partner: true
                }
            })
            // console.log('platform', platform)
            // 兼容旧名称
            if(partner_level === 'level 1'){
                partner_level = 'Enterprise'
            }
            if(partner_level === 'level 2'){
                partner_level = 'Professional'
            }
            if(partner_level === 'level 3'){
                partner_level = 'Regular'
            }
            const partner_info = platform.partner.find(i => i.level === partner_level)
            const total_amount = withdraw_orders.map(i => i.jeepay_order?.amount)?.reduce((a, b) => a + b, 0)
            
            // 总金额 * (1 - 去掉支付平台费用比例) * 当前合作级别分成比例
            // const transfer_amount = parseFloat(total_amount * ((100 - partner_info.transaction_fee) / 100) * (partner_info.interest / 100).toFixed(2));
            const transfer_amount = Math.round(total_amount * ((100 - partner_info.transaction_fee) / 100) * (partner_info.interest / 100));
            // console.log('transfer_amount', transfer_amount)
            /** 
            {
                "ifCode":"wxpay", // wxpay-微信官方接口 ; alipay-支付宝官方接口
                "entryType":"WX_CASH", // 入账方式： WX_CASH-微信零钱; ALIPAY_CASH-支付宝转账; BANK_CARD-银行卡
                "amount":1, // 金额
                "accountName":"", // 收款人姓名 填入则验证姓名，否则不验证
                "mchOrderNo":"mho1629106169045", // 商户生成的转账订单号
                "sign":"3EB5A3B81E92DB41677E235363E7DDE3", // 签名
                "transferDesc":"测试转账", // 转账备注信息
                "reqTime":"1629106169", // 请求接口时间,13位时间戳
                "version":"1.0", // 接口版本号，固定：1.0
                "appId":"60cc3ba74ee0e6685f57eb1e", // 应用ID
                "accountNo":"a6BcIwtTvIqv1zXZohc61biryWok", //wxpay-openID, alipay-登录账号
                "clientIp":"192.166.1.132", // 用户IP
                "signType":"MD5", // 加密方式
                "currency":"CNY", // 币种
                "mchNo":"M1623997351" // 商户号,
                "notifyUrl": transferNotifyUrl  //转账完成后回调该URL,只有传了该值才会发起回调
            }
            */
            
            const mchOrderNo = strapi.service('api::order.order').createTransferMchOrderNo(user_id, userInfo.business_account.cash_entry_type, orders);
            let params = {
                ifCode: 'alipay',
                entryType: userInfo.business_account.cash_entry_type,
                amount: transfer_amount,
                mchOrderNo: mchOrderNo,
                accountName: userInfo.business_account.real_name,
                transferDesc: 'test_transfer',
                reqTime: Date.now(),
                version: '1.0',
                appId: appId,
                accountNo: userInfo.business_account.accountNo,
                clientIp: ctx.request.ip || ctx.request.ips[0],
                signType: 'MD5',
                currency: 'cny',
                mchNo: mchNo,
                notifyUrl: transferNotifyUrl
            }

            let sign = strapi.service('api::order.order').sign(params, secretKey);
            params.sign = sign;
            
            // console.log('params', params)
            const transferOrder = await strapi.service('api::order.order').createTransferOrder(params);
            // console.log('transferOrder', transferOrder)
            if(transferOrder){
                /**
                {
                    "code": 0,
                    "data": {
                        "accountNo": "1",
                        "amount": 11,
                        "channelOrderNo": "20210816110070001506260000372216",
                        "mchOrderNo": "1629106288",
                        "state": 2,
                        "transferId": "T202108161731281310004"
                    },
                    "msg": "SUCCESS",
                    "sign": "195BF6F112386F7FC8EA2AA7EECA1D33"
                }
                */
                const order_transfer = await strapi.db.query('api::order-transfer.order-transfer').create({
                    data: {
                        mchOrderNo: transferOrder.data.mchOrderNo,
                        jeepay_transferOrder: transferOrder.data,
                        withdrawer: user_id,
                        orders: {
                            connect: orders
                        }
                    }
                })
                await strapi.entityService.update('plugin::users-permissions.user',user_id,{
                    data: {
                        withdraw: userInfo.withdraw + transferOrder.data.amount
                    }
                })
                return {
                    state: 'success',
                    withdrawer: user_id,
                    orders: orders
                }
            }
        }
    },
    async transferNotify(ctx) {
        // console.log(ctx.request.body)
        // 当转账完成时(成功或失败)，支付网关会向商户系统发起回调通知。如果商户系统没有正确返回，支付网关会延迟再次通知。
        const { mchOrderNo } = ctx.request.body;
        if(!mchOrderNo){
            console.error('缺少商户生成转账订单号', ctx.request.body)
            return 'success'
        }
        await strapi.db.query('api::order-transfer.order-transfer').update({
            where: {
                mchOrderNo: mchOrderNo
            },
            data: {
                jeepay_transferOrder: ctx.request.body
            }
        })
        return 'success'
    },
    
    async find(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(403, '请先登陆')
        }
        const { offset, limit } = ctx.query
        
        const orders = await strapi.db.query('api::order.order').findMany({
            where: {
                buyer: user_id,
                orderState: 2,
            },
            select: ['id', 'orderState', 'purpose'],
            offset: offset, 
            limit: limit,
            populate: {
                card: {
                    fields: ['id', 'name', 'price'],
                    populate: {
                        cover: {
                            fields: ['id','ext','url']
                        }
                    }
                }
            }
        })
        if(orders){
            return orders
        }
    },
    async sales(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        if(!user_id){
            ctx.throw(403, '请先登陆')
        }
        const { offset, limit } = ctx.query
        
        const orders = await strapi.db.query('api::order.order').findMany({
            where: {
                card: {
                    creator: user_id
                },
                orderState: 2,
            },
            select: ['id', 'orderState', 'purpose', 'createdAt'],
            offset: offset, 
            limit: limit,
            populate: {
                card: {
                    select: ['id', 'name', 'price'],
                    populate: {
                        cover: {
                            select: ['id','ext','url']
                        },
                        creator: {
                            select: ['id', 'username'],
                            populate: {
                                profile: {
                                    populate: {
                                        avatar: {
                                            select: ['id', 'ext', 'url']
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                order_transfer: {
                    fields: ['id']
                }
            }
        })
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', user_id, {
            fields: ['id','username','income','withdraw','partner_level'],
            populate: {
                business_account: true
            }
        })
        // console.log('user', user)
        const partner_level = user.partner_level;
        const platform = await strapi.db.query('api::platform.platform').findOne({
            where: {
                id: 1
            },
            populate: {
                partner: true
            }
        })
        // console.log('platform', platform)
        const partner_info = platform.partner.find(i => i.level === partner_level)
        // console.log('partner_info', partner_info)
        if(orders){
            return {
                orders,
                partner_info
            }
        }
    }
}));
