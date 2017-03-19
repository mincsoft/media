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
            logger.debug("entry in PurchasingContractAfterTrigger----------------");

            Object idObj = list.get(0).getAttribute("id");   //得到采购合同id
            logger.info("销售合同ID：=="+idObj);
            Object status  = list.get(0).getAttribute("status");  //得到采购合同状态
            logger.info("销售合同状态Status：=="+status);
            if("2".equals(status.toString())) {   //采购合同生效 如果销售合同状态变为2，就把purContractSpotDate.点位中的数值放到media点位表中。
                // 1 更新合同状态
                JSONObject contract = getBelongs(NumberUtils.toLong(String.valueOf(idObj)));
                logger.info("获得合同信息：==="+contract);

                Date startDate = DateUtil.getDate(contract.getString("startDate"));
                Date  endDate = DateUtil.getDate(contract.getString("endDate"));

                Map<String,JSONObject> purContractSpotDateMap=getPurchasingContract(String.valueOf(idObj));
                Map<String,String> mediaMap=new HashMap<String, String>();
                Map<String,Map>  mediaIDExistMap=new HashMap<String, Map>();
                if(!purContractSpotDateMap.isEmpty()){
                    Iterator it = purContractSpotDateMap.keySet().iterator();
                    int num=0;
                    while(it.hasNext()) {
                        num++;
                        JSONObject spotDate = (JSONObject)purContractSpotDateMap.get((String)it.next());
                        long spotDateId = spotDate.getLong("id");
                        long meidaID= spotDate.getLong("mediaId");
                        String day = spotDate.getString("day");
                        String date = DateUtil.getDateStr(day);
                        String meidaIDStr=String.valueOf(meidaID);
                        if(!mediaMap.containsKey(meidaIDStr)){
                            mediaMap.put(meidaIDStr,meidaIDStr);
                        }

                        Map<String,JSONObject>  mediaSpotMap;
                        logger.info("mediaIDExistMap.isEmpty():=="+mediaIDExistMap.isEmpty());
                       if (mediaIDExistMap.isEmpty()||!mediaIDExistMap.containsKey(meidaIDStr)){
                           mediaSpotMap=getMediaSpotDate(meidaID,startDate.getTime(),endDate.getTime());
                           mediaIDExistMap.put(meidaIDStr,mediaSpotMap);
                       }else{
                           mediaSpotMap=mediaIDExistMap.get(meidaIDStr);
                       }
                        if (!mediaSpotMap.isEmpty()&&mediaSpotMap.containsKey(date)){
                            JSONObject mediaSpot =mediaSpotMap.get(date);
                            mediaSpot.accumulate("spot",0);
                            logger.info("PurchasingContractAfterTrigger.execute: 更新媒体库点位"+mediaSpot);
                            updateBelongs(mediaSpot);
                        }else{
                            JSONObject mediaSpotDate = new JSONObject();
                            mediaSpotDate.accumulate("customItem1",date);
                            mediaSpotDate.accumulate("spot",0);
                            mediaSpotDate.accumulate("meidaID",meidaID);
                            mediaSpotDate.accumulate("comment","新采购媒体");
                            spotDate.accumulate("dimDepart",contract.getString("dimDepart"));
                            logger.info("PurchasingContractAfterTrigger.execute: 新增的媒体点位"+mediaSpotDate);
                            createBelongs(mediaSpotDate888BelongID,mediaSpotDate);
                        }
                    }
                    logger.info("=========mediaMap.size==========="+mediaMap.size());
                    contract.put("status",2);
                    contract.put("number", mediaMap.size());
                    logger.info("=========更新合同内容==========="+contract);
                    updateBelongs(contract);
                    logger.info("=========更新合同状态完成===========");
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
        JSONArray array = queryAllResult(sql);
        logger.info("PurchasingContractAfterTrigger.getPurchasingContractResult:=="+array);
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
        sql.append(" and customItem1 >= ").append(beginLong).append(" and customItem1 <= ").append(endLong);
        JSONArray array = queryAllResult(sql.toString());
        logger.info("PurchasingContractAfterTrigger.getMediaSpotDate:=="+array);
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
        ArrayList<DataModel>  testArrayList=new ArrayList<DataModel>();
        Map<String,Object>  map=new HashMap<String, Object>();
        map.put("id","103141137");
        map.put("status","2");
        DataModel newDataModel=new DataModel(map);
        testArrayList.add(newDataModel);
        ScriptTriggerParam  test=new ScriptTriggerParam(testArrayList);
        try{
            purchasingContractAfterTrigger.execute(test);
        }catch (Exception e){
            e.printStackTrace();
        }


//        testTriggerTool.test("E:\\ideaworkspace\\media\\src\\main\\java\\scriptTrigger.xml", purchasingContractAfterTrigger);
    }

}
