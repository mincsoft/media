package other.aakepi.bdfjfaackcpic.api.media;

import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import com.rkhd.platform.sdk.http.RkhdHttpClient;
import com.rkhd.platform.sdk.http.RkhdHttpData;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import other.aakepi.bdfjfaackcpic.api.BaseApiSupport;
import other.aakepi.bdfjfaackcpic.api.QueryResult;
import other.aakepi.bdfjfaackcpic.config.SpotConfig;

import java.util.HashMap;
import java.util.Map;

/**
 * 媒体管理查询
 * Created by yangyixin on 16/10/4.
 */
public class ContractSearch extends BaseApiSupport implements ApiSupport {



    @Override
    public String execute(Request request, Long userId, Long tenantId) {


        Map<String, Object> returnMap = new HashMap<String, Object>();

        String startAt = request.getParameter("begin");
        String endAt = request.getParameter("end");

        String op = request.getParameter("op");
        QueryResult result = null;
        //合同纪录
        if ("contract".equals(op)){
            result = getAllContract(request, 0, 20);
        }
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
        try{
            ScriptTriggerParam scriptTriggerParam = new ScriptTriggerParam();
            RkhdHttpClient rkhdHttpClient = new RkhdHttpClient();

            RkhdHttpData rkhdHttpData = new RkhdHttpData();
            rkhdHttpData.setCallString("/data/v1/query");
            rkhdHttpData.setCall_type("POST");
            System.out.println(sql);
            rkhdHttpData.putFormData("q", sql);

            String result = rkhdHttpClient.performRequest(rkhdHttpData);

            JSONObject jsonObject = JSONObject.fromObject(result);
            if (jsonObject ==null || jsonObject.isNullObject())
                return null;
            if (jsonObject.containsKey("error_code")){
                return null;
            }
            logger.info("getQueryResult:" + result);
            return (QueryResult)JSONObject.toBean(jsonObject,QueryResult.class);

        }catch(Exception e){
            e.printStackTrace();
            return null;
        }
    }


}
