import type { Schema, Attribute } from '@strapi/strapi';

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    name: 'Permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    name: 'User';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    username: Attribute.String;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    registrationToken: Attribute.String & Attribute.Private;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    preferedLanguage: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    name: 'Role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    name: 'Api Token';
    singularName: 'api-token';
    pluralName: 'api-tokens';
    displayName: 'Api Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    name: 'API Token Permission';
    description: '';
    singularName: 'api-token-permission';
    pluralName: 'api-token-permissions';
    displayName: 'API Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    name: 'Transfer Token';
    singularName: 'transfer-token';
    pluralName: 'transfer-tokens';
    displayName: 'Transfer Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    name: 'Transfer Token Permission';
    description: '';
    singularName: 'transfer-token-permission';
    pluralName: 'transfer-token-permissions';
    displayName: 'Transfer Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    singularName: 'file';
    pluralName: 'files';
    displayName: 'File';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    alternativeText: Attribute.String;
    caption: Attribute.String;
    width: Attribute.Integer;
    height: Attribute.Integer;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    ext: Attribute.String;
    mime: Attribute.String & Attribute.Required;
    size: Attribute.Decimal & Attribute.Required;
    url: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    singularName: 'folder';
    pluralName: 'folders';
    displayName: 'Folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    singularName: 'release';
    pluralName: 'releases';
    displayName: 'Release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    timezone: Attribute.String;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    singularName: 'release-action';
    pluralName: 'release-actions';
    displayName: 'Release Action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    contentType: Attribute.String & Attribute.Required;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    isEntryValid: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    name: 'permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    name: 'role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Attribute.String;
    type: Attribute.String & Attribute.Unique;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    name: 'user';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    profile: Attribute.Component<'user.profile'>;
    user_channel: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::channel.channel'
    >;
    storageCount: Attribute.Float;
    bizcards: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::bizcard.bizcard'
    >;
    bizcard_collection_items: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::bizcard-collection.bizcard-collection'
    >;
    config: Attribute.Component<'user.config'>;
    elements: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::element.element'
    >;
    favorites: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::favorite.favorite'
    >;
    liked_element: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToMany',
      'api::element.element'
    >;
    unliked_element: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToMany',
      'api::element.element'
    >;
    viewed_elements: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToMany',
      'api::element.element'
    >;
    follows: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToMany',
      'plugin::users-permissions.user'
    >;
    followed: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToMany',
      'plugin::users-permissions.user'
    >;
    self_tags: Attribute.JSON;
    created_elements: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::element.element'
    >;
    messages: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::message.message'
    >;
    talkers: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::talker.talker'
    >;
    liked_messages: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToMany',
      'api::message.message'
    >;
    unliked_messages: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToMany',
      'api::message.message'
    >;
    mm_profile: Attribute.JSON;
    todogroups: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::todogroup.todogroup'
    >;
    executor_of_columns: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::column.column'
    >;
    followed_cards: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToMany',
      'api::card.card'
    >;
    mm_projectChatService_team: Attribute.JSON;
    created_projects: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::project.project'
    >;
    created_kanbans: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::kanban.kanban'
    >;
    created_groups: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::group.group'
    >;
    created_boards: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::board.board'
    >;
    created_columns: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::column.column'
    >;
    created_cards: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::card.card'
    >;
    storage_files: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::storage-file.storage-file'
    >;
    created_storages: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::storage.storage'
    >;
    storages: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::storage.storage'
    >;
    document: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::document.document'
    >;
    projects: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToMany',
      'api::project.project'
    >;
    mm_user_id: Attribute.UID;
    executor_todo: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::todo.todo'
    >;
    schedules: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::schedule.schedule'
    >;
    can_read_schedule: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'api::schedule.schedule'
    >;
    can_write_schedule: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'api::schedule.schedule'
    >;
    by_members: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::member.member'
    >;
    user_documents: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::document.document'
    >;
    schedule_events: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::schedule-event.schedule-event'
    >;
    created_schedule: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::schedule.schedule'
    >;
    default_team: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::team.team'
    >;
    initialization: Attribute.Boolean & Attribute.DefaultTo<false>;
    feature_key: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    singularName: 'locale';
    pluralName: 'locales';
    collectionName: 'locales';
    displayName: 'Locale';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          min: 1;
          max: 50;
        },
        number
      >;
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBizcardBizcard extends Schema.CollectionType {
  collectionName: 'bizcards';
  info: {
    singularName: 'bizcard';
    pluralName: 'bizcards';
    displayName: 'bizcard';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    avatar: Attribute.Media<'images'>;
    name: Attribute.String;
    title: Attribute.String;
    description: Attribute.Text;
    email: Attribute.Email;
    address: Attribute.Text;
    providers: Attribute.Component<'biz-card.provider', true>;
    bizcard_collection: Attribute.Relation<
      'api::bizcard.bizcard',
      'oneToOne',
      'api::bizcard-collection.bizcard-collection'
    >;
    user: Attribute.Relation<
      'api::bizcard.bizcard',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    alias: Attribute.String;
    phone: Attribute.String;
    default_provider: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::bizcard.bizcard',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::bizcard.bizcard',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBizcardCollectionBizcardCollection
  extends Schema.CollectionType {
  collectionName: 'bizcard_collections';
  info: {
    singularName: 'bizcard-collection';
    pluralName: 'bizcard-collections';
    displayName: 'bizcardCollectionItem';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String;
    comment: Attribute.Text;
    tags: Attribute.Component<'atom.tag', true>;
    bizcard: Attribute.Relation<
      'api::bizcard-collection.bizcard-collection',
      'oneToOne',
      'api::bizcard.bizcard'
    >;
    user: Attribute.Relation<
      'api::bizcard-collection.bizcard-collection',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::bizcard-collection.bizcard-collection',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::bizcard-collection.bizcard-collection',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBoardBoard extends Schema.CollectionType {
  collectionName: 'boards';
  info: {
    singularName: 'board';
    pluralName: 'boards';
    displayName: 'board';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String;
    unread_count: Attribute.Integer;
    metadata: Attribute.JSON;
    project: Attribute.Relation<
      'api::board.board',
      'manyToOne',
      'api::project.project'
    >;
    groups: Attribute.Relation<
      'api::board.board',
      'oneToMany',
      'api::group.group'
    >;
    creator: Attribute.Relation<
      'api::board.board',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    mm_channel_id: Attribute.UID;
    mm_team_id: Attribute.UID;
    board_members: Attribute.Relation<
      'api::board.board',
      'oneToMany',
      'api::member.member'
    >;
    board_members_roles: Attribute.Relation<
      'api::board.board',
      'oneToMany',
      'api::member-role.member-role'
    >;
    belonged: Attribute.String;
    readonly: Attribute.Boolean & Attribute.DefaultTo<false>;
    protected: Attribute.Boolean & Attribute.DefaultTo<false>;
    type: Attribute.Enumeration<['kanban', 'classroom', 'segment', 'assets']> &
      Attribute.DefaultTo<'kanban'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::board.board',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::board.board',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCardCard extends Schema.CollectionType {
  collectionName: 'cards';
  info: {
    singularName: 'card';
    pluralName: 'cards';
    displayName: 'card';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String;
    type: Attribute.String & Attribute.DefaultTo<'task'>;
    status: Attribute.String;
    content: Attribute.RichText;
    followed_bies: Attribute.Relation<
      'api::card.card',
      'manyToMany',
      'plugin::users-permissions.user'
    >;
    jsonContent: Attribute.JSON;
    default_version: Attribute.Integer;
    overviews: Attribute.Relation<
      'api::card.card',
      'oneToMany',
      'api::overview.overview'
    >;
    importance: Attribute.Decimal & Attribute.DefaultTo<40>;
    urgency: Attribute.Decimal & Attribute.DefaultTo<40>;
    score: Attribute.Integer & Attribute.DefaultTo<1>;
    card_kanban: Attribute.Relation<
      'api::card.card',
      'oneToOne',
      'api::kanban.kanban'
    >;
    todogroups: Attribute.Relation<
      'api::card.card',
      'oneToMany',
      'api::todogroup.todogroup'
    >;
    chat_service: Attribute.JSON;
    color_marker: Attribute.String;
    private: Attribute.Boolean & Attribute.DefaultTo<false>;
    creator: Attribute.Relation<
      'api::card.card',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    blocked: Attribute.Relation<
      'api::card.card',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    storage: Attribute.Relation<
      'api::card.card',
      'oneToOne',
      'api::storage.storage'
    >;
    column: Attribute.Relation<
      'api::card.card',
      'manyToOne',
      'api::column.column'
    >;
    schedule: Attribute.Relation<
      'api::card.card',
      'oneToOne',
      'api::schedule.schedule'
    >;
    card_members: Attribute.Relation<
      'api::card.card',
      'manyToMany',
      'api::member.member'
    >;
    member_roles: Attribute.Relation<
      'api::card.card',
      'oneToMany',
      'api::member-role.member-role'
    >;
    readonly: Attribute.Boolean & Attribute.DefaultTo<false>;
    protected: Attribute.Boolean & Attribute.DefaultTo<false>;
    card_documents: Attribute.Relation<
      'api::card.card',
      'oneToMany',
      'api::document.document'
    >;
    expand: Attribute.Boolean & Attribute.DefaultTo<true>;
    mm_thread: Attribute.JSON;
    share_codes: Attribute.Component<'project.share-code', true>;
    mm_feedback_group: Attribute.JSON;
    feedback: Attribute.Relation<
      'api::card.card',
      'oneToOne',
      'api::todogroup.todogroup'
    >;
    completed_by: Attribute.Relation<
      'api::card.card',
      'manyToMany',
      'api::member.member'
    >;
    disable_share: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::card.card', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::card.card', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiCategoryCategory extends Schema.CollectionType {
  collectionName: 'categories';
  info: {
    singularName: 'category';
    pluralName: 'categories';
    displayName: 'category';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'unCategory'>;
    icon: Attribute.String;
    sub_category: Attribute.Relation<
      'api::category.category',
      'oneToMany',
      'api::category.category'
    >;
    belong_category: Attribute.Relation<
      'api::category.category',
      'manyToOne',
      'api::category.category'
    >;
    elements: Attribute.Relation<
      'api::category.category',
      'oneToMany',
      'api::element.element'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiChannelChannel extends Schema.CollectionType {
  collectionName: 'channels';
  info: {
    singularName: 'channel';
    pluralName: 'channels';
    displayName: 'channel';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    description: Attribute.Text;
    cover: Attribute.Media<'images' | 'videos', true>;
    slogan: Attribute.Text;
    brand: Attribute.Media<'images'>;
    avatar: Attribute.Media<'images'>;
    workingday: Attribute.Component<'atom.working-day', true>;
    post: Attribute.Relation<
      'api::channel.channel',
      'oneToOne',
      'api::post.post'
    >;
    channel_owner: Attribute.Relation<
      'api::channel.channel',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    navigation: Attribute.JSON;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::channel.channel',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::channel.channel',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiColumnColumn extends Schema.CollectionType {
  collectionName: 'columns';
  info: {
    singularName: 'column';
    pluralName: 'columns';
    displayName: 'column';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String;
    status: Attribute.String & Attribute.DefaultTo<'pending'>;
    executor: Attribute.Relation<
      'api::column.column',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    unread_count: Attribute.Integer;
    kanban: Attribute.Relation<
      'api::column.column',
      'manyToOne',
      'api::kanban.kanban'
    >;
    type: Attribute.String;
    cards: Attribute.Relation<
      'api::column.column',
      'oneToMany',
      'api::card.card'
    >;
    creator: Attribute.Relation<
      'api::column.column',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    readonly: Attribute.Boolean & Attribute.DefaultTo<false>;
    protected: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::column.column',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::column.column',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDocumentDocument extends Schema.CollectionType {
  collectionName: 'documents';
  info: {
    singularName: 'document';
    pluralName: 'documents';
    displayName: 'document';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    title: Attribute.String;
    jsonContent: Attribute.JSON;
    by_card: Attribute.Relation<
      'api::document.document',
      'manyToOne',
      'api::card.card'
    >;
    creator: Attribute.Relation<
      'api::document.document',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    by_project: Attribute.Relation<
      'api::document.document',
      'manyToOne',
      'api::project.project'
    >;
    by_user: Attribute.Relation<
      'api::document.document',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    type: Attribute.String & Attribute.DefaultTo<'document'>;
    mm_thread: Attribute.JSON;
    passcode: Attribute.Password;
    share_codes: Attribute.Component<'project.share-code', true>;
    disable_share: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::document.document',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::document.document',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiElementElement extends Schema.CollectionType {
  collectionName: 'elements';
  info: {
    singularName: 'element';
    pluralName: 'elements';
    displayName: 'element';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    title: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'untitled element'>;
    type: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'article'>;
    description: Attribute.Text;
    content: Attribute.RichText;
    author: Attribute.Relation<
      'api::element.element',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    relations: Attribute.Relation<
      'api::element.element',
      'oneToMany',
      'api::element.element'
    >;
    relationBy: Attribute.Relation<
      'api::element.element',
      'manyToOne',
      'api::element.element'
    >;
    cover: Attribute.Media<'images'>;
    liked_by: Attribute.Relation<
      'api::element.element',
      'manyToMany',
      'plugin::users-permissions.user'
    >;
    viewed_by: Attribute.Relation<
      'api::element.element',
      'manyToMany',
      'plugin::users-permissions.user'
    >;
    uid: Attribute.UID<'api::element.element', 'title'>;
    media: Attribute.Media<'images' | 'videos' | 'audios'>;
    attachments: Attribute.Media<'files', true>;
    favorite_by: Attribute.Relation<
      'api::element.element',
      'manyToMany',
      'api::favorite.favorite'
    >;
    post: Attribute.Relation<
      'api::element.element',
      'oneToOne',
      'api::post.post'
    >;
    tags: Attribute.Relation<
      'api::element.element',
      'manyToMany',
      'api::tag.tag'
    >;
    category: Attribute.Relation<
      'api::element.element',
      'manyToOne',
      'api::category.category'
    >;
    viewed_count: Attribute.Integer;
    favorite_count: Attribute.Integer;
    liked_count: Attribute.Integer;
    unliked_count: Attribute.Integer;
    unliked_by: Attribute.Relation<
      'api::element.element',
      'manyToMany',
      'plugin::users-permissions.user'
    >;
    creator: Attribute.Relation<
      'api::element.element',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    makers: Attribute.Component<'user.creator', true>;
    is_opus: Attribute.Boolean & Attribute.DefaultTo<false>;
    attachedBy_message: Attribute.Relation<
      'api::element.element',
      'manyToOne',
      'api::message.message'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::element.element',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::element.element',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFavoriteFavorite extends Schema.CollectionType {
  collectionName: 'favorites';
  info: {
    singularName: 'favorite';
    pluralName: 'favorites';
    displayName: 'favorite';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'untitled favorite collection'>;
    elements: Attribute.Relation<
      'api::favorite.favorite',
      'manyToMany',
      'api::element.element'
    >;
    owner: Attribute.Relation<
      'api::favorite.favorite',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::favorite.favorite',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::favorite.favorite',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiGroupGroup extends Schema.CollectionType {
  collectionName: 'groups';
  info: {
    singularName: 'group';
    pluralName: 'groups';
    displayName: 'group';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    kanbans: Attribute.Relation<
      'api::group.group',
      'oneToMany',
      'api::kanban.kanban'
    >;
    name: Attribute.String;
    status: Attribute.String;
    icon: Attribute.Media<'images', true>;
    board: Attribute.Relation<
      'api::group.group',
      'manyToOne',
      'api::board.board'
    >;
    unread_count: Attribute.Integer & Attribute.DefaultTo<0>;
    relate_by_card: Attribute.Relation<
      'api::group.group',
      'oneToOne',
      'api::card.card'
    >;
    creator: Attribute.Relation<
      'api::group.group',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    readonly: Attribute.Boolean & Attribute.DefaultTo<false>;
    protected: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::group.group',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::group.group',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiKanbanKanban extends Schema.CollectionType {
  collectionName: 'kanbans';
  info: {
    singularName: 'kanban';
    pluralName: 'kanbans';
    displayName: 'kanban';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    title: Attribute.String;
    description: Attribute.Text;
    type: Attribute.String & Attribute.DefaultTo<'kanban'>;
    icon: Attribute.Media<'images'>;
    status: Attribute.String;
    unread_count: Attribute.Integer;
    columns: Attribute.Relation<
      'api::kanban.kanban',
      'oneToMany',
      'api::column.column'
    >;
    group: Attribute.Relation<
      'api::kanban.kanban',
      'manyToOne',
      'api::group.group'
    >;
    relate_by_card: Attribute.Relation<
      'api::kanban.kanban',
      'oneToOne',
      'api::card.card'
    >;
    preference: Attribute.JSON;
    creator: Attribute.Relation<
      'api::kanban.kanban',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    private: Attribute.Boolean & Attribute.DefaultTo<false>;
    readonly: Attribute.Boolean & Attribute.DefaultTo<false>;
    protected: Attribute.Boolean & Attribute.DefaultTo<false>;
    share_codes: Attribute.Component<'project.share-code', true>;
    disable_share: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::kanban.kanban',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::kanban.kanban',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiMemberMember extends Schema.CollectionType {
  collectionName: 'members';
  info: {
    singularName: 'member';
    pluralName: 'members';
    displayName: 'member';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    color_marker: Attribute.String;
    title: Attribute.String;
    position: Attribute.String;
    description: Attribute.Text;
    nickname: Attribute.String;
    is_blocked: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<false>;
    private_email: Attribute.Email;
    private_avatar: Attribute.Media<'images'>;
    by_board: Attribute.Relation<
      'api::member.member',
      'manyToOne',
      'api::board.board'
    >;
    by_user: Attribute.Relation<
      'api::member.member',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    schedule_events: Attribute.Relation<
      'api::member.member',
      'oneToMany',
      'api::schedule-event.schedule-event'
    >;
    member_roles: Attribute.Relation<
      'api::member.member',
      'manyToMany',
      'api::member-role.member-role'
    >;
    by_team: Attribute.Relation<
      'api::member.member',
      'manyToOne',
      'api::team.team'
    >;
    is_leaved: Attribute.Boolean;
    by_cards: Attribute.Relation<
      'api::member.member',
      'manyToMany',
      'api::card.card'
    >;
    by_projects: Attribute.Relation<
      'api::member.member',
      'manyToMany',
      'api::project.project'
    >;
    by_team_channels: Attribute.Relation<
      'api::member.member',
      'manyToMany',
      'api::team-channel.team-channel'
    >;
    completed_todos: Attribute.Relation<
      'api::member.member',
      'manyToMany',
      'api::todo.todo'
    >;
    completed_cards: Attribute.Relation<
      'api::member.member',
      'manyToMany',
      'api::card.card'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::member.member',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::member.member',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiMemberRoleMemberRole extends Schema.CollectionType {
  collectionName: 'member_roles';
  info: {
    singularName: 'member-role';
    pluralName: 'member-roles';
    displayName: 'member_role';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    subject: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'default'>;
    ACL: Attribute.Component<'project.collection-permission', true>;
    members: Attribute.Relation<
      'api::member-role.member-role',
      'manyToMany',
      'api::member.member'
    >;
    by_project: Attribute.Relation<
      'api::member-role.member-role',
      'manyToOne',
      'api::project.project'
    >;
    by_card: Attribute.Relation<
      'api::member-role.member-role',
      'manyToOne',
      'api::card.card'
    >;
    by_board: Attribute.Relation<
      'api::member-role.member-role',
      'manyToOne',
      'api::board.board'
    >;
    by_team: Attribute.Relation<
      'api::member-role.member-role',
      'manyToOne',
      'api::team.team'
    >;
    by_team_channel: Attribute.Relation<
      'api::member-role.member-role',
      'manyToOne',
      'api::team-channel.team-channel'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::member-role.member-role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::member-role.member-role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiMessageMessage extends Schema.CollectionType {
  collectionName: 'messages';
  info: {
    singularName: 'message';
    pluralName: 'messages';
    displayName: 'message';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    content: Attribute.Text & Attribute.Required;
    attachments: Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    sender: Attribute.Relation<
      'api::message.message',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    post: Attribute.Relation<
      'api::message.message',
      'manyToOne',
      'api::post.post'
    >;
    replies: Attribute.Relation<
      'api::message.message',
      'oneToMany',
      'api::message.message'
    >;
    reply_target: Attribute.Relation<
      'api::message.message',
      'manyToOne',
      'api::message.message'
    >;
    attached_elements: Attribute.Relation<
      'api::message.message',
      'oneToMany',
      'api::element.element'
    >;
    talker: Attribute.Relation<
      'api::message.message',
      'oneToOne',
      'api::talker.talker'
    >;
    liked_count: Attribute.Integer;
    unliked_count: Attribute.Integer;
    liked_by: Attribute.Relation<
      'api::message.message',
      'manyToMany',
      'plugin::users-permissions.user'
    >;
    unliked_by: Attribute.Relation<
      'api::message.message',
      'manyToMany',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::message.message',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::message.message',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOverviewOverview extends Schema.CollectionType {
  collectionName: 'overviews';
  info: {
    singularName: 'overview';
    pluralName: 'overviews';
    displayName: 'overview';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String;
    description: Attribute.Text;
    media: Attribute.Media<'images' | 'videos'>;
    start: Attribute.Date;
    end: Attribute.Date;
    deadline: Attribute.DateTime;
    jsonContent: Attribute.JSON;
    project: Attribute.Relation<
      'api::overview.overview',
      'manyToOne',
      'api::project.project'
    >;
    card: Attribute.Relation<
      'api::overview.overview',
      'manyToOne',
      'api::card.card'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::overview.overview',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::overview.overview',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPermissionTempletePermissionTemplete
  extends Schema.SingleType {
  collectionName: 'permission_templetes';
  info: {
    singularName: 'permission-templete';
    pluralName: 'permission-templetes';
    displayName: 'permission_templete';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::permission-templete.permission-templete',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::permission-templete.permission-templete',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPopularizePopularize extends Schema.CollectionType {
  collectionName: 'popularizes';
  info: {
    singularName: 'popularize';
    pluralName: 'popularizes';
    displayName: 'popularize';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    title: Attribute.String;
    description: Attribute.Text;
    type: Attribute.String & Attribute.Required & Attribute.DefaultTo<'banner'>;
    medias: Attribute.Media<'images' | 'videos', true>;
    position: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'homepage_right_bottom'>;
    name: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'\u672A\u547D\u540D\u63A8\u5E7F'>;
    uri: Attribute.Text;
    target: Attribute.Enumeration<['_blank', '_self', '_parent', '_top']>;
    content: Attribute.RichText;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::popularize.popularize',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::popularize.popularize',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPostPost extends Schema.CollectionType {
  collectionName: 'posts';
  info: {
    singularName: 'post';
    pluralName: 'posts';
    displayName: 'post';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    title: Attribute.String;
    messages: Attribute.Relation<
      'api::post.post',
      'oneToMany',
      'api::message.message'
    >;
    channel: Attribute.Relation<
      'api::post.post',
      'oneToOne',
      'api::channel.channel'
    >;
    element: Attribute.Relation<
      'api::post.post',
      'oneToOne',
      'api::element.element'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::post.post', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::post.post', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiProjectProject extends Schema.CollectionType {
  collectionName: 'projects';
  info: {
    singularName: 'project';
    pluralName: 'projects';
    displayName: 'project';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String;
    description: Attribute.Text;
    type: Attribute.String;
    cover: Attribute.Media<'images'>;
    boards: Attribute.Relation<
      'api::project.project',
      'oneToMany',
      'api::board.board'
    >;
    overviews: Attribute.Relation<
      'api::project.project',
      'oneToMany',
      'api::overview.overview'
    >;
    default_version: Attribute.Integer;
    todogroups: Attribute.Relation<
      'api::project.project',
      'oneToMany',
      'api::todogroup.todogroup'
    >;
    chat_service: Attribute.JSON;
    invite_uris: Attribute.Component<'project.invite-uri', true>;
    jsonContent: Attribute.JSON;
    private: Attribute.Boolean & Attribute.DefaultTo<true>;
    creator: Attribute.Relation<
      'api::project.project',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    blocked: Attribute.Relation<
      'api::project.project',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    storages: Attribute.Relation<
      'api::project.project',
      'oneToMany',
      'api::storage.storage'
    >;
    members: Attribute.Relation<
      'api::project.project',
      'manyToMany',
      'plugin::users-permissions.user'
    >;
    mm_channel_id: Attribute.UID;
    preferences: Attribute.JSON;
    schedules: Attribute.Relation<
      'api::project.project',
      'oneToMany',
      'api::schedule.schedule'
    >;
    project_members: Attribute.Relation<
      'api::project.project',
      'manyToMany',
      'api::member.member'
    >;
    member_roles: Attribute.Relation<
      'api::project.project',
      'oneToMany',
      'api::member-role.member-role'
    >;
    readonly: Attribute.Boolean & Attribute.DefaultTo<false>;
    protected: Attribute.Boolean & Attribute.DefaultTo<false>;
    project_documents: Attribute.Relation<
      'api::project.project',
      'oneToMany',
      'api::document.document'
    >;
    by_team: Attribute.Relation<
      'api::project.project',
      'manyToOne',
      'api::team.team'
    >;
    sub_projects: Attribute.Relation<
      'api::project.project',
      'oneToMany',
      'api::project.project'
    >;
    parent_project: Attribute.Relation<
      'api::project.project',
      'manyToOne',
      'api::project.project'
    >;
    mm_channel: Attribute.JSON;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::project.project',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::project.project',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiScheduleSchedule extends Schema.CollectionType {
  collectionName: 'schedules';
  info: {
    singularName: 'schedule';
    pluralName: 'schedules';
    displayName: 'schedule';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    by_user: Attribute.Relation<
      'api::schedule.schedule',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    by_card: Attribute.Relation<
      'api::schedule.schedule',
      'oneToOne',
      'api::card.card'
    >;
    by_project: Attribute.Relation<
      'api::schedule.schedule',
      'manyToOne',
      'api::project.project'
    >;
    schedule_events: Attribute.Relation<
      'api::schedule.schedule',
      'oneToMany',
      'api::schedule-event.schedule-event'
    >;
    type: Attribute.Enumeration<['O', 'P']>;
    can_read_user: Attribute.Relation<
      'api::schedule.schedule',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    can_write_user: Attribute.Relation<
      'api::schedule.schedule',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    name: Attribute.String &
      Attribute.DefaultTo<'\u672A\u547D\u540D\u89C4\u5212'>;
    icon: Attribute.String & Attribute.DefaultTo<'event'>;
    creator: Attribute.Relation<
      'api::schedule.schedule',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    private: Attribute.Boolean & Attribute.DefaultTo<false>;
    mm_thread: Attribute.JSON;
    share_codes: Attribute.Component<'project.share-code', true>;
    description: Attribute.Text;
    disable_share: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::schedule.schedule',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::schedule.schedule',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiScheduleEventScheduleEvent extends Schema.CollectionType {
  collectionName: 'schedule_events';
  info: {
    singularName: 'schedule-event';
    pluralName: 'schedule-events';
    displayName: 'schedule_event';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Subject: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'\u672A\u547D\u540D\u4E8B\u4EF6'>;
    StartTime: Attribute.DateTime;
    EndTime: Attribute.DateTime;
    location: Attribute.String;
    description: Attribute.Text;
    IsAllDay: Attribute.Boolean & Attribute.DefaultTo<false>;
    recurrenceRule: Attribute.String;
    recurrenceException: Attribute.String;
    recurrenceID: Attribute.BigInteger;
    schedule: Attribute.Relation<
      'api::schedule-event.schedule-event',
      'manyToOne',
      'api::schedule.schedule'
    >;
    creator: Attribute.Relation<
      'api::schedule-event.schedule-event',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    executor: Attribute.Relation<
      'api::schedule-event.schedule-event',
      'manyToOne',
      'api::member.member'
    >;
    EventType: Attribute.String & Attribute.DefaultTo<'Requested'>;
    Guid: Attribute.UID;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::schedule-event.schedule-event',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::schedule-event.schedule-event',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiServerServer extends Schema.SingleType {
  collectionName: 'servers';
  info: {
    singularName: 'server';
    pluralName: 'servers';
    displayName: 'server';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    http_api_endpoint: Attribute.Text;
    ws_api_endpoint: Attribute.String;
    graphql_endpoint: Attribute.Text;
    ws_endpoint: Attribute.String;
    version: Attribute.JSON;
    feature: Attribute.JSON;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::server.server',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::server.server',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStorageStorage extends Schema.CollectionType {
  collectionName: 'storages';
  info: {
    singularName: 'storage';
    pluralName: 'storages';
    displayName: 'storage';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String;
    files: Attribute.Media<'images' | 'files' | 'videos' | 'audios', true>;
    storage: Attribute.Relation<
      'api::storage.storage',
      'manyToOne',
      'api::storage.storage'
    >;
    sub_folders: Attribute.Relation<
      'api::storage.storage',
      'oneToMany',
      'api::storage.storage'
    >;
    belonged_project: Attribute.Relation<
      'api::storage.storage',
      'manyToOne',
      'api::project.project'
    >;
    storage_files: Attribute.Relation<
      'api::storage.storage',
      'oneToMany',
      'api::storage-file.storage-file'
    >;
    belonged_user: Attribute.Relation<
      'api::storage.storage',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    private: Attribute.Boolean & Attribute.DefaultTo<false>;
    creator: Attribute.Relation<
      'api::storage.storage',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    can_read_user: Attribute.Relation<
      'api::storage.storage',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    can_write_user: Attribute.Relation<
      'api::storage.storage',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    belonged_card: Attribute.Relation<
      'api::storage.storage',
      'oneToOne',
      'api::card.card'
    >;
    color_marker: Attribute.JSON;
    type: Attribute.Enumeration<['local', 'azure_blob']> &
      Attribute.DefaultTo<'local'>;
    azureInfo: Attribute.JSON;
    passcode: Attribute.Password;
    share_codes: Attribute.Component<'project.share-code', true>;
    disable_share: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::storage.storage',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::storage.storage',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStorageFileStorageFile extends Schema.CollectionType {
  collectionName: 'storage_files';
  info: {
    singularName: 'storage-file';
    pluralName: 'storage-files';
    displayName: 'storage_file';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String;
    file: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    color_marker: Attribute.String;
    storage: Attribute.Relation<
      'api::storage-file.storage-file',
      'manyToOne',
      'api::storage.storage'
    >;
    owner: Attribute.Relation<
      'api::storage-file.storage-file',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    share_codes: Attribute.Component<'project.share-code', true>;
    disable_share: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::storage-file.storage-file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::storage-file.storage-file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTagTag extends Schema.CollectionType {
  collectionName: 'tags';
  info: {
    singularName: 'tag';
    pluralName: 'tags';
    displayName: 'tag';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'untitled'>;
    elements: Attribute.Relation<
      'api::tag.tag',
      'manyToMany',
      'api::element.element'
    >;
    taged_count: Attribute.Integer;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::tag.tag', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::tag.tag', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiTalkerTalker extends Schema.CollectionType {
  collectionName: 'talkers';
  info: {
    singularName: 'talker';
    pluralName: 'talkers';
    displayName: 'talker';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    nickname: Attribute.String;
    status: Attribute.String;
    isMuted: Attribute.Boolean & Attribute.DefaultTo<false>;
    user: Attribute.Relation<
      'api::talker.talker',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    message: Attribute.Relation<
      'api::talker.talker',
      'oneToOne',
      'api::message.message'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::talker.talker',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::talker.talker',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTeamTeam extends Schema.CollectionType {
  collectionName: 'teams';
  info: {
    singularName: 'team';
    pluralName: 'teams';
    displayName: 'team';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    mm_team: Attribute.JSON;
    team_channels: Attribute.Relation<
      'api::team.team',
      'oneToMany',
      'api::team-channel.team-channel'
    >;
    members: Attribute.Relation<
      'api::team.team',
      'oneToMany',
      'api::member.member'
    >;
    member_roles: Attribute.Relation<
      'api::team.team',
      'oneToMany',
      'api::member-role.member-role'
    >;
    team_logo: Attribute.Media<'images'>;
    projects: Attribute.Relation<
      'api::team.team',
      'oneToMany',
      'api::project.project'
    >;
    invite_uris: Attribute.Component<'project.invite-uri', true>;
    default_by: Attribute.Relation<
      'api::team.team',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    display_name: Attribute.String;
    notification: Attribute.Text;
    introduce: Attribute.JSON;
    config: Attribute.JSON;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::team.team', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::team.team', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiTeamChannelTeamChannel extends Schema.CollectionType {
  collectionName: 'team_channels';
  info: {
    singularName: 'team-channel';
    pluralName: 'team-channels';
    displayName: 'team_channel';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String;
    mm_channel: Attribute.JSON;
    team: Attribute.Relation<
      'api::team-channel.team-channel',
      'manyToOne',
      'api::team.team'
    >;
    members: Attribute.Relation<
      'api::team-channel.team-channel',
      'manyToMany',
      'api::member.member'
    >;
    member_roles: Attribute.Relation<
      'api::team-channel.team-channel',
      'oneToMany',
      'api::member-role.member-role'
    >;
    invite_uris: Attribute.Component<'project.invite-uri', true>;
    type: Attribute.String;
    purpose: Attribute.Text;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::team-channel.team-channel',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::team-channel.team-channel',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTodoTodo extends Schema.CollectionType {
  collectionName: 'todos';
  info: {
    singularName: 'todo';
    pluralName: 'todos';
    displayName: 'todo';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    todogroup: Attribute.Relation<
      'api::todo.todo',
      'manyToOne',
      'api::todogroup.todogroup'
    >;
    content: Attribute.Text;
    status: Attribute.Boolean & Attribute.DefaultTo<false>;
    importance: Attribute.Decimal;
    urgency: Attribute.Decimal;
    color_marker: Attribute.String;
    creator: Attribute.Relation<
      'api::todo.todo',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    attachment: Attribute.Media<'images' | 'files' | 'videos' | 'audios', true>;
    executor: Attribute.Relation<
      'api::todo.todo',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    mm_thread: Attribute.JSON;
    type: Attribute.Enumeration<['todo', 'node']>;
    completed_by: Attribute.Relation<
      'api::todo.todo',
      'manyToMany',
      'api::member.member'
    >;
    props: Attribute.JSON;
    fingerprint: Attribute.Text;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::todo.todo', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::todo.todo', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiTodogroupTodogroup extends Schema.CollectionType {
  collectionName: 'todogroups';
  info: {
    singularName: 'todogroup';
    pluralName: 'todogroups';
    displayName: 'todogroup';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'\u672A\u547D\u540D\u5F85\u529E\u5206\u7EC4'>;
    todos: Attribute.Relation<
      'api::todogroup.todogroup',
      'oneToMany',
      'api::todo.todo'
    >;
    user: Attribute.Relation<
      'api::todogroup.todogroup',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    card: Attribute.Relation<
      'api::todogroup.todogroup',
      'manyToOne',
      'api::card.card'
    >;
    project: Attribute.Relation<
      'api::todogroup.todogroup',
      'manyToOne',
      'api::project.project'
    >;
    kanban: Attribute.Relation<
      'api::todogroup.todogroup',
      'oneToOne',
      'api::kanban.kanban'
    >;
    color_marker: Attribute.String;
    creator: Attribute.Relation<
      'api::todogroup.todogroup',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::todogroup.todogroup',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::todogroup.todogroup',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::permission': AdminPermission;
      'admin::user': AdminUser;
      'admin::role': AdminRole;
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
      'plugin::i18n.locale': PluginI18NLocale;
      'api::bizcard.bizcard': ApiBizcardBizcard;
      'api::bizcard-collection.bizcard-collection': ApiBizcardCollectionBizcardCollection;
      'api::board.board': ApiBoardBoard;
      'api::card.card': ApiCardCard;
      'api::category.category': ApiCategoryCategory;
      'api::channel.channel': ApiChannelChannel;
      'api::column.column': ApiColumnColumn;
      'api::document.document': ApiDocumentDocument;
      'api::element.element': ApiElementElement;
      'api::favorite.favorite': ApiFavoriteFavorite;
      'api::group.group': ApiGroupGroup;
      'api::kanban.kanban': ApiKanbanKanban;
      'api::member.member': ApiMemberMember;
      'api::member-role.member-role': ApiMemberRoleMemberRole;
      'api::message.message': ApiMessageMessage;
      'api::overview.overview': ApiOverviewOverview;
      'api::permission-templete.permission-templete': ApiPermissionTempletePermissionTemplete;
      'api::popularize.popularize': ApiPopularizePopularize;
      'api::post.post': ApiPostPost;
      'api::project.project': ApiProjectProject;
      'api::schedule.schedule': ApiScheduleSchedule;
      'api::schedule-event.schedule-event': ApiScheduleEventScheduleEvent;
      'api::server.server': ApiServerServer;
      'api::storage.storage': ApiStorageStorage;
      'api::storage-file.storage-file': ApiStorageFileStorageFile;
      'api::tag.tag': ApiTagTag;
      'api::talker.talker': ApiTalkerTalker;
      'api::team.team': ApiTeamTeam;
      'api::team-channel.team-channel': ApiTeamChannelTeamChannel;
      'api::todo.todo': ApiTodoTodo;
      'api::todogroup.todogroup': ApiTodogroupTodogroup;
    }
  }
}
