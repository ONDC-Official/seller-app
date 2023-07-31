import {CategoryService} from '../../services/v1';

const categoryService = new CategoryService();

class CategoryController {

    list(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        categoryService.list().then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    get(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        let {id} = req.params
        categoryService.get(id).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    update(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        let data = req.body
        let {id} = req.params
        categoryService.update(data,id).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    create(req, res, next) {
        let data =req.body
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        categoryService.create(data).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }

}

module.exports = CategoryController;
