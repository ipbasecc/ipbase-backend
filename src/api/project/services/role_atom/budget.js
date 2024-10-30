module.exports = {
    budget: () => {
        const { ledger } = require('./ledger');
        const role_ledger = ledger();
        let _ACL = {
            "creator": {
                "collection": "budget",
                "create": true,
                "delete": true,
                "read": true,
                "modify": true,
                "fields_permission": role_ledger.creator
            },
            "owner": {
                "collection": "budget",
                "create": true,
                "delete": true,
                "read": true,
                "modify": true,
                "fields_permission": role_ledger.owner
            },
            "executor": {
                "collection": "budget",
                "create": true,
                "delete": false,
                "read": true,
                "modify": true,
                "fields_permission": role_ledger.executor
            },
            "reviewer": {
                "collection": "budget",
                "create": false,
                "delete": false,
                "read": false,
                "modify": false,
                "fields_permission": role_ledger.reviewer
            },
            "member": {
                "collection": "budget",
                "create": false,
                "delete": false,
                "read": false,
                "modify": false,
                "fields_permission": role_ledger.member
            },
            "master": {
                "collection": "budget",
                "create": false,
                "delete": false,
                "read": false,
                "modify": false,
                "fields_permission": role_ledger.master
            },
            "external": {
                "collection": "budget",
                "create": false,
                "delete": false,
                "read": false,
                "modify": false,
                "fields_permission": role_ledger.external
            },
            "unconfirmed": {
                "collection": "budget",
                "create": false,
                "delete": false,
                "read": false,
                "modify": false,
                "fields_permission": role_ledger.unconfirmed
            },
            "blocked": {
                "collection": "budget",
                "create": false,
                "delete": false,
                "read": false,
                "modify": false,
                "fields_permission": role_ledger.blocked
            },
        }
        return _ACL
    }
}