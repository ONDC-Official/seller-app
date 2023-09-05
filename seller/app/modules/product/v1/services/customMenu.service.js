import { DuplicateRecordFoundError, NoRecordFoundError } from '../../../../lib/errors';
import MESSAGES from '../../../../lib/utils/messages';
import CustomMenu from '../../models/customMenu.model';
import CustomMenuTiming from '../../models/customMenuTiming.model';
import Product from '../../models/product.model';
import CustomMenuProduct from '../../models/customMenuProduct.model';
import s3 from '../../../../lib/utils/s3Utils';


class CustomMenuService {
    async createMenu(category,data,currentUser) {
        try {
            let menuExist = await CustomMenu.findOne({organization:currentUser.organization,name:data.name});
            if(!menuExist){
                let menu = new CustomMenu();
                menu.name = data.name;
                menu.seq = data.seq;
                menu.longDescription = data.longDescription;
                menu.shortDescription = data.shortDescription;
                menu.images = data.images;
                menu.category = category;
                menu.organization = currentUser.organization;
                await menu.save();
                return menu;
            }else{
                throw new DuplicateRecordFoundError(MESSAGES.MENU_EXISTS);
            }
        } catch (err) {
            console.log(`[CustomMenuService] [create] Error - ${currentUser.organization}`,err);
            throw err;
        }
    }

    async updateMenu(menuId,data,currentUser) {
        try {
            let menu = await CustomMenu.findOne({organization:currentUser.organization,_id:menuId});
            if(menu){
                let menuExist = await CustomMenu.findOne({_id:{$ne:menuId},organization:currentUser.organization,name:data.name});
                if(!menuExist){
                    menu.name = data.name;
                    menu.seq = data.seq;
                    menu.longDescription = data.longDescription;
                    menu.shortDescription = data.shortDescription;
                    menu.images = data.images;
                    await menu.save();
                    const products = data.products;
                    await CustomMenuProduct.deleteMany({organization:currentUser.organization,customMenu:menuId});
                    for(const product of products){
                        let menuProduct = new CustomMenuProduct();
                        menuProduct.organization = currentUser.organization;
                        menuProduct.customMenu = menuId;
                        menuProduct.product = product.id;
                        menuProduct.seq = product.seq;
                        await menuProduct.save();
                    }
                    let customMenuTiming = await CustomMenuTiming.findOne({customMenu:menuId,organization:currentUser.organization});
                    if(customMenuTiming){
                        customMenuTiming.timings = data.timings;
                        await customMenuTiming.save();
                    }else{
                        customMenuTiming = new CustomMenuTiming();
                        customMenuTiming.customMenu = menuId;
                        customMenuTiming.organization = currentUser.organization;
                        customMenuTiming.timings = data.timings;
                        await customMenuTiming.save();
                    }
                    return menu;
                }else{
                    throw new DuplicateRecordFoundError(MESSAGES.MENU_EXISTS);
                }
            }else{
                throw new NoRecordFoundError(MESSAGES.MENU_NOT_EXISTS);
            }
        } catch (err) {
            console.log(`[CustomMenuService] [create] Error - ${currentUser.organization}`,err);
            throw err;
        }
    }

    async deleteMenu(menuId,currentUser) {
        try {
            let menu = await CustomMenu.findOne({organization:currentUser.organization,_id:menuId});
            if(menu){
                await CustomMenu.deleteOne({organization:currentUser.organization,_id:menuId});
                await CustomMenuProduct.deleteMany({organization:currentUser.organization,customMenu:menuId });
                await CustomMenuTiming.deleteMany({organization:currentUser.organization,customMenu:menuId });
                return {success :true};

            }else{
                throw new NoRecordFoundError(MESSAGES.MENU_NOT_EXISTS);
            }
        } catch (err) {
            console.log(`[CustomMenuService] [create] Error - ${currentUser.organization}`,err);
            throw err;
        }
    }

    async listMenu(params,currentUser){
        try {
            let query = {
                organization:currentUser.organization
            };
            if(params.name){
                query.name = { $regex: params.name, $options: 'i' };
            }
            if(params.category){
                query.category = params.category;
            }
            const menuData = await CustomMenu.find(query).sort({seq:'ASC'}).skip(params.offset*params.limit).limit(params.limit);
            const count = await CustomMenu.count(query);
            return{
                count,data:menuData
            };

        } catch (err) {
            console.log(`[CustomMenuService] [list] Error - ${currentUser.organization}`,err);
            throw err;
        }
    }

    async getMenu(menuId,currentUser){
        try {
            let query = {
                organization:currentUser.organization,
                _id : menuId
            };
            let menu = await CustomMenu.findOne(query).lean();
            let images = [];
            if(menu){
                if(menu.images && menu.images.length > 0){
                    for(const image of menu.images){
                        let data = await s3.getSignedUrlForRead({path:image});
                        images.push(data);
                    }
                    menu.images = images;
                }
                
                let menuQuery = {
                    organization:currentUser.organization,
                    customMenu : menuId
                };
                let menuProducts = await CustomMenuProduct.find(menuQuery).sort({seq:'ASC'}).populate([{path:'product',select:['_id','productName']}]);
                let productData = [];
                for(const menuProduct of menuProducts){
                    let productObj = {
                        id:menuProduct.product._id,
                        name:menuProduct.product.productName,
                        seq:menuProduct.seq,

                    };
                    productData.push(productObj);
                }
                menu.products = productData;
                let customMenuTiming = await CustomMenuTiming.findOne(menuQuery);
                menu.timings = customMenuTiming?.timings ?? [];
                return menu;
            }else
                throw new NoRecordFoundError(MESSAGES.MENU_NOT_EXISTS);
        } catch (err) {
            console.log(`[CustomMenuService] [get] Error - ${currentUser.organization}`,err);
            throw err;
        }
    }

    async getMenuProducts(menuId,params,currentUser){
        try {
            let query = {
                organization:currentUser.organization,
                _id : menuId
            };
            let menu = await CustomMenu.findOne(query);
            if(menu){
                let menuQuery = {
                    organization:currentUser.organization,
                    customMenu : menuId
                };
                const menuProducts = await CustomMenuProduct.find(menuQuery,{product:1,_id:0});
                const productList = await Product.find({organization:currentUser.organization,productCategory:menu.category,_id:{$nin : menuProducts}},{productName:1});
                return productList;
            }
            throw new NoRecordFoundError(MESSAGES.MENU_NOT_EXISTS);
        } catch (err) {
            console.log(`[CustomMenuService] [get] Error - ${currentUser.organization}`,err);
            throw err;
        }
    }

    async menuOrdering(data,currentUser){
        try {
            if(data && data.length >0){
                for(const menu of data){
                    await CustomMenu.updateOne({_id:menu._id,organization:currentUser.organization},{seq:menu.seq});
                }
            }
            return {success :true};
        } catch (err) {
            console.log(`[CustomMenuService] [menuOrdering] Error - ${currentUser.organization}`,err);
            throw err;
        }
    }

}
export default CustomMenuService;
