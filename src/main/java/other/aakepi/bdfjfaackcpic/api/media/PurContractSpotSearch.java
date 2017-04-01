package other.aakepi.bdfjfaackcpic.api.media;

import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import other.aakepi.bdfjfaackcpic.api.QueryResult;
import other.aakepi.bdfjfaackcpic.config.SpotField;
import other.aakepi.bdfjfaackcpic.enums.OpMode;
import other.aakepi.bdfjfaackcpic.util.DateUtil;

import java.util.*;

/**
 * 采购合同排期查询
 * Created by yangyixin on 16/10/8.
 */
public class PurContractSpotSearch extends BaseSpotSearch implements ApiSupport {

    //合同ID
    protected  String contractId;

    protected  JSONObject contract;
    protected  Date startDate;
    protected  Date endDate;
    /**
     * 初始化显示字段
     */
    protected void initSpotConfig() {
        //添加显示的字段：
        spotConfig.addField("name", 150, null);
        spotConfig.addField("form", 80, null);
        spotConfig.addField("entityType", 80, null);
        spotConfig.addField("opMode", 80, null);
//        spotConfig.addField("saleStatus", 80, null);
//        spotConfig.addField("retailPrice", 80, null);
        spotConfig.addFieldNotMedia("disPrice", "采购刊例单价",80, " fm: \"money||2|none\"");
        spotConfig.addFieldNotMedia("totalNum", "总投放数", 80, null);
        spotConfig.addFieldNotMedia("totalRetailAmount", "刊例总价", 100, " fm: \"money||2|none\"");
//        spotConfig.addFieldNotMedia("totalOrderAmount", "折后总价", 100, null);

        //在单价后显示排期点位信息
        spotConfig.setShowSpotFieldName("totalRetailAmount");
        spotConfig.addField("address", 450, null);
    }

    @Override
    public String execute(Request request, Long userId, Long tenantId) {

        initRequest(request);
        contractId= request.getParameter("id");
        logger.debug("contractid================"+contractId);
        if (StringUtils.isBlank(contractId)) contractId="-1";
        JSONObject contract = getContract(contractId);
        logger.debug("contract================"+contract);
        Map<String, Object> returnMap = new HashMap<String, Object>();

        returnMap.put("contract", contract);
        //合同不为空
        if (!contract.isEmpty() && !contract.containsKey("error_code")){
            initParam();

            startDate = DateUtil.getDate(contract.getString("startDate"));
            endDate = DateUtil.getDate(contract.getString("endDate"));

            JSONObject sheetObj = sheet(startDate, endDate, null);
            returnMap.put("sheet", sheetObj);
        }

        return JSONObject.fromObject(returnMap).toString();
    }

    /**
     * 查询合同
     * @return
     */
    protected JSONObject getContract( String contractId) {
        return getBelongs(NumberUtils.toLong(contractId));

    }


    /**
     * 获得媒体和广告位的JSON数组
     *
     * @param first
     * @param size
     * @return
     */
    protected JSONArray getMediaSpotCellData( int first, int size, int sheetId) {
        JSONArray headData = new JSONArray();
        JSONArray records = getAllMedia(first, size);
        if (records == null) return headData;
        JSONArray spotPlanDateList ;
        for (int i = 0; i < records.size(); i++) {
            //从第四行开始
            int startRow = 4 + i;
            int dateColumns = 0;
            JSONObject record = records.getJSONObject(i);
            String spotId =record.getString("id");
            String opMode =record.getString("opMode");

            JSONObject col0 = getItemObject(sheetId, startRow, dateColumns++);
            col0.accumulate("json", "{id: \"" + spotId + "\"}");
            headData.add(col0);

            List<SpotField> spotFieldList = spotConfig.getSpotFielList();
            for (int j = 0; j < spotFieldList.size(); j++) {
                SpotField spotField = spotFieldList.get(j);
                String fieldName = spotField.getEn();
                Object value = record.get(fieldName);
                if ("totalNum".equals(fieldName)||"totalRetailAmount".equals(fieldName)||"totalOrderAmount".equals(fieldName))
                    value = 0;
                if (value==null || StringUtils.isBlank(value.toString())){
                    //不处理
                    dateColumns++;
                }  else{
                    if ("select".equals(spotField.getType()) || "entityType".equals(spotField.getType())) {
                        headData.add(getColItemSelect(sheetId, startRow, dateColumns++, record, fieldName));
                    } else if (fieldName.equals("name")){//媒体名称，增加ID
                        Object mediaId = record.get("mediaId");
                        headData.add(getColItemIdValue(sheetId, startRow, dateColumns++, mediaId, value));
                    } else if ("totalNum".equals(fieldName)){//媒体名称，增加ID
                        int colIdex=dateColumns++;
                        int startCol=colIdex+2;
                        int spotNum = DateUtil.getBetweenDay(startDate,endDate);
                        headData.add(getColCalItemObject(sheetId, startRow,colIdex , "=SUM("+cellIndex(startRow,startCol)+":"+cellIndex(startRow,(startCol+spotNum))+")"));
                    } else if ("totalRetailAmount".equals(fieldName)){//媒体名称，增加ID
                        headData.add(getColCalItemObject(sheetId,startRow, dateColumns++, "=F"+startRow+"*"+"E"+startRow));
                    }
//                    else if ("totalOrderAmount".equals(fieldName)){//媒体名称，增加ID
//                        headData.add(getColCalItemObject(sheetId,startRow, dateColumns++, "=F"+startRow+"*"+"E"+startRow));
//                    }
                    else {
                        headData.add(getColItemObject(sheetId, startRow, dateColumns++, value));
                    }
                }
                //显示点位
                boolean renderDateColumn = fieldName.equalsIgnoreCase(spotConfig.getShowSpotFieldName());
//外购媒体
                boolean buyMedia = OpMode.BUY.getCode().equals(opMode);

                if (renderDateColumn) {
                    spotPlanDateList = getSpotDate(spotId);
                    logger.info("======getMediaSpotCellData.getSpotDate(spotId)=========="+spotPlanDateList);
                    //------------------------------------------
                    if (startDate != null && endDate != null) {
                        Calendar startCal = Calendar.getInstance();
                        startCal.setTime(startDate);
                        Calendar endCal = Calendar.getInstance();
                        endCal.setTime(endDate);
                        //date_0_2015-01-01
                        endCal.add(Calendar.DATE, 1);//最后日期加一天，便于循环

                        //外购点位纪录
                        Map<String,String> purSpotDateMap = new HashMap<String, String>();
                        if (buyMedia)
                            purSpotDateMap=getPurContractSpotDate(spotId,record.get("mediaId")+"");

                        while (startCal.before(endCal)) {
                            String date = String.format("%tF", startCal.getTime());

                            //控制是否允许填写
                            String other = "";

                            if((buyMedia&&purSpotDateMap.containsKey(date))){//1 没买的或者已经销售的
                                other = ",bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'";  //DFE3E8 223   227  232
                                headData.add(getColItemObject(sheetId, startRow, dateColumns, null,other));
                            }

                            boolean hasSpotItem = false;
                            if (spotPlanDateList != null && !spotPlanDateList.isEmpty()) {

                                for (int k = 0; k < spotPlanDateList.size(); k++) {
                                    JSONObject spotDate = spotPlanDateList.getJSONObject(k);
                                    logger.info("======getMediaSpotCellData. spotPlanDateList.getJSONObject(k)=========="+spotDate);
                                    Date spotDay = DateUtil.getDate(spotDate.getString("day"));
                                    if (date.equals(DateUtil.getDateStr(spotDay))) {
                                        //点位信息
                                        String spot = spotDate.getString("qty");
                                        headData.add(getColItemObject(sheetId, startRow, dateColumns, spot,other));

                                        //配上则删除集合
                                        spotPlanDateList.remove(k);
                                        hasSpotItem=true;
                                        break;
                                    }
                                }
                            }
                            //没有点位纪录，
                            if (!hasSpotItem && StringUtils.isNotBlank(other)){
                                headData.add(getColItemObject(sheetId, startRow, dateColumns, null,other));
                            }
                            startCal.add(Calendar.DATE, 1);//开始日期加1
                            //列加+1
                            dateColumns++;
                        }
                    }
                }
            }
        }

        return headData;
    }



    /**
     * 查询全部的媒体记录
     *
     * @return
     */
    private JSONArray getAllMedia(int first, int size) {

        JSONArray spotArray;
        StringBuffer sql = new StringBuffer();
        sql.append("select id,mediaId,disPrice,qty,retailAmount,disAmount from purContractSpot where contractId=").append(contractId);
        sql.append(" order by createdAt asc");
        QueryResult saleContractSpot = queryResult(sql.toString());
        if (saleContractSpot==null) return null;
        if (saleContractSpot.getCount()==0) return null;

        spotArray = saleContractSpot.getRecords();
        StringBuffer mediaIds = new StringBuffer();
        for (int i = 0; i < spotArray.size(); i++) {
            String mediaId = spotArray.getJSONObject(i).getString("mediaId");
            mediaIds.append(mediaId);
            if (i!=spotArray.size()-1){
                mediaIds.append(",");
            }
        }

        String spotField = spotConfig.getSql();
        sql = new StringBuffer();
        //添加经营方式
        sql.append("select id").append(spotField).append(",opMode from media ");
        sql.append(" where id in (").append(mediaIds).append(")");

        QueryResult mediaResult = queryResult( sql.toString());
        if (mediaResult!=null){
            JSONArray mediaArray = mediaResult.getRecords();
            for (int i = 0; i < spotArray.size(); i++) {
                JSONObject spotObj = spotArray.getJSONObject(i);
                String spotId =spotObj.getString("id");
                String mediaId=  spotObj.getString("mediaId");
                for (int j = 0; j < mediaArray.size(); j++) {
                    JSONObject mediaObj = mediaArray.getJSONObject(j);
                    String mediaObjId= mediaObj.getString("id");
                    String opMode =mediaObj.getString("opMode");
                    if (mediaId.equals(mediaObjId)){
                        //增加媒体数据
                        spotObj.putAll(mediaObj);
                        //恢复spotId
                        spotObj.put("id", spotId);
                        break;
                    }
                }

            }
        }

        return spotArray;
    }

    /**
     * 查询排期的点位纪录
     * @return
     */
    private JSONArray getSpotDate(String spotId) {
        StringBuffer sql = new StringBuffer();
        sql.append("select id,day,qty from purContractSpotDate where spotId=").append(spotId);
        return queryResultArray( sql.toString());
    }

    /**
     * 获得采购合同点位ID
     * @return
     */
    private Map<String,String> getPurContractSpotDate(String spotId,String mediaId) {
        StringBuffer sql = new StringBuffer();
        sql.append("select id,day from purContractSpotDate where mediaId=").append(mediaId);

        sql.append(" and spotId!="+spotId);//362989
        if (startDate != null && endDate != null) {
            Long beginLong = startDate.getTime();
            Long endLong = endDate.getTime();
            sql.append(" and day >= ").append(beginLong).append(" and day <= ").append(endLong);
        }
        JSONArray resultArray = queryResultArray( sql.toString());

        Map<String,String> purSpotDateMap=new HashMap<String, String>();
        for (int i = 0; i < resultArray.size(); i++) {
            JSONObject record = resultArray.getJSONObject(i);
            String day = record.getString("day");
            String date = DateUtil.getDateStr(day);
            purSpotDateMap.put(date,date);
        }
        return purSpotDateMap;
    }
}
