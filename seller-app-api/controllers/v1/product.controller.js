import {ProductService} from '../../services/v1';

const productService = new ProductService();

class ProductController {


    list(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        productService.list().then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    get(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        let {id} = req.params
        productService.get(id).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    search(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        //  req.params
        productService.search( req.body).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    select(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        //  req.params
        productService.select( req.body).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }

    init(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        //  req.params
        productService.init( req.body).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }

    confirm(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        //  req.params
        productService.confirm( req.body).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }

    orderList(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        //  req.params
        productService.orderList( req.body).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    getOrderById(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        //  req.params
        let {id} = req.params
        productService.getOrderById( id).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }

    update(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        let data = req.body
        let {id} = req.params
        productService.update(data,id).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    create(req, res, next) {
        let data =req.body
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        productService.create(data).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }

}

module.exports = ProductController;
