package other.aakepi.bdfjfaackcpic.trigger.contract;

import com.rkhd.platform.sdk.ScriptTrigger;
import com.rkhd.platform.sdk.exception.ScriptBusinessException;
import com.rkhd.platform.sdk.model.DataModel;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import com.rkhd.platform.sdk.param.ScriptTriggerResult;
import com.rkhd.platform.sdk.test.tool.TestTriggerTool;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import other.aakepi.bdfjfaackcpic.trigger.BaseTrigger;

import java.util.Date;
import java.util.List;

/**
 * 合同生效后自动生成上画记录
 */
public class ContractTrigger extends BaseTrigger implements ScriptTrigger {

    public ScriptTriggerResult execute(ScriptTriggerParam scriptTriggerParam)
            throws ScriptBusinessException {
        List<DataModel> list = scriptTriggerParam.getDataModelList();

        if (list != null && list.size() > 0) {
            DataModel dataModel = list.get(0);
            logger.debug("data========"+dataModel.toString());
            Integer id = Integer.parseInt(dataModel.getAttribute("id") + "");
            Integer accountId = Integer.parseInt(dataModel.getAttribute("accountId") + "");
            String lockStatus = dataModel.getAttribute("lockStatus") + "";
            String status = dataModel.getAttribute("status") + "";
            logger.debug("status========"+status);
            if ("2".equals(lockStatus)&&!"2".equals(status)) {//合同生效
                // 1 更新合同状态
                JSONObject contract = new JSONObject();
                contract.put("id",id);
                contract.put("status",2);
                updateBelongs(contract);

                JSONArray mediaRecords = getSalesMediaRecord(id);
                logger.debug("mediaRecords========"+mediaRecords);
                JSONObject media = null;
                if (mediaRecords != null) {

                    //2 生成上画记录
                    JSONObject paint = null;
                    logger.debug("scriptTriggerParam.getUserId()========"+scriptTriggerParam.getUserId());
                    for (int i = 0; i < mediaRecords.size(); i++) {
                        media = mediaRecords.getJSONObject(i);
                        if (media == null) continue;
                        paint = new JSONObject();
                        paint.put("accountId", accountId);
                        paint.put("contractId", id);
                        paint.put("mediaId", media.getLong("meidaId"));
//                        paint.put("name", media.getInt("id") + 1);

                        long currUserId = scriptTriggerParam.getUserId()==0?563814:scriptTriggerParam.getUserId();
                        paint.put("ownerId", currUserId);
                        JSONObject currUser = getUserInfo(currUserId);
                        if (currUser != null) {
                            paint.put("dimDepart", currUser.getInt("departId"));
                            paint.put("paintPeople", currUser.getString("name"));
                        }
                        paint.put("paintTIme", (new Date().getTime()));
                        paint.put("paintQty", media.getDouble("displayQuantity"));
                        paint.put("paintAmount", media.getDouble("orderPriceTotal"));
                        paint.put("createdBy", currUserId);
                        paint.put("createdAt", (new Date().getTime()));
                        paint.put("lockStatus", "1");
                        paint.put("status", "1");
                        //创建上画记录
                        long paintBelongId = getBelongId("contractMediaPaint");
                        createBelongs(paintBelongId,paint);
                    }
                }

            }
        }

        ScriptTriggerResult scriptTriggerResult = new ScriptTriggerResult();
        scriptTriggerResult.setDataModelList(scriptTriggerParam.getDataModelList());
        return scriptTriggerResult;
    }


    private JSONArray getSalesMediaRecord(Integer contractId) {

        String sql = "select id,meidaId,orderPriceTotal,displayQuantity from saleContractSpot where id > 0 and contractId = " + contractId;

        return queryResultArray(sql);

    }

    public static void main(String[] args) {
        TestTriggerTool testTriggerTool = new TestTriggerTool();
        ContractTrigger paymentTrigger = new ContractTrigger();
        testTriggerTool.test("/Users/yujinliang/Documents/workspace/media/src/main/java/scriptTrigger.xml", paymentTrigger);
    }


}
