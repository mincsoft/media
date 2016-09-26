package com.crm.bs;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.crm.api.BaseAPI;
import com.crm.api.BaseResponse;

/**
 * Created by yujinliang on 16/9/22.
 */
public class CustEntityService extends BaseAPI {


    public JSONObject getEnityList(String access_token) {
        String url = "https://api.xiaoshouyi.com/data/v1/picks/dimension/belongs?access_token=Bearer%20" + access_token;
        JSONObject response = executeGet(url);
        if (response != null) {
            return response;
        }
        return null;
    }

    public JSONObject getEnityDetail(String access_token,String belongId) {
        String url = "https://api.xiaoshouyi.com/data/v1/objects/customize/describe?belongId="+belongId+"&access_token=Bearer%20" + access_token;
        JSONObject response = executeGet(url);
        if (response != null) {
            return response;
        }
        return null;
    }


    public JSONObject createEnity(String access_token,String belongId,JSONObject entityInfo) {
        String url = "https://api.xiaoshouyi.com/data/v1/objects/customize/create";
        JSONObject params = new JSONObject();
        params.put("access_token", "Bearer%20"+access_token);
        params.put("belongId", belongId);
        params.put("record", entityInfo);

        BaseResponse res = executePost(url, params.toString());
        return res!=null? JSON.parseObject(res.getErrmsg()):null;
    }
}
