import CustomMenuService from '../v1/services/customMenu.service';
const customMenuService = new CustomMenuService();

class CustomMenuController {

    async createMenu(req, res, next) {
        try {
            const data = req.body;
            const product = await customMenuService.createMenu(req.params.category,data,req.user);
            return res.send(product);

        } catch (error) {
            console.log('[CustomMenuController] [createMenu] Error -', error);
            next(error);
        }
    }
    async updateMenu(req, res, next) {
        try {
            const data = req.body;
            const product = await customMenuService.updateMenu(req.params.menuId,data,req.user);
            return res.send(product);

        } catch (error) {
            console.log('[CustomMenuController] [updateMenu] Error -', error);
            next(error);
        }
    }

    async deleteMenu(req, res, next) {
        try {
            const product = await customMenuService.deleteMenu(req.params.menuId,req.user);
            return res.send(product);

        } catch (error) {
            console.log('[CustomMenuController] [deleteMenu] Error -', error);
            next(error);
        }
    }

    async listMenu(req, res, next) {
        try {
            const query = req.query;
            query.offset = parseInt(query.offset ?? 0);
            query.limit = parseInt(query.limit ?? 100);
            const products = await customMenuService.listMenu(query,req.user);
            return res.send(products);

        } catch (error) {
            console.log('[CustomMenuController] [listMenu] Error -', error);
            next(error);
        }
    }

    async getMenu(req, res, next) {
        try {
            const product = await customMenuService.getMenu(req.params.menuId,req.user);
            return res.send(product);

        } catch (error) {
            console.log('[CustomMenuController] [getMenu] Error -', error);
            next(error);
        }
    }

    async getMenuProducts(req, res, next) {
        try {
            const query = req.query;
            query.offset = parseInt(query.offset ?? 0);
            query.limit = parseInt(query.limit ?? 100);
            const product = await customMenuService.getMenuProducts(req.params.menuId,query,req.user);
            return res.send(product);

        } catch (error) {
            console.log('[CustomMenuController] [getMenu] Error -', error);
            next(error);
        }
    }

    async menuOrdering(req, res, next) {
        try {
            const data = req.body;
            const product = await customMenuService.menuOrdering(data,req.user);
            return res.send(product);

        } catch (error) {
            console.log('[CustomMenuController] [menuOrdering] Error -', error);
            next(error);
        }
    }

}

export default CustomMenuController;

