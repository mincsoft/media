package other.aakepi.bdfjfaackcpic.api;

import com.alibaba.fastjson.JSON;
import com.rkhd.platform.sdk.http.Request;
import com.rkhd.platform.sdk.http.RkhdHttpData;
import com.rkhd.platform.sdk.log.Logger;
import com.rkhd.platform.sdk.log.LoggerFactory;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import other.aakepi.bdfjfaackcpic.enums.ResultType;
import other.aakepi.bdfjfaackcpic.http.MincsoftHttpClient;
import other.aakepi.bdfjfaackcpic.util.Configuration;

import java.io.File;
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

    protected static final String BASE_API_URL = "";
    protected static String _CURR_AUTHTOKEN = "";
    protected static String SECURCODE = Configuration.getInstance().getValue("securcode");//"cyKgOghI";//租户安全令牌
    private static final String _CODE_TOKEN_URL = Configuration.getInstance().getValue("_code_token_url");//交互认证方式
    private static final String _PWD_TOKEN_URL = Configuration.getInstance().getValue("_pwd_token_url");//静默方式
    private static final String CLIENT_ID = Configuration.getInstance().getValue("client_id");//静默方式
    private static final String CLIENT_SECRET = Configuration.getInstance().getValue("client_secret");//静默方式
    private static final String REDIRECT_URI = Configuration.getInstance().getValue("redirect_uri");//静默方式
    private static final String USERNAME = Configuration.getInstance().getValue("username");//静默方式
    private static final String PASSWORD = Configuration.getInstance().getValue("password");//静默方式




    public String getAuthToken(){
        if (StringUtils.isEmpty(_CURR_AUTHTOKEN)){
//      String codeParam="grant_type=authorization_code&client_id=e3829850419b7ec442b0314c3cf2ff58&client_secret=562e34991cd545d5f499a3331b5cb592&redirect_uri=http://localhost&code=5385578c7137a40a75206c543605d3957a3355d78d3e2de0279cc6cb0f3a7e07";
            String pwdParam="grant_type=password&client_id="+CLIENT_ID+"&client_secret="+CLIENT_SECRET+"&redirect_uri="+REDIRECT_URI+"&username="+USERNAME+"&password="+PASSWORD+SECURCODE;
            String response = MincsoftHttpClient.sendSimplePost(_PWD_TOKEN_URL, pwdParam);

            if (StringUtils.isNotEmpty(response)){
                com.alibaba.fastjson.JSONObject result= JSON.parseObject(response);
                _CURR_AUTHTOKEN = result.getString("access_token");
            }
        }

        return _CURR_AUTHTOKEN;
    }

    /**
     * 通用post请求
     *
     * @param url  地址，其中token用#代替
     * @param json 参数，json格式
     * @return 请求结果
     */
    protected BaseResponse executePost(String url, String json) {
        return executePost(url, json, null);
    }

    /**
     * 通用post请求
     *
     * @param postUrl  地址，其中token用#代替
     * @param json 参数，json格式
     * @param file 上传的文件
     * @return 请求结果
     */
    protected BaseResponse executePost(String postUrl, String json, File file) {
        BaseResponse response;
        if (StringUtils.isEmpty(postUrl)){
            logger.error("url is null");
            return null;
        }
        response = MincsoftHttpClient.post(postUrl, json);
        return response;
    }


    /**
     * 通用get请求
     *
     * @param getUrl 地址，其中token用#代替
     * @return 请求结果
     */
    protected com.alibaba.fastjson.JSONObject executeGet(String getUrl) {
        com.alibaba.fastjson.JSONObject response;
        if (StringUtils.isEmpty(getUrl)){
            logger.error("url is null");
            return null;
        }
        //需要传token
//    String getUrl = url.replace("#", componentConfig.getAppAccessToken(getTenantAppid()));
        response = MincsoftHttpClient.get(getUrl);
//    if("40001".equalsIgnoreCase(response.getErrcode())){
//      //重新刷新token
//      componentConfig.refreshAppAccessToken(getTenantAppid());
//      return executeGet(url);
//    }
        return response;
    }

    /**
     * 判断本次请求是否成功
     *
     * @param errCode 错误码
     * @return 是否成功
     */
    protected boolean isSuccess(String errCode) {
        return ResultType.SUCCESS.getCode().toString().equals(errCode);
    }


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
