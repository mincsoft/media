package other.aakepi.bdfjfaackcpic.api;

import com.rkhd.platform.sdk.http.RkhdHttpClient;
import com.rkhd.platform.sdk.http.RkhdHttpData;
import com.rkhd.platform.sdk.log.Logger;
import com.rkhd.platform.sdk.log.LoggerFactory;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * API基础对象
 * Created by yangyixin on 16/10/4.
 */
public abstract class BaseApiSupport {

    protected Logger logger = LoggerFactory.getLogger();


    /**
     * 获得请求对象
     *
     * @param callString
     * @param call_type  POST,GET
     * @return
     */
    private RkhdHttpData getRkhdHttpData(String callString, String call_type) {
        RkhdHttpData rkhdHttpData = new RkhdHttpData();
        rkhdHttpData.setCallString(callString);
        rkhdHttpData.setCall_type(call_type);
        return rkhdHttpData;
    }

    /**
     * 获得请求对象,GET
     *
     * @param callString
     * @return
     */
    protected RkhdHttpData getRkhdHttpData(String callString) {
        return getRkhdHttpData(callString, "GET");
    }

    /**
     * 获得请求对象 POST
     *
     * @param callString
     * @return
     */
    protected RkhdHttpData postRkhdHttpData(String callString) {
        return getRkhdHttpData(callString, "POST");
    }

    /**
     * API请求
     *
     * @param rkhdHttpData
     * @return
     */
    protected String apiRequest(RkhdHttpData rkhdHttpData) {
        String result = "";
        try {
            ScriptTriggerParam scriptTriggerParam = new ScriptTriggerParam();

            RkhdHttpClient rkhdHttpClient = new RkhdHttpClient();
            result = rkhdHttpClient.performRequest(rkhdHttpData);
            JSONObject resultObj = JSONObject.fromObject(result);
            if (resultObj.containsKey("error_code")) {
                logger.error("Mincsoft Error Tips=====code:"+resultObj.getString("error_code") +" message:"+ resultObj.getString("message"));
            }
        } catch (IOException e) {
            logger.error(e.getMessage());
        }
        return result;
    }

    /**
     * 查询语句，返回json结果
     *
     * @param sql
     * @return
     * @throws IOException
     */
    protected String query(String sql) {
        RkhdHttpData rkhdHttpData = postRkhdHttpData("/data/v1/query");
        rkhdHttpData.putFormData("q", sql);
        return apiRequest(rkhdHttpData);
    }

    /**
     * 查询所有结果 ，弥补
     * 1.没有加分页标示,是否也控制了最多输出30个对象的限制？
     是，没有加分页标识时，系统默认为从第一条开始取三十条数据，即(limit 0,30)
     2.如果超过30条，有什么方法可以查询得到全部结果？
     建议操作步骤如下：
     a.查询 limit 0,30
     b.根据返回值中的totalSize判断分页数量(当然要注意除去第一页)
     c.for(int i = 30;i<totalSize;i+30){
     limit i,30
     }

     * @param sql
     * @return
     */
    protected JSONArray queryAllResult(String sql){
        //判断是否已经存在limit ,如果不存在 ，增加0,到30  起始 0 页数30
        JSONArray  resultAll=null;
        StringBuffer sb=new StringBuffer(sql);
        int start=0;
        int defaultSize=30;
        if(sql.indexOf("limit")<0){
            sb.append(" limit ").append(start).append(",").append(defaultSize);
        }
        QueryResult queryResult=queryResult(sb.toString());
        if(queryResult==null)
           return  resultAll;
        resultAll=queryResult.getRecords();
        int totalSize=queryResult.getTotalSize();
        int count=queryResult.getCount();
        for(int i=defaultSize;i<totalSize;i+=defaultSize){
            sb=new StringBuffer(sql);
            start=i;
            if(sql.indexOf("limit")<0){
                sb.append(" limit ").append(start).append(",").append(defaultSize);
            }
            logger.info("拼装的查询所有的结果集的数据sql：=="+sb.toString());
            queryResult=queryResult(sb.toString());
            resultAll.addAll(queryResult.getRecords());
        }
        return  resultAll;
    }

    /**
     * 查询语句，返回json结果
     *
     * @param sql
     * @return
     * @throws IOException
     */
    protected QueryResult queryResult(String sql) {
        String result = query(sql);
        return getQueryResult(result);
    }

    /**
     * 查询语句，返回json结果
     *
     * @param sql
     * @return
     * @throws IOException
     */
    protected JSONArray queryResultArray(String sql) {
        String result = query(sql);
        QueryResult queryResult = getQueryResult(result);
        if (queryResult == null) return new JSONArray();
        if (queryResult.getCount() == 0) return new JSONArray();
        return queryResult.getRecords();
    }

    /**
     * 查询语句，返回json结果
     *
     * @param result,查询结果
     * @return
     * @throws IOException
     */
    private QueryResult getQueryResult(String result) {
        if (StringUtils.isBlank(result)) {
            return null;
        }
        JSONObject jsonObject = JSONObject.fromObject(result);
        if (jsonObject == null || jsonObject.isNullObject())
            return null;
        if (jsonObject.containsKey("error_code")) {
            return null;
        }
        logger.info("getQueryResult:" + result);
        QueryResult queryResult = new QueryResult();
        queryResult.setStatus(jsonObject.containsKey("status")?jsonObject.getString("status"):"1");
        queryResult.setTotalSize(jsonObject.containsKey("totalSize")?jsonObject.getInt("totalSize"):0);
        queryResult.setCount(jsonObject.containsKey("count")?jsonObject.getInt("count"):0);
        queryResult.setRecords(jsonObject.containsKey("records")?jsonObject.getJSONArray("records"):new JSONArray());
        return queryResult;
    }

    /**
     * 获得全部业务对象
     *
     * @return
     */
    protected QueryResult getAllBelongs() {
        RkhdHttpData rkhdHttpData = getRkhdHttpData("/data/v1/picks/dimension/belongs");
        String result = apiRequest(rkhdHttpData);
        return getQueryResult(result);
    }

    /**
     * 从全部结果集合查询实体ID
     *
     * @param result
     * @param belongName，实体名称
     * @return
     */
    protected long getBelongId(QueryResult result, String belongName) {
        long belongId = -1;
        if (StringUtils.isBlank(belongName)) return belongId;
        if (result == null) return belongId;
        if (result.getTotalSize() == null) return belongId;
        //全部的媒体记录
        JSONArray records = result.getRecords();
        for (int i = 0; i < records.size(); i++) {
            JSONObject record = records.getJSONObject(i);
            if (belongName.equalsIgnoreCase(record.getString("name")) ||
                    belongName.equalsIgnoreCase(record.getString("belongName"))) {
                belongId = record.getLong("belongId");
                break;
            }
        }
        return belongId;
    }

    protected long getBelongId(String belongName) {
        QueryResult queryResult = getAllBelongs();

        return getBelongId(queryResult,belongName);
    }

    /**
     * 获得实体配置的全部select参数（含entityType）
     *
     * @param mediaBelongsDes key:字段名，value：名值对Map
     * @return
     */
    protected Map<String, Map<Object, String>> getBelongSelectItem(JSONObject mediaBelongsDes) {
        Map<String, Map<Object, String>> selectMap = new HashMap<String, Map<Object, String>>();
        if (mediaBelongsDes == null) return selectMap;
        if (mediaBelongsDes.containsKey("entityTypes")) {
            JSONArray entityTypesArray = mediaBelongsDes.getJSONArray("entityTypes");
            Map<Object, String> entityTypesMap = new HashMap<Object, String>();
            for (int i = 0; i < entityTypesArray.size(); i++) {
                JSONObject entityTypesObj = entityTypesArray.getJSONObject(i);
                Object key = entityTypesObj.get("id");
                String value = entityTypesObj.getString("name");
                entityTypesMap.put(key, value);
            }
            //entityType
            selectMap.put("entityType", entityTypesMap);
        }
        if (mediaBelongsDes.containsKey("fields")) {
            JSONArray fieldsArray = mediaBelongsDes.getJSONArray("fields");
            for (int i = 0; i < fieldsArray.size(); i++) {
                JSONObject fieldObj = fieldsArray.getJSONObject(i);
                //下拉选项
                if (fieldObj.containsKey("selectitem")) {
                    JSONArray selectitemArray = fieldObj.getJSONArray("selectitem");
                    Map<Object, String> map = new HashMap<Object, String>();
                    for (int j = 0; j < selectitemArray.size(); j++) {
                        JSONObject selectitemObj = selectitemArray.getJSONObject(j);
                        Object key = selectitemObj.get("value");
                        String value = selectitemObj.getString("label");
                        map.put(key, value);
                    }
                    //字段名称
                    String filedName = fieldObj.getString("propertyname");
                    selectMap.put(filedName, map);
                }
            }
        }
        logger.info("getBelongSelectItem：:" + selectMap);
        return selectMap;
    }

    /**
     * 获得自定义业务实体描述接口
     *
     * @param belongId 自定义ID
     * @return
     */
    protected JSONObject getBelongsDesc(long belongId) {
        RkhdHttpData rkhdHttpData = postRkhdHttpData("/data/v1/objects/customize/describe");
        rkhdHttpData.putFormData("belongId", belongId);
        String result = apiRequest(rkhdHttpData);
        logger.info("getBelongsDesc("+belongId+")：:" + result);
        return JSONObject.fromObject(result);
    }

    /**
     * 创建自定义实体
     *
     * @param belongId 自定义ID
     * @param record   记录信息
     * @return
     */
    protected JSONObject createBelongs(long belongId, JSONObject record) {
        RkhdHttpData rkhdHttpData = postRkhdHttpData("/data/v1/objects/customize/create");
        JSONObject body = new JSONObject();
        body.accumulate("belongId", belongId);
        body.accumulate("record", record);
        rkhdHttpData.setBody(body.toString());

        String result = apiRequest(rkhdHttpData);
        logger.info("createBelongs:" + result);
        return JSONObject.fromObject(result);
    }

    /**
     * 更新自定义实体
     *
     * @param record 记录信息
     * @return
     */
    protected JSONObject updateBelongs(JSONObject record) {
        RkhdHttpData rkhdHttpData = postRkhdHttpData("/data/v1/objects/customize/update");
        rkhdHttpData.setBody(record.toString());
        logger.info("===========updateBelongs(record)============:" + record);
        String result = apiRequest(rkhdHttpData);
        logger.info("updateBelongs:" + result);
        return JSONObject.fromObject(result);
    }

    /**
     * 删除自定义实体
     *
     * @param id 记录
     * @return
     */
    protected JSONObject deleteBelongs(long id) {
        RkhdHttpData rkhdHttpData = postRkhdHttpData("/data/v1/objects/customize/delete");
        rkhdHttpData.putFormData("id", id);
        String result = apiRequest(rkhdHttpData);
        logger.info("deleteBelongs:" + result);
        return JSONObject.fromObject(result);
    }

    /**
     * 查询自定义实体
     *
     * @param id 对象主键
     * @return
     */
    protected JSONObject getBelongs(long id) {
        RkhdHttpData rkhdHttpData = postRkhdHttpData("/data/v1/objects/customize/info");
        rkhdHttpData.putFormData("id", id);
        String result = apiRequest(rkhdHttpData);
        return JSONObject.fromObject(result);
    }

    /**
     * 获得用户信息
     *
     * @param id 对象主键
     * @return
     */
    protected JSONObject getUserInfo(long id) {
        RkhdHttpData rkhdHttpData = postRkhdHttpData("/data/v1/objects/user/info");
        rkhdHttpData.putFormData("id", id);
        String result = apiRequest(rkhdHttpData);
        return JSONObject.fromObject(result);
    }


    //转换对象，避免null对象转json时出错
    protected Object convertObject(Object value) {
        if (value == null)
            return "";
        if (value instanceof String) {
            return (String) value;
        } else if (value instanceof Integer) {
            return (Integer) value;
        } else if (value instanceof Date)
            return ((Date) value).getTime();
        else if (value instanceof Number)
            return ((Number) value);

        return value.toString();
    }


}
