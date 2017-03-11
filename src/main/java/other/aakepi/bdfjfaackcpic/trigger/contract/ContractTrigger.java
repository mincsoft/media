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

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 合同生效后自动生成上画记录
 */
public class ContractTrigger extends BaseTrigger implements ScriptTrigger {

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
                updateBelongs(contract);


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

                        //TODO 4. 更新meidia点位记录。 待验证
                        //获得合同信息
                        JSONObject contractCur= getContract(String.valueOf(id));
                        Date  startDate = DateUtil.getDate(contractCur.getString("startDate"));
                        Date  endDate = DateUtil.getDate(contractCur.getString("endDate"));
                        JSONArray getMediaRecords = null;
                        if (media!=null&&startDate != null && endDate != null) {
                            getMediaRecords = getMediaRecord(media.getLong("meidaId"), startDate.getTime(), endDate.getTime());
                        }
                        if (getMediaRecords!=null&&!getMediaRecords.isEmpty()){
                            for (int j=0;i<=getMediaRecords.size();j++){
                                JSONObject mediaSpotRecord=getMediaRecords.getJSONObject(j);
                                String dayMedia = mediaSpotRecord.getString("customItem1");
                                String dateMedia = DateUtil.getDateStr(dayMedia);
                                //判断是否包含到销售采购表中。
                               if(salSpotDayMap.containsKey(dateMedia)){
                                   mediaSpotRecord.put("spot",1);
                                   mediaSpotRecord.put("comment","正式合同");
                                   updateBelongs(mediaSpotRecord);
                               }
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
    //根据合同的起始日期，获得这段时间内的媒体库点位。
    private JSONArray getMediaRecord(long  mediaId,  Long beginLong ,  Long endLong ) {
        StringBuffer sql = new StringBuffer();
        sql.append("select id,customItem1,spot,comment from mediaSpotDate888 where meidaID=").append(mediaId);
        sql.append(" and day >= ").append(beginLong).append(" and day <= ").append(endLong);
        return queryResultArray(sql.toString());

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
        testTriggerTool.test("/Users/yujinliang/Documents/workspace/media/src/main/java/scriptTrigger.xml", paymentTrigger);
    }


}
