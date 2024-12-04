'use strict';

/**
 * overview controller
 */
const sale_types = ['classroom', 'resource']
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::overview.overview',({strapi}) => ({
    // @ts-ignore
    async find(ctx) {
        return '请返回项目或任务查看对应信息'
    },
    async create(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        // @ts-ignore
        let attach_to = ctx.request.body.attach_to;
        // @ts-ignore
        let attach_to_id = Number(ctx.request.body.attach_to_id);
        // @ts-ignore
        let data = ctx.request.body.data;

        if(!user_id) {
            return '请先登陆'
        }
        if(!attach_to) {
            return '需要提供附加对象'
        }
        if(!attach_to_id) {
            return '需要提供附加对象ID'
        }
        let auth = false
        const cala_auth = (members,member_roles) => {
            // console.log(members,member_roles);
            const {ACL, is_blocked} = strapi.service('api::project.project').calc_ACL(members,member_roles,user_id);
            if(is_blocked){
                ctx.throw(401, '您已被管理员屏蔽，请联系管理员申诉')
            }
            const { read, create, modify, remove } = strapi.service('api::project.project').calc_collection_auth(ACL,'overview');
            auth = create

        }
        let project
        if(attach_to === 'project') {
            project = await strapi.service('api::project.project').find_projectByID(attach_to_id)
            if(project){
                const members = project.project_members;
                const member_roles = project.member_roles;
                cala_auth(members,member_roles)
            }
        }
        let card
        if(attach_to === 'card') {
            let members
            card = await strapi.service('api::card.card').find_cardByID(attach_to_id);
            if(card?.creator?.id === user_id){
                auth = true
            }else if(card){
                members = card.card_members;
                const member_roles = card.member_roles;
                const users = members.map(i => i.by_user.id);
                if(users.includes(user_id)){
                    cala_auth(members,member_roles);
                } else {
                    const belongedInfo = await strapi.service('api::project.project').find_belongedInfo_byCardID(attach_to_id);
                    let member_roles
                    if(belongedInfo?.belonged_project){
                        members = belongedInfo?.belonged_project.project_members;
                        member_roles = belongedInfo?.belonged_project.member_roles;
                    } else if (belongedInfo?.belonged_card){
                        members = belongedInfo?.belonged_card.card_members;
                        member_roles = belongedInfo?.belonged_card.member_roles;
                    } else {
                        ctx.throw(403, '您无权执行此操作')
                    }
                    cala_auth(members,member_roles)
                }
            }
        }
        if(!auth) {
            ctx.throw(403, '您没有权限执行此操作');
            return
        }
        let params = data;
        params.creator = user_id;

        var now = new Date();
        var iso = now.toISOString();

        params.publishedAt = iso;
        const response = {
            team_id: ctx.default_team?.id
        }
        if(attach_to === 'project') {
            params.project = attach_to_id;
            response.project_id = project.id
        }
        if(attach_to === 'card') {
            params.card = attach_to_id;
            response.card_id = card.id
        }
        // console.log(params);
        let media_size
        const new_overview = await strapi.entityService.create('api::overview.overview',{
            data: params,
            populate: {
                media: {
                    fields: ['ext','url']
                }
            }
        })
        if(new_overview) {
            response.data = new_overview
            if(sale_types.includes(card.type)){
                delete response.data.media
                response.data.card = {
                    id: card.id,
                    type: card.type
                }
            }
            strapi.$publish('overview:created', [ctx.room_name], response);
            return new_overview;
        }
    },
    async findOne(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;

        let auth;
        const overview = await strapi.service('api::overview.overview').find_overview_byID(id);
        if(overview){
            const calc_info = await strapi.service('api::overview.overview').calc_overview_auth(overview,user_id);
            auth = calc_info.read
        }


        if(auth) {
            if(overview?.project){
                delete overview.project;
            }
            if(overview?.card){
                delete overview.card;
            }
            return overview
        } else {
            ctx.throw(401, '您无权查看该内容')
        }
    },
    async delete(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;
        // console.log(user_id, id, project_id);

        if(!user_id) {
            return '您无权访问该数据'
        }
        if(!id) {
            return '需要提供版本ID'
        }

        let auth;
        const overview = await strapi.service('api::overview.overview').find_overview_byID(id);
        
        if(overview){
            // 已售出的内容不能删除
            if(overview.card){
                const canRemove = await strapi.service('api::card.card').checkRemoveLock({
                    card_id: overview.card.id
                })
                // return canRemove
                if(canRemove.locked){
                    return canRemove.message
                }
            }
            
            const calc_info = await strapi.service('api::overview.overview').calc_overview_auth(overview,user_id);
            auth = calc_info.remove
        }
        if(auth) {
            process.nextTick(async () => {
                try {
                    await strapi.service('api::overview.overview').remove_overview({
                        overview: overview
                    })
                } catch (error) {
                  console.error('After update processing error:', error);
                }
            });
            const response = {
                team_id: ctx.default_team?.id,
                data: {
                    removed_overview: id
                }
            }
            if(overview.card){
                response.data.card = {
                    id: overview.card.id,
                    type: overview.card.type
                }
            }
            if(overview.project){
                response.data.project = {
                    id: overview.project.id
                }
            }
            strapi.$publish('overview:deleted', [ctx.room_name], response);
            return response
        } else {
            ctx.throw(403, '您无权执行此操作')
        }
    },
    async update(ctx) {
        await this.validateQuery(ctx);
        const user_id = Number(ctx.state.user.id);
        const { id } = ctx.params;
        // @ts-ignore
        let data = ctx.request.body.data;

        if(!user_id) {
            ctx.throw(403, '您无权执行此操作')
        }
        if(!id) {
            ctx.throw(400, '您无权执行此操作')
        }

        let auth;
        let fields_permission = [];
        let prv_media_size
        let prv_media_url
        const overview = await strapi.service('api::overview.overview').find_overview_byID(id);
        if(overview){
            prv_media_size = overview.media?.size || 0
            prv_media_url = overview.media?.url;
            // console.log('permission start');
            const permission = await strapi.service('api::overview.overview').calc_overview_auth(overview,user_id);
            // console.log('permission end', permission);
            auth = permission.modify
            fields_permission = permission.fields_permission
        }

        // console.log('fields_permission',fields_permission);
        if(auth) {
            let media_size
            let params = strapi.service('api::overview.overview').process_updateOverview_params(data,fields_permission);
            // console.log(data,params);
            const update_overview = await strapi.entityService.update('api::overview.overview', id,{
                data: params,
                populate: {
                    media: {
                        fields: ['id','ext','url', 'size']
                    },
                    project: {
                        fields: ['id','total_filesize']
                    },
                    card: {
                        fields: ['id', 'type']
                    }
                }
            });
            // 是否开启转码
            const MTS_ENABLE = process.env.MTS_ENABLE === 'true';
            if(update_overview?.media?.id && !update_overview?.mps_info && MTS_ENABLE){
                media_size = update_overview.media.size || 0
                const mediaURL = strapi.service('api::ali.ali').processUrl(update_overview?.media?.url, update_overview?.media?.ext);
                // console.log('mediaURL',mediaURL)
                if(mediaURL){
                    const res = await strapi.service('api::ali.ali').addMedia(mediaURL);
                    // if(res){
                    //     console.log('addMedia',res)
                    // }
                }
            }
            let response = {
                team_id: ctx.default_team?.id,
                data: update_overview
            }
            if(update_overview?.card?.type === 'classroom'){
                delete response.data.media
                delete response.data.mps_info
            }
            strapi.$publish('overview:updated', [ctx.room_name], response);
            
            process.nextTick(async () => {
                try {
                  if(prv_media_url){
                    const params = {
                      url: prv_media_url,
                      urls: null,
                    }
                    await strapi.service('api::ali.ali').removeObject(params)
                  }
                } catch (error) {
                  console.error('After update processing error:', error);
                }
            });
            return update_overview
        } else {
            ctx.throw(403, '您无权执行此操作')
        }
    },
}));
