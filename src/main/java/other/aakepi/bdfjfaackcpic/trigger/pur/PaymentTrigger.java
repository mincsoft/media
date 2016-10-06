package other.aakepi.bdfjfaackcpic.trigger.pur;

import other.aakepi.bdfjfaackcpic.api.BaseResponse;
import other.aakepi.bdfjfaackcpic.http.MincsoftHttpClient;
import other.aakepi.bdfjfaackcpic.trigger.BaseTrigger;
import other.aakepi.bdfjfaackcpic.util.Configuration;
import com.rkhd.platform.sdk.exception.ScriptBusinessException;
import com.rkhd.platform.sdk.http.RkhdHttpClient;
import com.rkhd.platform.sdk.http.RkhdHttpData;
import com.rkhd.platform.sdk.log.Logger;
import com.rkhd.platform.sdk.log.LoggerFactory;
import com.rkhd.platform.sdk.model.DataModel;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import com.rkhd.platform.sdk.param.ScriptTriggerResult;
import com.rkhd.platform.sdk.test.tool.TestTriggerTool;
import net.sf.json.JSONObject;

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
            int stage = Integer.parseInt(dataModel.getAttribute("stage") + "");
            String contractId = (String) dataModel.getAttribute("contractId");
            double amount = Double.valueOf(dataModel.getAttribute("amount") + "");

            //1 获取本期付款计划
            String sql = "select id,amount from paymentPlan where stage =" + stage + " and contractId = '" + contractId + "'";
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

                double planAmount = planResult.getDouble("amount");
                String id = planResult.getString("id");
                if (Math.abs(amount - planAmount) < 0.01 || amount > planAmount) {//如果实际付款金额>=计划付款金额(考虑尾差),就更新付款计划状态
                    String json = "{id:"+id+",status:已付款}";
                    JSONObject params = new JSONObject();
                    params.put("access_token", "Bearer%20" + getAuthToken());
                    params.put("json", json);

                    //2 更新状态
                    BaseResponse res = MincsoftHttpClient.post(Configuration.getInstance().getValue("update_entity_data"), params.toString());
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
		PaymentTrigger saveMettingTrigger = new PaymentTrigger();
		testTriggerTool.test("/Users/yujinliang/Documents/workspace/media/src/main/java/scriptTrigger.xml", saveMettingTrigger);
    }


}
