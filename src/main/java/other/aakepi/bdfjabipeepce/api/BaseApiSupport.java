package other.aakepi.bdfjabipeepce.api;

import com.rkhd.platform.sdk.http.Request;
import com.rkhd.platform.sdk.http.RkhdHttpClient;
import com.rkhd.platform.sdk.http.RkhdHttpData;
import com.rkhd.platform.sdk.log.Logger;
import com.rkhd.platform.sdk.log.LoggerFactory;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import other.aakepi.bdfjabipeepce.http.MincsoftHttpClient;

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
     * @param callString
     * @param call_type POST,GET
     * @return
     */
    private RkhdHttpData getRkhdHttpData(String callString,String call_type)  {
        RkhdHttpData rkhdHttpData = new RkhdHttpData();
        rkhdHttpData.setCallString(callString);
        rkhdHttpData.setCall_type(call_type);
        return rkhdHttpData;
    }

    /**
     * 获得请求对象,GET
     * @param callString
     * @return
     */
    protected RkhdHttpData getRkhdHttpData(String callString)  {
        return getRkhdHttpData(callString,"GET");
    }
    /**
     * 获得请求对象 POST
     * @param callString
     * @return
     */
    protected RkhdHttpData postRkhdHttpData(String callString)  {
        return getRkhdHttpData(callString,"POST");
    }

    /**
     * API请求
     * @param request
     * @param rkhdHttpData
     * @return
     */
    protected String apiRequest(Request request,RkhdHttpData rkhdHttpData){
        String result="";
        try{
            ScriptTriggerParam scriptTriggerParam = new ScriptTriggerParam();
            MincsoftHttpClient rkhdHttpClient = new MincsoftHttpClient(request);
            result = rkhdHttpClient.performRequest(rkhdHttpData);
        } catch (IOException e){
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
    protected String query(Request request,String sql)  {
        RkhdHttpData rkhdHttpData = postRkhdHttpData("/data/v1/query");
        rkhdHttpData.putFormData("q", sql);
        return apiRequest(request, rkhdHttpData);
    }

    /**
     * 查询语句，返回json结果
     *
     * @param sql
     * @return
     * @throws IOException
     */
    protected QueryResult queryResult(Request request,String sql)  {
        String result=query(request, sql);
        return queryResult(result);
    }

    /**
     * 查询语句，返回json结果
     *
     * @param result,查询结果
     * @return
     * @throws IOException
     */
    protected QueryResult queryResult(String result)  {
        if (StringUtils.isBlank(result)){
            return null;
        }
        JSONObject jsonObject = JSONObject.fromObject(result);
        if (jsonObject ==null || jsonObject.isNullObject())
            return null;
        if (jsonObject.containsKey("error_code")){
            return null;
        }
        return (QueryResult)JSONObject.toBean(jsonObject,QueryResult.class);
    }

    /**
     * 获得全部业务对象
     * @param request
     * @return
     */
    protected QueryResult getAllBelongs(Request request){
        RkhdHttpData rkhdHttpData = getRkhdHttpData("/data/v1/picks/dimension/belongs");
        String result = apiRequest(request, rkhdHttpData);
        return queryResult(result);
    }

    /**
     * 从全部结果集合查询实体ID
     * @param result
     * @param belongName，实体名称
     * @return
     */
    protected long getBelongId(QueryResult result,String belongName){
        long belongId = -1;
        if (StringUtils.isBlank(belongName)) return belongId;
        if (result == null) return belongId;
        if (result.getTotalSize() == null ) return belongId;
        //全部的媒体记录
        JSONArray records = result.getRecords();
        for (int i = 0; i < records.size(); i++) {
            JSONObject record = records.getJSONObject(i);
            if (belongName.equalsIgnoreCase(record.getString("name")) ||
                    belongName.equalsIgnoreCase(record.getString("belongName")) ){
                belongId = record.getLong("belongId");
                break;
            }
        }
        return belongId;
    }

    /**
     * 获得实体配置的全部select参数（含entityType）
     * @param mediaBelongsDes key:字段名，value：名值对Map
     * @return
     */
    protected Map<String,Map<Object,String>> getBelongSelectItem(JSONObject mediaBelongsDes){
        Map<String,Map<Object,String>> selectMap = new HashMap<String, Map<Object, String>>();
        if (mediaBelongsDes==null) return selectMap;
        if (mediaBelongsDes.containsKey("entityTypes")){
            JSONArray entityTypesArray = mediaBelongsDes.getJSONArray("entityTypes");
            Map<Object,String> entityTypesMap = new HashMap<Object,String>();
            for (int i = 0; i < entityTypesArray.size(); i++) {
                JSONObject entityTypesObj = entityTypesArray.getJSONObject(i);
                Object key = entityTypesObj.get("id");
                String value = entityTypesObj.getString("name");
                entityTypesMap.put(key,value);
            }
            //entityType
            selectMap.put("entityType",entityTypesMap);
        }
        if (mediaBelongsDes.containsKey("fields")){
            JSONArray fieldsArray = mediaBelongsDes.getJSONArray("fields");
            for (int i = 0; i < fieldsArray.size() ; i++) {
                JSONObject fieldObj = fieldsArray.getJSONObject(i);
                //下拉选项
                if (fieldObj.containsKey("selectitem")){
                    JSONArray selectitemArray = fieldObj.getJSONArray("selectitem");
                    Map<Object,String> map = new HashMap<Object,String>();
                    for (int j = 0; j < selectitemArray.size(); j++) {
                        JSONObject selectitemObj = selectitemArray.getJSONObject(j);
                        Object key = selectitemObj.get("value");
                        String value = selectitemObj.getString("label");
                        map.put(key,value);
                    }
                    //字段名称
                    String filedName = fieldObj.getString("propertyname");
                    selectMap.put(filedName,map);
                }
            }
        }

        return selectMap;
    }

    /**
     * 获得自定义业务实体描述接口
     * @param request
     * @param belongId 自定义ID
     * @return
     */
    protected JSONObject getBelongsDesc(Request request,long belongId){
        RkhdHttpData rkhdHttpData = postRkhdHttpData("/data/v1/objects/customize/describe");
        rkhdHttpData.putFormData("belongId", belongId);
        String result = apiRequest(request, rkhdHttpData);
        return JSONObject.fromObject(result);
    }

    /**
     * 创建自定义实体
     * @param request
     * @param belongId 自定义ID
     * @param record 记录信息
     * @return
     */
    protected JSONObject createBelongs(Request request,long belongId,JSONObject record){
        RkhdHttpData rkhdHttpData = postRkhdHttpData("/data/v1/objects/customize/create");
        rkhdHttpData.putFormData("belongId", belongId);
        rkhdHttpData.putFormData("record", record);
        String result = apiRequest(request, rkhdHttpData);
        return JSONObject.fromObject(result);
    }

    /**
     * 更新自定义实体
     * @param request
     * @param belongId 自定义ID
     * @param record 记录信息
     * @return
     */
    protected JSONObject updateBelongs(Request request,long belongId,JSONObject record){
        RkhdHttpData rkhdHttpData = postRkhdHttpData("/data/v1/objects/customize/update");
        rkhdHttpData.putFormData("belongId", belongId);
        rkhdHttpData.putFormData("record", record);
        String result = apiRequest(request, rkhdHttpData);
        return JSONObject.fromObject(result);
    }
    /**
     * 删除自定义实体
     * @param request
     * @param id 记录
     * @return
     */
    protected JSONObject deleteBelongs(Request request,long id){
        RkhdHttpData rkhdHttpData = postRkhdHttpData("/data/v1/objects/customize/delete");
        rkhdHttpData.putFormData("id", id);
        String result = apiRequest(request, rkhdHttpData);
        return JSONObject.fromObject(result);
    }

    /**
     * 查询自定义实体
     * @param request
     * @param id 对象主键
     * @return
     */
    protected JSONObject getBelongs(Request request,long id){
        RkhdHttpData rkhdHttpData = postRkhdHttpData("/data/v1/objects/customize/create");
        rkhdHttpData.putFormData("id", id);
        String result = apiRequest(request, rkhdHttpData);
        return JSONObject.fromObject(result);
    }

    //转换对象，避免null对象转json时出错
    protected Object convertObject(Object value){
        if(value == null)
            return "";
        if(value instanceof String){
            return (String)value;
        }else if(value instanceof Integer){
            return (Integer) value;
        }else if(value instanceof Date)
            return ((Date) value).getTime();
        else if(value instanceof Number)
            return ((Number) value);

        return value.toString();
    }


}
