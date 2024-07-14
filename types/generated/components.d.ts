import type { Schema, Attribute } from '@strapi/strapi';

export interface AtomTag extends Schema.Component {
  collectionName: 'components_atom_tags';
  info: {
    displayName: 'tag';
    icon: 'hashtag';
  };
  attributes: {
    tag: Attribute.String;
  };
}

export interface AtomVersion extends Schema.Component {
  collectionName: 'components_atom_versions';
  info: {
    displayName: 'version';
    icon: 'write';
  };
  attributes: {
    name: Attribute.String;
    description: Attribute.Text;
    icon: Attribute.String;
  };
}

export interface AtomWorkingDay extends Schema.Component {
  collectionName: 'components_atom_working_days';
  info: {
    displayName: 'Working Day';
    icon: 'calendar';
    description: '';
  };
  attributes: {
    event: Attribute.Text;
    from: Attribute.Date & Attribute.Required;
    to: Attribute.Date & Attribute.Required;
  };
}

export interface BizCardProvider extends Schema.Component {
  collectionName: 'components_biz_card_providers';
  info: {
    displayName: 'provider';
    icon: 'book';
  };
  attributes: {
    title: Attribute.String;
    invite_uri: Attribute.Text;
    invite_qrcode: Attribute.Media<'images'>;
    provider_icon: Attribute.Media<'images'>;
  };
}

export interface ProjectChecklist extends Schema.Component {
  collectionName: 'components_project_checklists';
  info: {
    displayName: 'checklist';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    content: Attribute.Component<'project.todo', true>;
  };
}

export interface ProjectCollectionPermission extends Schema.Component {
  collectionName: 'components_project_collection_permissions';
  info: {
    displayName: 'collection_permission';
    description: '';
  };
  attributes: {
    collection: Attribute.String & Attribute.Required;
    create: Attribute.Boolean & Attribute.Required & Attribute.DefaultTo<true>;
    read: Attribute.Boolean & Attribute.Required & Attribute.DefaultTo<true>;
    modify: Attribute.Boolean & Attribute.Required & Attribute.DefaultTo<false>;
    delete: Attribute.Boolean & Attribute.Required & Attribute.DefaultTo<false>;
    fields_permission: Attribute.Component<'project.fields-permission', true>;
  };
}

export interface ProjectFieldsPermission extends Schema.Component {
  collectionName: 'components_project_fields_permissions';
  info: {
    displayName: 'fields_permission';
    description: '';
  };
  attributes: {
    field: Attribute.String & Attribute.Required;
    modify: Attribute.Boolean & Attribute.Required & Attribute.DefaultTo<true>;
  };
}

export interface ProjectInviteUri extends Schema.Component {
  collectionName: 'components_project_invite_uris';
  info: {
    displayName: 'invite_uri';
    icon: 'envelop';
    description: '';
  };
  attributes: {
    invite_code: Attribute.Text;
    max_total: Attribute.Integer;
    up_time: Attribute.DateTime;
    enable: Attribute.Boolean & Attribute.DefaultTo<true>;
    invitor: Attribute.Relation<
      'project.invite-uri',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    was_inviteds: Attribute.Relation<
      'project.invite-uri',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    message: Attribute.Text;
  };
}

export interface ProjectPermission extends Schema.Component {
  collectionName: 'components_project_permissions';
  info: {
    displayName: 'permission';
    description: '';
  };
  attributes: {
    role: Attribute.String;
    collection_permission: Attribute.Component<
      'project.collection-permission',
      true
    >;
  };
}

export interface ProjectProjectPermissionTemplate extends Schema.Component {
  collectionName: 'components_project_project_permission_templates';
  info: {
    displayName: 'permission_template';
    description: '';
  };
  attributes: {
    project_name_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_description_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_type_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_cover_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_board_create: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_board_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_overview_create: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_overview_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_defaultVersion_motify: Attribute.Boolean &
      Attribute.DefaultTo<true>;
    project_todogroup_create: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_todogroup_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_todogroup_chat_service: Attribute.Boolean &
      Attribute.DefaultTo<true>;
    project_invite: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_jsonContent_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_storge_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_permisssion_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_group_create: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_group_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_kanban_create: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_kanban_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_column_create: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_column_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_role_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    project_permission_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_create: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_name_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_type_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_status_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_content_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_jsonContent_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_overview_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_defaultVersion_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_importance_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_urgency_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_score_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_documnets_create: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_documnets_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_todogroups_create: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_todogroups_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_chatService_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_storage_access: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_storage_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_colorMarker_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_role_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
    card_permission_motify: Attribute.Boolean & Attribute.DefaultTo<true>;
  };
}

export interface ProjectRole extends Schema.Component {
  collectionName: 'components_project_roles';
  info: {
    displayName: 'role';
    icon: 'shield';
    description: '';
  };
  attributes: {
    role: Attribute.String;
    members: Attribute.Relation<
      'project.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    collection_permission: Attribute.Component<
      'project.collection-permission',
      true
    >;
  };
}

export interface ProjectShareCode extends Schema.Component {
  collectionName: 'components_project_share_codes';
  info: {
    displayName: 'share_code';
    icon: 'paperPlane';
    description: '';
  };
  attributes: {
    code: Attribute.String;
    disable: Attribute.Boolean;
    max_count: Attribute.Integer & Attribute.DefaultTo<20>;
    up_time: Attribute.Date;
    creator: Attribute.Relation<
      'project.share-code',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    props: Attribute.JSON;
  };
}

export interface ProjectTodo extends Schema.Component {
  collectionName: 'components_project_todo';
  info: {
    displayName: 'todo';
    description: '';
  };
  attributes: {
    status: Attribute.String;
    type: Attribute.String;
    start: Attribute.DateTime;
    end: Attribute.DateTime;
    executor: Attribute.Relation<
      'project.todo',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    content: Attribute.RichText;
    jsonContent: Attribute.JSON;
  };
}

export interface ProjectTodos extends Schema.Component {
  collectionName: 'components_project_todos';
  info: {
    displayName: 'todos';
  };
  attributes: {
    title: Attribute.String;
    todo: Attribute.Component<'project.todo', true>;
  };
}

export interface UserConfig extends Schema.Component {
  collectionName: 'components_user_configs';
  info: {
    displayName: 'config';
    icon: 'cog';
    description: '';
  };
  attributes: {
    default_bizcard: Attribute.Relation<
      'user.config',
      'oneToOne',
      'api::bizcard.bizcard'
    >;
    lang: Attribute.String;
    theme: Attribute.String;
    navigation: Attribute.JSON;
    project_preference: Attribute.JSON;
  };
}

export interface UserCreator extends Schema.Component {
  collectionName: 'components_user_creators';
  info: {
    displayName: 'creator';
    icon: 'user';
    description: '';
  };
  attributes: {
    role: Attribute.String;
    title: Attribute.String;
    description: Attribute.Text;
    responsibility: Attribute.Text;
    isOwner: Attribute.Boolean & Attribute.DefaultTo<false>;
    isExcutor: Attribute.Boolean & Attribute.DefaultTo<false>;
    user: Attribute.Relation<
      'user.creator',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface UserProfile extends Schema.Component {
  collectionName: 'components_user_profiles';
  info: {
    displayName: 'profile';
    icon: 'user';
    description: '';
  };
  attributes: {
    description: Attribute.Text;
    bio: Attribute.Text;
    avatar: Attribute.Media<'images'>;
    brand: Attribute.Media<'images' | 'videos', true>;
    cover: Attribute.Media<'images'>;
    title: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'atom.tag': AtomTag;
      'atom.version': AtomVersion;
      'atom.working-day': AtomWorkingDay;
      'biz-card.provider': BizCardProvider;
      'project.checklist': ProjectChecklist;
      'project.collection-permission': ProjectCollectionPermission;
      'project.fields-permission': ProjectFieldsPermission;
      'project.invite-uri': ProjectInviteUri;
      'project.permission': ProjectPermission;
      'project.project-permission-template': ProjectProjectPermissionTemplate;
      'project.role': ProjectRole;
      'project.share-code': ProjectShareCode;
      'project.todo': ProjectTodo;
      'project.todos': ProjectTodos;
      'user.config': UserConfig;
      'user.creator': UserCreator;
      'user.profile': UserProfile;
    }
  }
}
