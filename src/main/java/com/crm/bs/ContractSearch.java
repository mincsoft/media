package com.crm.bs;

import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import other.aakepi.bdfjfaackcpic.api.BaseApiSupport;
import other.aakepi.bdfjfaackcpic.api.QueryResult;
import other.aakepi.bdfjfaackcpic.api.media.SpotConfig;
import other.aakepi.bdfjfaackcpic.api.media.SpotField;
import other.aakepi.bdfjfaackcpic.util.DateUtil;

import java.text.SimpleDateFormat;
import java.util.*;

/**
 * 媒体管理查询
 * Created by yangyixin on 16/10/4.
 */
public class ContractSearch extends BaseApiSupport implements ApiSupport {

    QueryResult allBelongs;
    //媒体对象的ID
    long mediaBelongId;
    //媒体：字段描述
    JSONObject mediaBelongsDes;
    //媒体：下拉选项
    Map<String, Map<Object, String>> mediaSelectMap;
    //排期显示配置对象
    SpotConfig spotConfig;

    @Override
    public String execute(Request request, Long userId, Long tenantId) {

        Map<String, Object> returnMap = new HashMap<String, Object>();

        String startAt = request.getParameter("begin");
        String endAt = request.getParameter("end");
        QueryResult result = getAllContract(request, 0, 20);
        JSONArray records=new JSONArray();
        if (result != null){
            records= result.getRecords();
        }
        return records.toString();
    }

    /**
     * 查询全部的媒体记录
     *
     * @param request
     * @return
     */
    private QueryResult getAllContract(Request request, int first, int size) {

        StringBuffer sql = new StringBuffer();
        sql.append("select id,title from contract ");
        sql.append(" limit ").append(first).append(",").append(size);

        return queryResult(request, sql.toString());
    }


}
