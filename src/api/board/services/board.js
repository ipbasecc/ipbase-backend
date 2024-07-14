// @ts-nocheck
'use strict';

/**
 * board service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::board.board', ({ strapi }) => ({
    async find_projectByBoardID(...args){
        const [board_id] = args;
        const board = await strapi.entityService.findOne('api::board.board',board_id,{
            populate: {
                project: {
                    fields: ['id']
                }
            }
        })
        if(board){
            const project_id = board.project.id;
            const project = await strapi.service('api::project.project').find_projectByID(project_id);
            if(project){
                return project
            }
        }
    },
    async process_updateBoardParams(...args) {
        const ctx = strapi.requestContext.get();
        const [data,fields_permission] = args;
        let params = {};
        if(fields_permission.includes('name') && data.name){
            params.name = data.name
        } else if(!fields_permission.includes('name') && data.name) {
            ctx.throw(401, '您没有权限修改任务集名称')
        }
        return params
    },
    async create_and_init_board(...args){
        const [ data, user_id ] = args;
        let new_column;
        let new_kanban;
        let new_group;
        let new_board;

        var now = new Date();
        var iso = now.toISOString();

        let group_name_by_type = '默认分组';
        let kanban_name_by_type = '默认看板';
        let column_name_by_type = '默认分栏';
        if(data?.type === 'classroom'){
            group_name_by_type = '默认课堂';
            kanban_name_by_type = '默认课程';
            column_name_by_type = '默认章节';
        }
        if(data?.type === 'segment'){
            group_name_by_type = '默认版本';
            kanban_name_by_type = '默认桌面';
            column_name_by_type = 'reel 0';
        }
        new_column = await strapi.entityService.create('api::column.column',{
            data: {
                name: column_name_by_type,
                publishedAt: iso
            }
        })
        if(new_column){
        new_kanban = await strapi.entityService.create('api::kanban.kanban',{
            data: {
                title: kanban_name_by_type,
                type: data?.type || 'kanban',
                columns: {
                    connect: [new_column.id]
                },
                publishedAt: iso
            }
        })}
        if(new_kanban){
        new_group = await strapi.entityService.create('api::group.group',{
            data: {
                name: kanban_name_by_type,
                kanbans: {
                    connect: [new_kanban.id]
                },
                publishedAt: iso
            }
        })}
        if(new_group){
            new_board = await strapi.entityService.create('api::board.board', {
                data: {
                    name: data.name,
                    type: data.type || 'kanban',
                    publishedAt: iso,
                    project: {
                        set: [data.project_id]
                    },
                    groups: {
                        connect: [new_group.id]
                    },
                    creator: user_id,
                    belonged: 'project'
                },
                populate: {
                    groups: {
                        populate: {
                            kanbans: true,
                            icon: {
                                fields: ['ext','url']
                            }
                        }
                    }
                }
            })
        }
        if(new_board){
            return new_board
        }
    },
    async initRole(...args) {
        const [user_id] = args;
        const { roleBase } = require('./roleBase.js');
        const role_base = await roleBase();
        
        try {
            const roleBaseResults = await Promise.allSettled(role_base.map(async (i) => {
                const res = await strapi.entityService.create('api::member-role.member-role', {
                    data: {
                    subject: i.role,
                    ACL: i.ACL,
                    },
                });
                return res;
            }));

            const successfulResults = roleBaseResults.filter((result) => result.status === 'fulfilled');
            const role_creator = successfulResults.find((result) => result.value.subject === 'creator');
            const role_owner = successfulResults.find((result) => result.value.subject === 'owner');

            if (role_creator && role_owner) {
            const creator = await strapi.entityService.create('api::member.member', {
                data: {
                    by_user: user_id,
                    member_roles: {
                    set: [role_creator.value.id, role_owner.value.id],
                    },
                },
            });

            if (creator) {
                const data = { roles: successfulResults, members: creator };
                return data;
            }
            }
        } catch (error) {
            console.error('Error during initialization:', error);
            throw error;
        }
    },
    async create_attachBoard(...args){
        const [data,user_id] = args;
        // 此段逻辑为附加board到第三方应用做准备
        const init = await strapi.service('api::board.board').initRole(user_id);
        if(init){
            let params = data;
            let member_roles = init.roles.map(i => i.value.id);
            params.member_roles = member_roles;

            const res = await strapi.service('api::board.board').create_and_init_board(params,user_id);
            if(res){
                return res
            }
        }
    },
    async find_board_byID(...args){
        const [board_id] = args;
        const board = await strapi.entityService.findOne('api::board.board',board_id,{
            populate: {
                board_members: {
                    populate: {
                        member_roles: {
                            populate: {
                                fields_permission: true
                            }
                        },
                        by_user: {
                            fields: ['id']
                        }
                    }
                },
                board_members_roles: {
                    populate: {
                        ACL: {
                            populate: {
                                fields_permission: true
                            }
                        }
                    }
                },
                groups: {
                    populate: {
                        kanbans: {
                            populate: {
                                icon: {
                                    fields: ['id','url','ext']
                                }
                            }
                        }
                    }
                },
                creator: {
                    populate: {
                        profile: {
                            populate: {
                                avatar: {
                                    fields: ['id','url','ext']
                                }
                            }
                        }
                    }
                }
            }
        })
        if(board){
            return board
        }
    },
    async update_board(...args){
        const [ params, board_id ] = args;
        const board = await strapi.entityService.update('api::board.board', board_id, {
            data: params,
            populate: {
                board_members: {
                    populate: {
                        member_roles: {
                            populate: {
                                fields_permission: true
                            }
                        },
                        by_user: {
                            fields: ['id']
                        }
                    }
                },
                board_members_roles: {
                    populate: {
                        ACL: {
                            populate: {
                                fields_permission: true
                            }
                        }
                    }
                },
                groups: {
                    populate: {
                        kanbans: {
                            populate: {
                                icon: {
                                    fields: ['id','url','ext']
                                }
                            }
                        }
                    }
                },
                creator: {
                    populate: {
                        profile: {
                            populate: {
                                avatar: {
                                    fields: ['id','url','ext']
                                }
                            }
                        }
                    }
                }
            }
        });
        if(board) return board
    },
    query_populate(){
        const _ = {
            populate: {
                board_members: {
                    populate: {
                        member_roles: {
                            populate: {
                                fields_permission: true
                            }
                        },
                        by_user: {
                            fields: ['id']
                        }
                    }
                },
                board_members_roles: {
                    populate: {
                        ACL: {
                            populate: {
                                fields_permission: true
                            }
                        }
                    }
                },
                groups: {
                    populate: {
                        kanbans: {
                            populate: {
                                icon: {
                                    fields: ['id','url','ext']
                                }
                            }
                        }
                    }
                },
                creator: {
                    populate: {
                        profile: {
                            populate: {
                                avatar: {
                                    fields: ['id','url','ext']
                                }
                            }
                        }
                    }
                }
            }
        }
        return _
    }
}));
