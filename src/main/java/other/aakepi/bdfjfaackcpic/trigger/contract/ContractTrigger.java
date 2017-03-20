package other.aakepi.bdfjfaackcpic.trigger.contract;

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
 * 合同生效后自动生成上画记录
 */
public class ContractTrigger extends BaseTrigger implements ScriptTrigger {
    long  mediaSpotDate888BelongID=100274711;
    public ScriptTriggerResult execute(ScriptTriggerParam scriptTriggerParam)
            throws ScriptBusinessException {
        List<DataModel> list = scriptTriggerParam.getDataModelList();
        logger.debug("entry in ContractTrigger========");
        if (list != null && list.size() > 0) {
            DataModel dataModel = list.get(0);
            logger.debug("data========"+dataModel.toString());
            Integer id = Integer.parseInt(dataModel.getAttribute("id") + "");
            Integer accountId = Integer.parseInt(dataModel.getAttribute("accountId") + "");
            String lockStatus = dataModel.getAttribute("lockStatus") + "";
            String status = dataModel.getAttribute("status") + "";
            logger.debug("lockStatus========"+lockStatus);
            logger.debug("status========"+status);


            if ("2".equals(lockStatus)&&!"2".equals(status)) {//合同生效
                               // 1 更新合同状态
                JSONObject contract = new JSONObject();
                contract.put("id",id);
                contract.put("status",2);
                JSONObject resutlContractResult= updateBelongs(contract);
                logger.debug("resutlContractResult========"+resutlContractResult);
                JSONArray salesSpotRecords = getSalesSpotRecord(id);
                logger.debug("mediaRecords========"+salesSpotRecords);
                JSONObject media = null;

                if (salesSpotRecords != null) {
                    Map<String,String>  salSpotDayMap=new HashMap<String, String>();
                    //2 生成上画记录
                    JSONObject paint = null;

                    logger.debug("scriptTriggerParam.getUserId()========"+scriptTriggerParam.getUserId());
                    for (int i = 0; i < salesSpotRecords.size(); i++) {
                        media = salesSpotRecords.getJSONObject(i);
                        if (media == null) continue;
                        paint = new JSONObject();
                        paint.put("accountId", accountId);
                        paint.put("contractId", id);
                        paint.put("mediaId", media.getLong("meidaId"));
//                        paint.put("name", media.getInt("id") + 1);
                        String day = media.getString("day");
                        String date = DateUtil.getDateStr(day);
                        salSpotDayMap.put(date, date);
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
                    //获得合同信息
                    JSONObject contractCur= getContract(String.valueOf(id));
                    Date  startDate = DateUtil.getDate(contractCur.getString("startDate"));
                    Date  endDate = DateUtil.getDate(contractCur.getString("endDate"));

                    //TODO 4. 更新meidia点位记录。 待验证
                    logger.info("更新合同状态为2的时候，记录或者增加媒体库点位信息==========");
                    //采购合同生效 如果销售合同状态变为2，就把saleContractSpotDate.点位中的数值放到media点位表中。
                    Map<String,JSONObject> saleContractSpotDateMap=getSalesSpotDateMap(String.valueOf(id));
                    logger.info("saleContractSpotDateMap=========="+saleContractSpotDateMap);
                    Map<String,Map>  mediaIDExistMap=new HashMap<String, Map>();
                    if(!saleContractSpotDateMap.isEmpty()){
                        Iterator it = saleContractSpotDateMap.keySet().iterator();
                        while(it.hasNext()) {
                            JSONObject spotDate =saleContractSpotDateMap.get(it.next());
                            logger.info("saleContractSpotDateMap.spotDate=========="+spotDate);
                            long meidaID= spotDate.getLong("mediaId");
                            String day = spotDate.getString("day");
                            String date = DateUtil.getDateStr(day);
                            String meidaIDStr=String.valueOf(meidaID);
                            Map<String,JSONObject>  mediaSpotMap;
                            if (mediaIDExistMap.isEmpty()||!mediaIDExistMap.containsKey(meidaIDStr)){
                                mediaSpotMap=getMediaSpotDateMap(meidaID,startDate.getTime(),endDate.getTime());
                                mediaIDExistMap.put(meidaIDStr,mediaSpotMap);
                            }else{
                                mediaSpotMap=mediaIDExistMap.get(meidaIDStr);
                            }
                            if (!mediaSpotMap.isEmpty()&&mediaSpotMap.containsKey(date)){
                                JSONObject mediaSpot =mediaSpotMap.get(date);
                                mediaSpot.accumulate("spot","1");
                                updateBelongs(mediaSpot);
                            }else{
                                JSONObject mediaSpotDate = new JSONObject();
                                mediaSpotDate.accumulate("customItem1",date);
                                mediaSpotDate.accumulate("spot","1");
                                mediaSpotDate.accumulate("meidaID",meidaID);
                                mediaSpotDate.accumulate("comment","已销售媒体");
                                mediaSpotDate.accumulate("dimDepart",contract.getLong("dimDepart"));
                                logger.info("ContractTrigger.execute: mediaSpotDate888BelongID 新增的媒体点位"+mediaSpotDate);
                                createBelongs(mediaSpotDate888BelongID,mediaSpotDate);
                            }
                        }
                    }
                }


            }
        }

        ScriptTriggerResult scriptTriggerResult = new ScriptTriggerResult();
        scriptTriggerResult.setDataModelList(scriptTriggerParam.getDataModelList());
        return scriptTriggerResult;
    }


    private JSONArray getSalesSpotRecord(Integer contractId) {

        String sql = "select id,meidaId,orderPriceTotal,displayQuantity from saleContractSpot where id > 0 and contractId = " + contractId;

        return queryResultArray(sql);

    }
    private JSONArray getSalesSpotDateRecord(Integer contractId) {

        String sql = "select id,day,spot,meidaId,spotId from saleContractSpotDate where id > 0 and contractId = " + contractId;

        return queryResultArray(sql);

    }
    //得到销售合同对应的点位数据
    private Map<String,JSONObject> getSalesSpotDateMap(String purContractId) {
        String sql = "select id,day,spot,meidaId,spotId from saleContractSpotDate where contractId = " + purContractId + "";
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
    //根据合同的起始日期，获得这段时间内的媒体库点位。
    private JSONArray getMediaRecord(long  mediaId,  Long beginLong ,  Long endLong ) {
        StringBuffer sql = new StringBuffer();
        sql.append("select id,customItem1,spot,comment from mediaSpotDate888 where meidaID=").append(mediaId);
        sql.append(" and day >= ").append(beginLong).append(" and day <= ").append(endLong);
        return queryResultArray(sql.toString());

    }
    //得到采购合同对应的点位数据
    private Map<String,JSONObject> getMediaSpotDateMap(long  mediaId,  Long beginLong ,  Long endLong ) {
        StringBuffer sql = new StringBuffer();
        sql.append("select id,customItem1,spot,comment from mediaSpotDate888 where meidaID=").append(mediaId);
        sql.append(" and day >= ").append(beginLong).append(" and day <= ").append(endLong);
        JSONArray array = queryResultArray(sql.toString());
        Map<String, JSONObject> result = new HashMap<String, JSONObject>();
        if (array != null && array.size() > 0) {
            for (int i = 0; i < array.size(); i++) {
                JSONObject item = array.getJSONObject(i);
                String day = item.getString("customItem1");
                String date = DateUtil.getDateStr(day);
                result.put(date, item);
            }
        }
        return result;
    }

    /**
     * 查询合同
     * @return
     */
    protected JSONObject getContract( String contractId) {
        return getBelongs(NumberUtils.toLong(contractId));

    }
    public static void main(String[] args) {
        TestTriggerTool testTriggerTool = new TestTriggerTool();
        ContractTrigger paymentTrigger = new ContractTrigger();
        ArrayList<DataModel>  testArrayList=new ArrayList<DataModel>();
        Map<String,Object>  map=new HashMap<String, Object>();
        map.put("id","103141137");
        map.put("status","2");
        DataModel newDataModel=new DataModel(map);
        testArrayList.add(newDataModel);
        ScriptTriggerParam  test=new ScriptTriggerParam(testArrayList);
        try{
            paymentTrigger.execute(test);
        }catch (Exception e){
            e.printStackTrace();
        }

//        testTriggerTool.test("/Users/yujinliang/Documents/workspace/media/src/main/java/scriptTrigger.xml", paymentTrigger);
    }


}
