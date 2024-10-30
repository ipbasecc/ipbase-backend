module.exports = {
    ledger: () => {
        let _ACL = {
            "creator": [
                {
                    "field": "create_ledger",
                    "modify": true
                },
                {
                    "field": "delete_ledger",
                    "modify": true
                },
                {
                    "field": "read_ledger",
                    "modify": true
                },
                {
                    "field": "modify_ledger",
                    "modify": true
                },
                {
                    "field": "approve_ledger",
                    "modify": true
                },
            ],
            "owner": [
                {
                    "field": "create_ledger",
                    "modify": true
                },
                {
                    "field": "delete_ledger",
                    "modify": true
                },
                {
                    "field": "read_ledger",
                    "modify": true
                },
                {
                    "field": "modify_ledger",
                    "modify": true
                },
                {
                    "field": "approve_ledger",
                    "modify": true
                },
            ],
            "executor": [
                {
                    "field": "create_ledger",
                    "modify": true
                },
                {
                    "field": "delete_ledger",
                    "modify": true
                },
                {
                    "field": "read_ledger",
                    "modify": true
                },
                {
                    "field": "modify_ledger",
                    "modify": true
                },
                {
                    "field": "approve_ledger",
                    "modify": true
                },
            ],
            "reviewer": [
                {
                    "field": "create_ledger",
                    "modify": false
                },
                {
                    "field": "delete_ledger",
                    "modify": false
                },
                {
                    "field": "read_ledger",
                    "modify": false
                },
                {
                    "field": "modify_ledger",
                    "modify": false
                },
                {
                    "field": "approve_ledger",
                    "modify": false
                },
            ],
            "member": [
                {
                    "field": "create_ledger",
                    "modify": false
                },
                {
                    "field": "delete_ledger",
                    "modify": false
                },
                {
                    "field": "read_ledger",
                    "modify": false
                },
                {
                    "field": "modify_ledger",
                    "modify": false
                },
                {
                    "field": "approve_ledger",
                    "modify": false
                },
            ],
            "master": [
                {
                    "field": "create_ledger",
                    "modify": false
                },
                {
                    "field": "delete_ledger",
                    "modify": false
                },
                {
                    "field": "read_ledger",
                    "modify": false
                },
                {
                    "field": "modify_ledger",
                    "modify": false
                },
                {
                    "field": "approve_ledger",
                    "modify": false
                },
            ],
            "external": [
                {
                    "field": "create_ledger",
                    "modify": false
                },
                {
                    "field": "delete_ledger",
                    "modify": false
                },
                {
                    "field": "read_ledger",
                    "modify": false
                },
                {
                    "field": "modify_ledger",
                    "modify": false
                },
                {
                    "field": "approve_ledger",
                    "modify": false
                },
            ],
            "unconfirmed": [
                {
                    "field": "create_ledger",
                    "modify": false
                },
                {
                    "field": "delete_ledger",
                    "modify": false
                },
                {
                    "field": "read_ledger",
                    "modify": false
                },
                {
                    "field": "modify_ledger",
                    "modify": false
                },
                {
                    "field": "approve_ledger",
                    "modify": false
                },
            ],
            "blocked": [
                {
                    "field": "create_ledger",
                    "modify": false
                },
                {
                    "field": "delete_ledger",
                    "modify": false
                },
                {
                    "field": "read_ledger",
                    "modify": false
                },
                {
                    "field": "modify_ledger",
                    "modify": false
                },
                {
                    "field": "approve_ledger",
                    "modify": false
                },
            ]
        }
        return _ACL
    }
}