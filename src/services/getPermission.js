module.exports = {
    getPermission: async function(project_id,user_id) {
        const project = await strapi.entityService.findOne('api::project.project',project_id,{
            populate: {
                project_permission: {
                    populate: {
                        collection_permission: {
                            populate: {
                                fields_permission: true
                            }
                        }
                    }
                },
                card_permission: {
                    populate: {
                        collection_permission: {
                            populate: {
                                fields_permission: true
                            }
                        }
                    }
                },
                role: {
                    populate: {
                        members: {
                            fields: ['id']
                        }
                    }
                }
            }
        })
        if(project) {
            const user_role = project.role.filter(i => i.members.map(u => u.id === user_id)).map(p => p.role);
            const user_project_permission = project.project_permission.filter(i => user_role.includes(i.role));
            const user_card_permission = project.card_permission.filter(i => user_role.includes(i.role));

            const permission = { user_project_permission, user_card_permission }

            return permission
        }
    },
};