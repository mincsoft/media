package other.aakepi.bdfjfaackcpic.trigger.pur;

import com.rkhd.platform.sdk.ScriptTrigger;
import com.rkhd.platform.sdk.exception.ScriptBusinessException;
import com.rkhd.platform.sdk.model.DataModel;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import com.rkhd.platform.sdk.param.ScriptTriggerResult;
import com.rkhd.platform.sdk.test.tool.TestTriggerTool;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import other.aakepi.bdfjfaackcpic.trigger.BaseTrigger;
import other.aakepi.bdfjfaackcpic.util.DoubleUtil;

import java.util.List;

/**
 * 计划保存前校验金额
 */
public class PaymentPlanBeforeTrigger extends BaseTrigger implements ScriptTrigger {

    public ScriptTriggerResult execute(ScriptTriggerParam scriptTriggerParam)
            throws ScriptBusinessException {
        List<DataModel> list = scriptTriggerParam.getDataModelList();
        logger.debug("entry in PaymentPlanBeforeTrigger----------------");
        if (list != null && list.size() > 0) {
            DataModel dataModel = list.get(0);
            //1 本次计划金额
            Double amount = DoubleUtil.getValue(dataModel.getAttribute("amount")+"");

            //2 合同总金额
            Double contractAmount = 0.0;
            String purContractId = dataModel.getAttribute("contractId")+"";
            String contractSql = "select amount from purchasingContract where id ="+purContractId;
            JSONArray array = queryResultArray(contractSql);
            if (array!=null&&array.size()>0){
                JSONObject item = array.getJSONObject(0);
                contractAmount += item.getDouble("amount");
            }

            //3 历史付款计划金额
            Double totalPlanAmount = getTotalPlanAmount(purContractId);
            logger.debug("合同金额:"+contractAmount+" 本次金额:"+amount+" 历史金额:"+totalPlanAmount);
            if (DoubleUtil.add(amount,totalPlanAmount)>contractAmount){
                throw new ScriptBusinessException("付款计划已超过合同金额");
            }

        }

        ScriptTriggerResult scriptTriggerResult = new ScriptTriggerResult();
        scriptTriggerResult.setDataModelList(scriptTriggerParam.getDataModelList());
        return scriptTriggerResult;
    }

    private Double getTotalPlanAmount(String purContractId) {
        String sql = "select amount from paymentPlan where contractId = " + purContractId + "";
        JSONArray array = queryResultArray(sql);
        Double totalAmount = 0.0;
        JSONObject item;
        for (int i = 0; i < array.size(); i++) {
            item = array.getJSONObject(i);
            if (item == null) continue;
            totalAmount += item.getDouble("amount");
        }
        return totalAmount;
    }


    public static void main(String[] args) {
		TestTriggerTool testTriggerTool = new TestTriggerTool();
		PaymentPlanBeforeTrigger paymentTrigger = new PaymentPlanBeforeTrigger();
		testTriggerTool.test("/Users/yujinliang/Documents/workspace/media/src/main/java/scriptTrigger.xml", paymentTrigger);
    }


}
