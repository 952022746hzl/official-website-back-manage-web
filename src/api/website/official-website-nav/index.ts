import request from "@/utils/request";
import { OfficialWebsiteNavForm, OfficialWebsiteNavPageQuery, OfficialWebsiteNavVO } from "./type";

const OFFICIALWEBSITENAV_BASE_URL = "/api/v1/official-website-nav";

const OfficialWebsiteNavAPI = {
    /** 获取官网导航列表 */
    getAllNavs(queryParams?: OfficialWebsiteNavPageQuery) {
        return request<any, OfficialWebsiteNavVO[]>({
            url: `${OFFICIALWEBSITENAV_BASE_URL}/getAllNavs`,
            method: "get",
            params: queryParams,
        });
    },


    /** 获取官网导航下拉选项 */
    getNavOptions(onlyTop?: boolean) {
        return request<any, OptionType[]>({
            url: `${OFFICIALWEBSITENAV_BASE_URL}/getNavOptions`,
            method: "get",
            params: { onlyTop },
        });
    },

    /**
     * 获取官网动态导航表单数据
     *
     * @param id 官网动态导航ID
     * @returns 官网动态导航表单数据
     */
    getFormData(id: number) {
        return request<any, OfficialWebsiteNavForm>({
            url: `${OFFICIALWEBSITENAV_BASE_URL}/${id}/form`,
            method: "get",
        });
    },
    

    /**
     *  添加官网动态导航
     *
     *  @param data 官网动态导航表单数据
     */
    create(data: OfficialWebsiteNavForm) {
        return request({
            url: `${OFFICIALWEBSITENAV_BASE_URL}`,
            method: "post",
            data,
        });
    },

    /**
     * 更新官网动态导航
     *
     * @param id 官网动态导航ID
     * @param data 官网动态导航表单数据
     */
     update(id: string| number, data: OfficialWebsiteNavForm) {
        return request({
            url: `${OFFICIALWEBSITENAV_BASE_URL}/${id}`,
            method: "put",
            data,
        });
    },

    /**
     * 批量删除官网动态导航，多个以英文逗号(,)分割
     *
     * @param ids 官网动态导航ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${OFFICIALWEBSITENAV_BASE_URL}/${ids}`,
            method: "delete",
        });
    }
}

export default OfficialWebsiteNavAPI;