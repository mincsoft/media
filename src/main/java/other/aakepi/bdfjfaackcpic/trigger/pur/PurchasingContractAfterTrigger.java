package other.aakepi.bdfjfaackcpic.trigger.pur;

import com.rkhd.platform.sdk.ScriptTrigger;
import com.rkhd.platform.sdk.exception.ScriptBusinessException;
import com.rkhd.platform.sdk.model.DataModel;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import com.rkhd.platform.sdk.param.ScriptTriggerResult;
import com.rkhd.platform.sdk.test.tool.TestTriggerTool;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.math.NumberUtils;
import other.aakepi.bdfjfaackcpic.trigger.BaseTrigger;
import other.aakepi.bdfjfaackcpic.util.DateUtil;

import java.util.*;

/**
 * Created by Administrator on 2017/3/15.
 */
public class PurchasingContractAfterTrigger extends BaseTrigger implements ScriptTrigger {
    long  mediaSpotDate888BelongID=100274711;
    @Override
    public ScriptTriggerResult execute(ScriptTriggerParam scriptTriggerParam) throws ScriptBusinessException {
        {
            List<DataModel> list = scriptTriggerParam.getDataModelList();
            logger.info("PurchasingContractAfterTrigger:begin:" + list.size());
            logger.debug("entry in paymentBeforeTrigger----------------");

            Object idObj = list.get(0).getAttribute("id");   //得到采购合同id
            logger.info("销售合同ID：=="+idObj);
            Object status  = list.get(0).getAttribute("status");  //得到采购合同状态
            logger.info("销售合同状态Status：=="+status);
            if("2".equals(status)) {   //采购合同生效 如果销售合同状态变为2，就把purContractSpotDate.点位中的数值放到media点位表中。
                // 1 更新合同状态
                JSONObject contract = getBelongs(NumberUtils.toLong(String.valueOf(idObj)));
                contract.put("status",2);
                updateBelongs(contract);

                Date startDate = DateUtil.getDate(contract.getString("startDate"));
                Date  endDate = DateUtil.getDate(contract.getString("endDate"));

                Map<String,JSONObject> purContractSpotDateMap=getPurchasingContract(String.valueOf(idObj));
                Map<String,Map>  mediaIDExistMap=new HashMap<String, Map>();
                if(!purContractSpotDateMap.isEmpty()){
                    Iterator it = purContractSpotDateMap.keySet().iterator();
                    while(it.hasNext()) {
                        JSONObject spotDate = (JSONObject)it.next();
                        long spotDateId = spotDate.getLong("id");
                        long meidaID= spotDate.getLong("mediaId");
                        String day = spotDate.getString("day");
                        String date = DateUtil.getDateStr(day);
                        String meidaIDStr=String.valueOf(meidaID);
                        Map<String,JSONObject>  mediaSpotMap;
                       if (mediaIDExistMap.isEmpty()||!mediaIDExistMap.containsKey(meidaIDStr)){
                           mediaSpotMap=getMediaSpotDate(meidaID,startDate.getTime(),endDate.getTime());
                           mediaIDExistMap.put(meidaIDStr,mediaSpotMap);
                       }else{
                           mediaSpotMap=mediaIDExistMap.get(meidaIDStr);
                       }
                        if (!mediaSpotMap.isEmpty()&&mediaSpotMap.containsKey(date)){
                            JSONObject mediaSpot =mediaSpotMap.get(date);
                            mediaSpot.accumulate("spot","0");
                            updateBelongs(mediaSpot);
                        }else{
                            JSONObject mediaSpotDate = new JSONObject();
                            mediaSpotDate.accumulate("customItem1",date);
                            mediaSpotDate.accumulate("spot","0");
                            mediaSpotDate.accumulate("meidaID",meidaID);
                            mediaSpotDate.accumulate("comment","新采购媒体");
                            createBelongs(mediaSpotDate888BelongID,mediaSpotDate);
                        }
                    }

                }
            }
            ScriptTriggerResult scriptTriggerResult = new ScriptTriggerResult();
            scriptTriggerResult.setDataModelList(scriptTriggerParam.getDataModelList());
            logger.info("PurchasingContractAfterTrigger:end:" + scriptTriggerResult);
            return scriptTriggerResult;
        }
    }
    //得到采购合同对应的点位数据
    private Map<String,JSONObject> getPurchasingContract(String purContractId) {
        String sql = "select id,day,qty,mediaId from purContractSpotDate where contractId = " + purContractId + "";
        JSONArray array = queryResultArray(sql);
        Map<String,JSONObject> result=new HashMap<String,JSONObject>();
        if (array!=null&&array.size()>0){
            for (int i = 0; i < array.size(); i++) {
                JSONObject item = array.getJSONObject(i);
                String id = item.getString("id");
                result.put(id,item);
            }
        }
        return result;
    }

    //得到采购合同对应的点位数据
    private Map<String,JSONObject> getMediaSpotDate(long  mediaId,  Long beginLong ,  Long endLong) {
        StringBuffer sql = new StringBuffer();
        sql.append("select id,customItem1,spot,comment from mediaSpotDate888 where meidaID=").append(mediaId);
        sql.append(" and day >= ").append(beginLong).append(" and day <= ").append(endLong);
        JSONArray array = queryResultArray(sql.toString());
        Map<String,JSONObject> result=new HashMap<String,JSONObject>();
        if (array!=null&&array.size()>0){
            for (int i = 0; i < array.size(); i++) {
                JSONObject item = array.getJSONObject(i);
                String day = item.getString("customItem1");
                String date = DateUtil.getDateStr(day);
                result.put(date,item);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        TestTriggerTool testTriggerTool = new TestTriggerTool();
        PurchasingContractAfterTrigger purchasingContractAfterTrigger = new PurchasingContractAfterTrigger();
        testTriggerTool.test("/Users/yujinliang/Documents/workspace/media/src/main/java/scriptTrigger.xml", purchasingContractAfterTrigger);
    }

}
