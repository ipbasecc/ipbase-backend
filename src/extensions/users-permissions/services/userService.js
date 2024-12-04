// src/extensions/users-permissions/services/userService.js


const processMembers = (_team, user_id) => {
      // 如果用户是 “外部成员”，只返回基础数据，删除敏感数据
      const userMember = _team?.members?.find(i => i.by_user.id === user_id);
      const roles_byMember = userMember.member_roles.map(i => i.id);
      const roles_byTeam = _team.member_roles.map(i => i.id);
      const userMember_byTeam = roles_byTeam.filter(i => roles_byMember.includes(i));
      const userMemberRoles = _team.member_roles.filter(role => userMember_byTeam.includes(role.id));

      const process_external_data = () => {
        _team.members = [ userMember ];
        delete _team.member_roles;
        delete _team.team_channels;
        _team.projects = _team.projects?.filter(i => i.project_members?.map(j => j.id).includes(userMember.id));
        _team.projects = _team.projects.map(i => {
            i.project_members = [ userMember ];
            return i
        })
        _team.isExternal = true
      }
      const process_unconfirmed_data = () => {
        return {
          id: _team.id,
          name: _team.name,
          display_name: _team.display_name,
          team_logo: _team.team_logo,
          status: 'unconfirmed'
        }
      }
      const process_blocked_data = () => {
        return {
          id: _team.id,
          name: _team.name,
          display_name: _team.display_name,
          team_logo: _team.team_logo,
          status: 'blocked'
        }
      }
      if(userMemberRoles?.length > 0){
          const _userRoles = userMemberRoles.map(i => i.subject);
          if(_userRoles.includes('external')){
            process_external_data();
          }
          if(_userRoles.includes('unconfirmed')){
            _team = process_unconfirmed_data();
          }
          if(_userRoles.includes('blocked')){
            _team = process_blocked_data();
          }
      } else if (userMemberRoles?.length === 0) {
          process_external_data();
      }
      return _team
    };

const processUserdata = async (_user, _user_id) => {
        // @ts-ignore
        if(_user.default_team){
            // @ts-ignore
            let _team = await strapi.service('api::team.team').filterByAuth(_user.default_team, _user_id);
            // console.log('_team', _team)
            _user.default_team = _team ? processMembers(_team, _user_id) : null;
        }
        return _user
    };

module.exports = {
    processMembers,
    processUserdata
};