package other.aakepi.bdfjfaackcpic.trigger.pur;

import com.rkhd.platform.sdk.exception.ScriptBusinessException;
import com.rkhd.platform.sdk.http.RkhdHttpClient;
import com.rkhd.platform.sdk.http.RkhdHttpData;
import com.rkhd.platform.sdk.log.Logger;
import com.rkhd.platform.sdk.log.LoggerFactory;
import com.rkhd.platform.sdk.model.DataModel;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import com.rkhd.platform.sdk.param.ScriptTriggerResult;
import com.rkhd.platform.sdk.test.tool.TestTriggerTool;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import other.aakepi.bdfjfaackcpic.api.QueryResult;
import other.aakepi.bdfjfaackcpic.trigger.BaseTrigger;

import java.io.IOException;
import java.util.List;
//import com.rkhd.platform.sdk.test.tool.TestTriggerTool;

/**
 * 付款后更新付款计划
 */
public class PaymentTrigger extends BaseTrigger {
    private Logger logger = LoggerFactory.getLogger();

    @Override
    public ScriptTriggerResult execute(ScriptTriggerParam scriptTriggerParam)
            throws ScriptBusinessException {
        List<DataModel> list = scriptTriggerParam.getDataModelList();

        if (list != null && list.size() > 0) {
            DataModel dataModel = list.get(0);
            int stage = dataModel.getAttribute("stage")!=null&&!"".equals(dataModel.getAttribute("stage"))?Integer.parseInt(dataModel.getAttribute("stage")+""):0;
            String contractId = dataModel.getAttribute("contractId")+"";
            double amount = dataModel.getAttribute("amount")!=null&&!"".equals(dataModel.getAttribute("amount"))?Double.valueOf(dataModel.getAttribute("amount") + ""):0.0;

            //1 获取本期付款计划
            String sql = "select id,amount from paymentPlan where stage =" + stage + " and contractId = '" + contractId + "'";
            sql = "select id,amount from paymentPlan where stage =1";
            amount = 2000.0;
            RkhdHttpClient rkhdHttpClient = null;
            try {
                rkhdHttpClient = new RkhdHttpClient();
                RkhdHttpData rkhdHttpData = new RkhdHttpData();
                rkhdHttpData.setCallString("/data/v1/query");
                rkhdHttpData.setCall_type("POST");

                rkhdHttpData.putFormData("q", sql);
                System.out.println("sql---------" + sql);

                String planResultJson = rkhdHttpClient.performRequest(rkhdHttpData);
                System.out.println("planResultJson---------" + planResultJson);
                JSONObject planResult = JSONObject.fromObject(planResultJson);
                QueryResult queryResult = (QueryResult)JSONObject.toBean(planResult,QueryResult.class);

                JSONArray array = queryResult.getRecords();

                if (array!=null&&array.size()>0){
                    JSONObject item = (JSONObject) array.get(0);
                    double planAmount = item.getDouble("amount");
                    String id = item.getString("id");
                    if (Math.abs(amount - planAmount) < 0.01 || amount > planAmount) {//如果实际付款金额>=计划付款金额(考虑尾差),就更新付款计划状态
                        String json = "{\"id\":"+id+",\"status\":2}";
//                        JSONObject params = new JSONObject();
//                        params.put("access_token", "Bearer%20" + getAuthToken());
//                        params.put("json", json);

                        //2 更新状态
                        rkhdHttpData = new RkhdHttpData();
                        rkhdHttpData.setCallString("/data/v1/objects/customize/update");
                        rkhdHttpData.setCall_type("POST");
                        rkhdHttpData.putFormData("json", json);
                        String resultStr = rkhdHttpClient.performRequest(rkhdHttpData);
                        System.out.println("result ----------"+resultStr);
                    }
                }



            } catch (IOException e) {
                e.printStackTrace();
            }


        }

        ScriptTriggerResult scriptTriggerResult = new ScriptTriggerResult();
        scriptTriggerResult.setDataModelList(scriptTriggerParam.getDataModelList());
        return scriptTriggerResult;
    }


    public static void main(String[] args) {
		TestTriggerTool testTriggerTool = new TestTriggerTool();
		PaymentTrigger paymentTrigger = new PaymentTrigger();
		testTriggerTool.test("/Users/yujinliang/Documents/workspace/media/src/main/java/scriptTrigger.xml", paymentTrigger);
    }


}
