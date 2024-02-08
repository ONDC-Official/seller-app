import OrderService from '../v1/services/order.service';
const orderService = new OrderService();

class OrderController {

    async create(req, res, next) {
        try {
            const data = req.body;
            //data.organization = req.user.organization
            const product = await orderService.create(data);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [create] Error -', error);
            next(error);
        }     
    }


    async list(req, res, next) {
        try {
            const query = req.query;
            query.offset = parseInt(query.offset??0);
            query.limit = parseInt(query.limit??100);
            query.organization = req.user.organization;
            const products = await orderService.list(query);
            return res.send(products);

        } catch (error) {
            console.log('[OrderController] [list] Error -', error);
            next(error);
        }
    }

    async listReturnRequests(req, res, next) {
        try {
            const query = req.query;
            query.offset = parseInt(query.offset??0);
            query.limit = parseInt(query.limit??100);
            query.organization = req.user.organization;
            const products = await orderService.listReturnRequests(query);
            return res.send(products);

        } catch (error) {
            console.log('[OrderController] [list] Error -', error);
            next(error);
        }
    }


    async get(req, res, next) {
        try {
            const params = req.params;
            const product = await orderService.get(params.orderId);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

    async updateOrderStatus(req, res, next) {
        try {
            const params = req.params;
            const product = await orderService.updateOrderStatus(params.orderId,req.body);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }
    async getONDC(req, res, next) {
        try {
            const params = req.params;
            const product = await orderService.getONDC(params.orderId);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const params = req.params;
            const product = await orderService.update(params.orderId,req.body);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

    async ondcUpdate(req, res, next) {
        try {
            const params = req.params;
            const product = await orderService.OndcUpdate(params.orderId,req.body);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }
    async cancel(req, res, next) {
        try {
            const params = req.params;
            const product = await orderService.cancel(params.orderId,req.body);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }
    async cancelOrder(req, res, next) {
        try {
            const params = req.params;
            const product = await orderService.cancelOrder(params.orderId,req.body);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }
    async cancelItems(req, res, next) {
        try {
            try {
                const params = req.params;
                const product = await orderService.cancelItems(params.orderId,req.body);
                return res.send(product);

            } catch (error) {
                console.log('[OrderController] [get] Error -', error);
                next(error);
            }

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }
    async updateReturnItem(req, res, next) {
        try {
            try {
                const params = req.params;
                const product = await orderService.updateReturnItem(params.orderId,req.body);
                return res.send(product);

            } catch (error) {
                console.log('[OrderController] [get] Error -', error);
                next(error);
            }

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

}

export default OrderController;
