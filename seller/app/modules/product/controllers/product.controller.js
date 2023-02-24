import ProductService from '../v1/services/product.service';

const productService = new ProductService();

class ProductController {

    async create(req, res, next) {
        try {
            const data = req.body;
            data.organization = req.user.organization
            const product = await productService.create(data);
            return res.send(product);

        } catch (error) {
            console.log('[ProductController] [create] Error -', error);
            next(error);
        }     
    }


    async list(req, res, next) {
        try {
            const query = req.query;
            query.offset = parseInt(query.offset);
            query.limit = parseInt(query.limit);
            const products = await productService.list(query);
            return res.send(products);

        } catch (error) {
            console.log('[ProductController] [list] Error -', error);
            next(error);
        }
    }

    async search(req, res, next) {
        try {
            const query = req.query;
            query.offset = 0;
            query.limit = 50;//default only 50 products will be sent
            const products = await productService.search(query);
            return res.send(products);

        } catch (error) {
            console.log('[ProductController] [list] Error -', error);
            next(error);
        }
    }

    async get(req, res, next) {
        try {
            const params = req.params;
            const product = await productService.get(params.organizationId);
            return res.send(product);

        } catch (error) {
            console.log('[ProductController] [get] Error -', error);
            next(error);
        }
    }

}

export default ProductController;
