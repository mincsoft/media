package other.aakepi.bdfjfaackcpic.api.media;

import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import com.rkhd.platform.sdk.http.RkhdHttpClient;
import com.rkhd.platform.sdk.http.RkhdHttpData;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
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
        int first = 0;
        int size = 20;

        Map<String, Object> returnMap = new HashMap<String, Object>();

        String startAt = request.getParameter("begin");
        String endAt = request.getParameter("end");

        String op = request.getParameter("op");
        QueryResult result = null;
        String start = request.getParameter("start");
        if (StringUtils.isNotBlank(start)){
           int startInt = NumberUtils.toInt(start);
            first = startInt * size ;
        }
        //合同纪录
        if ("contract".equals(op)){
            result = getAllContract(request, 0, 20);
        } else if ("mediaSearchMobile".equals(op)){
            //媒体查询
            result = getAllMedia(request,first, size);
        } else if ("purContract".equals(op)){
            //采购合同查询
            result = getAllPurContract(request,first, size);
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

    /**
     * 查询全部的媒体记录
     *
     * @return
     */
    private QueryResult getAllMedia(Request request,int first, int size) {
        String mediaName = request.getParameter("mediaName");

        StringBuffer sql = new StringBuffer();
        sql.append("select id,name,opMode from media ");
        if (StringUtils.isNotBlank(mediaName)) {
            sql.append(" where name like '%").append(mediaName).append("%'");
        }
        sql.append(" order by name");
        sql.append(" limit ").append(first).append(",").append(size);

        return queryResult( sql.toString());
    }

    /**
     * 查询全部的采购合同
     *
     * @return
     */
    private QueryResult getAllPurContract(Request request,int first, int size) {

        StringBuffer sql = new StringBuffer();
        sql.append("select id,name from purchasingContract where id>0");
        sql.append(" order by createdAt asc");
        return queryResult(sql.toString());
    }

}
