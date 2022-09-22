import HttpRequest from '../utils/HttpRequest';
import {getProducts} from "../utils/schemaMapping";

var config = require('../lib/config');
// const strapiAccessToken = '1465d1ca50726c39d0a764ba345121bc594f4923367de7d8ce57c779c0b3a3fd64eecbd4268e5e8818a57068f0f48b1b7d3a4ec20cfeb55e48bf902283c318b8b9fbe7f6fd9e86e813eab18acbd38075a2389bd5e5eb73fe1ba9607d3f9e7b00a5cc46c8dcf617734f52ec0e91b90d167a180bba4ed1f0a7d7ad026f28c5aad2'
const strapiAccessToken = config.get("strapi").apiToken
const strapiURI = config.get("strapi").serverUrl
class CategoryService {

    async list(){

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;

        let httpRequest = new HttpRequest(
            strapiURI,
            '/api/products',
            'get',
            {},
            headers
        );

        let result = await httpRequest.send();

        return result.data
    }

    async search(requestQuery){

        //get search criteria
        const searchProduct = requestQuery.message.intent.item.descriptor.name
        //const searchCategory = requestQuery.message.intent.category.descriptor?.name??""

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;


        let httpRequest = new HttpRequest(
            strapiURI,
            `/api/products?filters[name][$eq]=${searchProduct}`,
            'get',
            {},
            headers
        );

        let result = await httpRequest.send();

        console.log("search result================>",result)

        const productData =await getProducts({data:result.data,context:requestQuery.context});

        console.log("search result=======productData=========>",productData);

        return productData
    }

    async get(id){

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;

        let httpRequest = new HttpRequest(
            strapiURI,
            `/api/products/${id}`,
            'get',
            {},
            headers
        );

        let result = await httpRequest.send();

        return result.data
    }

    async update(data,id){

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;

        console.log(data)
        let httpRequest = new HttpRequest(
            strapiURI,
            `/api/products/${id}`,
            'put',
            {data:data},
            headers
        );

        let result = await httpRequest.send();

        return result.data
    }

    async create(data){

        let headers = {};
        // headers['Authorization'] = `Bearer ${strapiAccessToken}`;

        console.log(data);

        let httpRequest = new HttpRequest(
            strapiURI,
            '/api/products',
            'post',
            {data},
            headers
        );

        let result = await httpRequest.send();

        return result.data
    }
}

module.exports = CategoryService;
