import { DuplicateRecordFoundError, NoRecordFoundError } from '../../../../lib/errors';
import MESSAGES from '../../../../lib/utils/messages';
import CustomMenu from '../../models/customMenu.model';
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

    async getMenu(menuId,params,currentUser){
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
                if(params.menuProducts){
                    let menuQuery = {
                        organization:currentUser.organization,
                        customMenu : menuId
                    };
                    let menuProducts = await CustomMenuProduct.find(menuQuery).sort({seq:'ASC'}).populate([{path:'product',select:['_id','productName']}]);
                    menu.products = menuProducts;
                }
                return menu;
            }else
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
    async menuProductOrdering(menuId,data,currentUser){
        try {
            if(data && data.length >0){
                for(const menuProduct of data){
                    await CustomMenuProduct.updateOne({_id:menuProduct._id,customMenu:menuId,organization:currentUser.organization},{seq:menuProduct.seq});
                }
            }
            return {success :true};
        } catch (err) {
            console.log(`[CustomMenuService] [menuOrdering] Error - ${currentUser.organization}`,err);
            throw err;
        }
    }
    async addMenuProduct(menuId,data,currentUser){
        try {
            let query = {
                organization:currentUser.organization,
                _id : menuId
            };
            const menu = await CustomMenu.findOne(query);
            if(menu){
                const products = data.products;
                for(const product of products){
                    let productExist = await CustomMenuProduct.findOne({organization:currentUser.organization,customMenu:menuId,product : product});
                    if(!productExist){
                        const menuProduct = new CustomMenuProduct();
                        menuProduct.organization = currentUser.organization;
                        menuProduct.customMenu = menuId;
                        menuProduct.product = product;
                        await menuProduct.save();
                    } 
                } 
                return {success :true};
            }else{
                throw new NoRecordFoundError(MESSAGES.MENU_NOT_EXISTS);
            }
        } catch (err) {
            console.log(`[CustomMenuService] [addMenuProduct] Error - ${currentUser.organization}`,err);
            throw err;
        }
    }

    async deleteMenuProduct(menuId,data,currentUser){
        try {
            let query = {
                organization:currentUser.organization,
                _id : menuId
            };
            const menu = await CustomMenu.findOne(query);
            if(menu){
                const products = data.products;
                await CustomMenuProduct.deleteMany({organization:currentUser.organization,customMenu:menuId,product:{$in:products}});
                return {suceess : true};
            }else{
                throw new NoRecordFoundError(MESSAGES.MENU_NOT_EXISTS);
            }
        } catch (err) {
            console.log(`[CustomMenuService] [deleteMenuProduct] Error - ${currentUser.organization}`,err);
            throw err;
        }
    }

}
export default CustomMenuService;
