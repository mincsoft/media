import com.rkhd.platform.sdk.http.RkhdHttpClient;
import com.rkhd.platform.sdk.http.RkhdHttpData;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import other.aakepi.bdfjfaackcpic.api.BaseApiSupport;
import other.aakepi.bdfjfaackcpic.api.QueryResult;
import other.aakepi.bdfjfaackcpic.http.MincsoftHttpClient;

import java.io.IOException;

/**
 * Created by yujinliang on 16/9/22.
 */
public class CustEntityService extends BaseApiSupport {
    protected static String _CURR_AUTHTOKEN = "";
    protected static String SECURCODE = "cyKgOghI";//"cyKgOghI";//租户安全令牌
    private static final String _PWD_TOKEN_URL = "https://api.xiaoshouyi.com/oauth2/token";//静默方式
    private static final String CLIENT_ID = "e3829850419b7ec442b0314c3cf2ff58";//静默方式
    private static final String CLIENT_SECRET = "562e34991cd545d5f499a3331b5cb592";//静默方式
    private static final String REDIRECT_URI = "https://lapp.ingageapp.com/d3e6/f901/meeting/meetingroom.html";//静默方式
    private static final String USERNAME = "18800004505";//静默方式
    private static final String PASSWORD = "1qaz2wsx";//静默方式


    public String getAuthToken(){
        if (StringUtils.isEmpty(_CURR_AUTHTOKEN)){
//      String codeParam="grant_type=authorization_code&client_id=e3829850419b7ec442b0314c3cf2ff58&client_secret=562e34991cd545d5f499a3331b5cb592&redirect_uri=http://localhost&code=5385578c7137a40a75206c543605d3957a3355d78d3e2de0279cc6cb0f3a7e07";
            String pwdParam="grant_type=password&client_id="+CLIENT_ID+"&client_secret="+CLIENT_SECRET+"&redirect_uri="+REDIRECT_URI+"&username="+USERNAME+"&password="+PASSWORD+SECURCODE;
            String response = MincsoftHttpClient.sendSimplePost(_PWD_TOKEN_URL, pwdParam);

            if (StringUtils.isNotEmpty(response)){
                JSONObject result= JSONObject.fromObject(response);
                _CURR_AUTHTOKEN = result.getString("access_token");
            }
        }

        return _CURR_AUTHTOKEN;
    }



    public QueryResult getEnityList(String access_token) {
        RkhdHttpClient rkhdHttpClient = null;
        try {
            rkhdHttpClient = new RkhdHttpClient();
            RkhdHttpData rkhdHttpData = new RkhdHttpData();
            rkhdHttpData.setCallString("/data/v1/picks/dimension/belongs");
            rkhdHttpData.setCall_type("GET");
            String resultJson = rkhdHttpClient.performRequest(rkhdHttpData);
            return (QueryResult) JSONObject.toBean(JSONObject.fromObject(resultJson),QueryResult.class);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
//
//    public JSONObject getEnityDetail(String access_token,String belongId) {
//        String url = "https://api.xiaoshouyi.com/data/v1/objects/customize/describe?belongId="+belongId+"&access_token=Bearer%20" + access_token;
//        JSONObject response = executeGet(url);
//        if (response != null) {
//            return response;
//        }
//        return null;
//    }
//
//
//
//    public JSONObject getPayRecordEntity(String access_token) {
//        String url = "https://api.xiaoshouyi.com/data/v1/objects/contract/payment/describe?access_token=Bearer%20" + access_token;
//        JSONObject response = executeGet(url);
//        if (response != null) {
//            return response;
//        }
//        return null;
//    }
//
//
//
//    public JSONObject getPayPlanEntity(String access_token) {
//        String url = "https://api.xiaoshouyi.com/data/v1/objects/contract/payment/plan-describe?access_token=Bearer%20" + access_token;
//        JSONObject response = executeGet(url);
//        if (response != null) {
//            return response;
//        }
//        return null;
//    }
//
//
//    public JSONObject createEntityData(String access_token,String belongId,JSONObject jsonObject) {
//        String url = "https://api.xiaoshouyi.com/data/v1/objects/customize/create";
//        JSONObject params = new JSONObject();
//        params.put("access_token", "Bearer%20"+access_token);
//        params.put("belongId", belongId);
//        params.put("record", jsonObject);
//
//        BaseResponse res = executePost(url, params.toString());
//        return res!=null? JSON.parseObject(res.getErrmsg()):null;
//    }
//
//    public JSONObject updateEntityData(String access_token,String belongId,JSONObject jsonObject){
//        String url = "https://api.xiaoshouyi.com/data/v1/objects/customize/update";
//        JSONObject params = new JSONObject();
//        params.put("access_token", "Bearer%20"+access_token);
//        params.put("record", jsonObject);
//
//        BaseResponse res = executePost(url, params.toString());
//        return res!=null? JSON.parseObject(res.getErrmsg()):null;
//    }

    public JSONArray queryData(){
        String sql = "select id,invoiceFlg,status from paymentRecord where stage = 1 ";
        RkhdHttpClient rkhdHttpClient = null;
        try {
            rkhdHttpClient = new RkhdHttpClient();
        } catch (IOException e) {
            e.printStackTrace();
        }
        RkhdHttpData rkhdHttpData = new RkhdHttpData();
        rkhdHttpData.setCallString("/data/v1/query");
        rkhdHttpData.setCall_type("POST");

        rkhdHttpData.putFormData("q", sql);
        System.out.println("sql---------" + sql);

        String recordResultJson = null;
        try {
            recordResultJson = rkhdHttpClient.performRequest(rkhdHttpData);
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.out.println("recordResultJson---------" + recordResultJson);
        JSONObject planResult = JSONObject.fromObject(recordResultJson);
        QueryResult queryResult = (QueryResult)JSONObject.toBean(planResult,QueryResult.class);

        return queryResult.getRecords();

    }
}
