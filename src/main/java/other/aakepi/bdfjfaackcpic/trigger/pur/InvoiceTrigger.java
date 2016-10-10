package other.aakepi.bdfjfaackcpic.trigger.pur;

import com.rkhd.platform.sdk.ScriptTrigger;
import com.rkhd.platform.sdk.exception.ScriptBusinessException;
import com.rkhd.platform.sdk.http.RkhdHttpClient;
import com.rkhd.platform.sdk.http.RkhdHttpData;
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

/**
 * 收票后更新付款记录
 */
public class InvoiceTrigger extends BaseTrigger implements ScriptTrigger {

    public ScriptTriggerResult execute(ScriptTriggerParam scriptTriggerParam)
            throws ScriptBusinessException {
        List<DataModel> list = scriptTriggerParam.getDataModelList();

        if (list != null && list.size() > 0) {
            DataModel dataModel = list.get(0);
            int stage = dataModel.getAttribute("stage")!=null&&!"".equals(dataModel.getAttribute("stage"))?Integer.parseInt(dataModel.getAttribute("stage")+""):0;
            String contractId = dataModel.getAttribute("contractId")+"";
            double amount = dataModel.getAttribute("invAmount")!=null&&!"".equals(dataModel.getAttribute("invAmount"))?Double.valueOf(dataModel.getAttribute("invAmount") + ""):0.0;
            //1 获取本期付款记录
            String sql = "select id,amount from paymentRecord where stage =" + stage + " and contractId = '" + contractId + "'";
            JSONArray array =  queryResultArray(sql);
            if (array!=null&&array.size()>0){
                JSONObject item = (JSONObject) array.get(0);
                double payAmount = item.getDouble("amount");
                String id = item.getString("id");
                if (Math.abs(amount - payAmount) < 0.01 || amount > payAmount) {//如果实际开票金额>=付款金额(考虑尾差),就更新付款记录状态

                    JSONObject jsonObject = new JSONObject();
                    jsonObject.accumulate("id",id);
                    jsonObject.accumulate("invoiceFlg",2);
                    //2 更新状态
                    updateBelongs(jsonObject);
                }
            }
        }

        ScriptTriggerResult scriptTriggerResult = new ScriptTriggerResult();
        scriptTriggerResult.setDataModelList(scriptTriggerParam.getDataModelList());
        return scriptTriggerResult;
    }


    public static void main(String[] args) {
		TestTriggerTool testTriggerTool = new TestTriggerTool();
		InvoiceTrigger paymentTrigger = new InvoiceTrigger();
		testTriggerTool.test("/Users/yangyixin/Documents/workspace/mincsoft/media/src/main/java/scriptTrigger.xml", paymentTrigger);
    }


}
