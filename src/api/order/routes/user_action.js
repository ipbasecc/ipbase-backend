module.exports = {
    routes: [
        {
            "method": "POST",
            "path": "/order/create_order",
            "handler": "order.createOrder",
            // "config": {
            //     "auth": false,
            // }
        },
        {
            "method": "POST",
            "path": "/order/order_notify",
            "handler": "order.orderNotify",
            // "config": {
            //     "auth": false,
            // }
        },
        {
            "method": "POST",
            "path": "/order/transfer_notify",
            "handler": "order.transferNotify",
            // "config": {
            //     "auth": false,
            // }
        },
        {
            "method": "GET",
            "path": "/order/payment_redirect",
            "handler": "order.paymentRedirect",
            // "config": {
            //     "auth": false,
            // }
        },
        {
            "method": "GET",
            "path": "/sales",
            "handler": "order.sales",
            // "config": {
            //     "auth": false,
            // }
        },
        {
            "method": "POST",
            "path": "/order/withdraw",
            "handler": "order.withdraw",
            // "config": {
            //     "auth": false,
            // }
        },
    ]
}