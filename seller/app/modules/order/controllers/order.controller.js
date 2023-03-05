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
            query.offset = parseInt(query.offset);
            query.limit = parseInt(query.limit);
            query.organization = req.user.organization;
            const products = await orderService.list(query);
            return res.send(products);

        } catch (error) {
            console.log('[OrderController] [list] Error -', error);
            next(error);
        }
    }


    async get(req, res, next) {
        try {
            const params = req.params;
            const product = await orderService.get(params.productId);
            return res.send(product);

        } catch (error) {
            console.log('[OrderController] [get] Error -', error);
            next(error);
        }
    }

}

export default OrderController;
