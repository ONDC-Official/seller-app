import ProductService from '../v1/services/product.service';
var XLSX = require('xlsx')
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

    async uploadTemplate(req, res, next) {
        try {

            const file = `app/modules/product/template/template.xlsx`;
            return res.download(file);

        } catch (error) {
            console.log('[ProductController] [get] Error -', error);
            next(error);
        }
    }

    async uploadCatalog(req, res, next) {
        try {

            let path = req.file.path;
            var workbook = XLSX.readFile(path);
            var sheet_name_list = workbook.SheetNames;
            let jsonData = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheet_name_list[0]]
            );
            if (jsonData.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "xml sheet has no data",
                });
            }else{
                for(const row of jsonData){
                    await productService.create(row);
                }
            }

            // const params = req.params;
            // const product = await productService.get(params.organizationId);
           return res.send({});

        } catch (error) {
            console.log('[ProductController] [get] Error -', error);
            next(error);
        }
    }

}

export default ProductController;
