package other.aakepi.bdfjfaackcpic.api.media;

import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import com.rkhd.platform.sdk.log.Logger;
import com.rkhd.platform.sdk.log.LoggerFactory;
import com.sun.org.apache.xerces.internal.impl.xs.SchemaSymbols;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import other.aakepi.bdfjfaackcpic.api.QueryResult;
import other.aakepi.bdfjfaackcpic.config.SpotField;
import other.aakepi.bdfjfaackcpic.enums.OpMode;
import other.aakepi.bdfjfaackcpic.util.DateUtil;
import other.aakepi.bdfjfaackcpic.util.JSONUtil;

import java.util.*;

/**
 * 媒体管理查询
 * Created by yangyixin on 16/10/4.
 */
public class MediaSpotSearch extends BaseSpotSearch implements ApiSupport {
    protected  Date startDate;
    protected  Date endDate;

    @Override
    public String execute(Request request, Long userId, Long tenantId) {
        long startTime=System.currentTimeMillis();
        initRequest(request);

        initParam();
        long  initParamTime=System.currentTimeMillis()-startTime;
       logger.info("=========initParam tast time=============" + initParamTime);
        Map<String, Object> returnMap = new HashMap<String, Object>();

        startDate = DateUtil.getDate(request.getParameter("begin"));
        endDate = DateUtil.getDate(request.getParameter("end"));
        JSONObject sheetObj = sheet(startDate, endDate, null);

        returnMap.put("sheet", sheetObj);
        long endTime=System.currentTimeMillis();
        logger.info("==========消耗时间为：====" + (endTime - startTime));
        String jsonResult=JSONObject.fromObject(returnMap).toString();
        logger.info("===MediaSpotSearch.execute()==="+jsonResult);
        return jsonResult;
    }


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
        spotConfig.addField("retailPrice", 100, " fm: \"money||2|none\"");
        spotConfig.addField("postionCost", 100, " fm: \"money||2|none\"");
//        spotConfig.addFieldNotMedia("orderPrice", "折后单价",80, " fm: \"money||2|none\"");
        spotConfig.addFieldNotMedia("totalNum", "总投放数", 80, " fm: \"money||2|none\"");
        spotConfig.addFieldNotMedia("totalRetailAmount", "刊例总价", 100, " fm: \"money||2|none\"");
//        spotConfig.addFieldNotMedia("totalOrderAmount", "折后总价", 100, " fm: \"money||2|none\"");

        //在单价后显示排期点位信息
        spotConfig.setShowSpotFieldName("totalRetailAmount");
        spotConfig.addField("address", 450, null);
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
        QueryResult result = getAllMedia(first, size);
        if (result == null) return headData;
        if (result.getTotalSize() == null) return headData;
        if (result.getTotalSize() > 0) {
            //全部的媒体记录
            JSONArray records = result.getRecords();
//            JSONArray records=getAllMedia();
            logger.info("getAllMedia:==="+records);
//            JSONArray spotPlanDateList ;
            for (int i = 0; i < records.size(); i++) {
                //从第四行开始
                int startRow = 4 + i;
                int dateColumns = 0;
                JSONObject record = records.getJSONObject(i);
                String mediaId =record.getString("id");
                String opMode =record.getString("opMode");

                JSONObject col0 = getItemObject(sheetId, startRow, dateColumns++);
                col0.accumulate("json", "{id: \"" + mediaId + "\"}");
                headData.add(col0);

                List<SpotField> spotFieldList = spotConfig.getSpotFielList();
                for (int j = 0; j < spotFieldList.size(); j++) {
                    SpotField spotField = spotFieldList.get(j);
                    String fieldName = spotField.getEn();
                    Object value = record.get(fieldName);
                    if ("totalNum".equals(fieldName)||"totalRetailAmount".equals(fieldName)||"totalOrderAmount".equals(fieldName))
                        value = 0;
                    if (value == null || StringUtils.isBlank(value.toString())){
                        //不处理
                        dateColumns++;
                    }  else{
                        if ("select".equals(spotField.getType()) || "entityType".equals(spotField.getType())) {
                            headData.add(getColItemSelect(sheetId, startRow, dateColumns++, record, fieldName));
                        } else if ("totalNum".equals(fieldName)){//媒体名称，增加ID
                            int colIdex=dateColumns++;
                            int startCol=colIdex+2;
                            int spotNum = DateUtil.getBetweenDay(startDate,endDate);
                            headData.add(getColCalItemObject(sheetId, startRow,colIdex , "=SUM("+cellIndex(startRow,startCol)+":"+cellIndex(startRow,(startCol+spotNum))+")"));
                        } else if ("totalRetailAmount".equals(fieldName)){//媒体名称，增加ID
                            headData.add(getColCalItemObject(sheetId,startRow, dateColumns++, "=G"+startRow+"*"+"E"+startRow));
                        }
//                        else if ("totalOrderAmount".equals(fieldName)){//媒体名称，增加ID
//                            headData.add(getColCalItemObject(sheetId,startRow, dateColumns++, "=G"+startRow+"*"+"F"+startRow));
//                        }
                        else {
                            headData.add(getColItemObject(sheetId, startRow, dateColumns++, value));
                        }
                    }


                    //显示点位
                    boolean renderDateColumn = fieldName.equalsIgnoreCase(spotConfig.getShowSpotFieldName());
                    //外购媒体
                    boolean buyMedia = OpMode.BUY.getCode().equals(opMode);


                    if (renderDateColumn) {
                        //已经销售的点位
                        long start= System.currentTimeMillis();
                        //显示媒体库总表
//                        spotPlanDateList = getMediaSpotDate888(mediaId);
                        Map<String,JSONObject>  mediaSpot888Map=getMediaSpotDate888Map(mediaId);
                        long tastTime=System.currentTimeMillis()-start;
                        logger.info("==getSpotDate tasttime="+tastTime);
                        //------------------------------------------
                        if (startDate != null && endDate != null) {
                            Calendar startCal = Calendar.getInstance();
                            startCal.setTime(startDate);
                            Calendar endCal = Calendar.getInstance();
                            endCal.setTime(endDate);
                            //date_0_2015-01-01
                            endCal.add(Calendar.DATE, 1);//最后日期加一天，便于循环

                          /*  //保留点位
                               Map<String,String> keepingSpotDate =getKeepingSpotDate(mediaId);
//                            Map<String,String> keepingSpotDate = new HashMap<String, String>();
                            //外购的点位
                            Map<String,String> purSpotDate = getPurContractSpotDate(mediaId);
//                            Map<String,String> purSpotDate = new HashMap<String, String>();*/

                            while (startCal.before(endCal)) {
                                String date = String.format("%tF", startCal.getTime());

                                //销售正常绿色
                                String other = ",bgc: '#D7E3BC'"; // 浅绿色

                                boolean hasSpotItem = false;
                                if (mediaSpot888Map != null && !mediaSpot888Map.isEmpty()&&mediaSpot888Map.containsKey(date)) {

//                                    for (int k = 0; k < spotPlanDateList.size(); k++) {

                                    JSONObject spotDate = mediaSpot888Map.get(date);

                                    logger.info("==mediaSpot888Map.get("+date+")="+spotDate);
                                    String dayStr=spotDate.getString("customItem1");

                                    Date spotDay = DateUtil.getDate(dayStr);

                                        //点位信息
                                    String spot = spotDate.getString("spot");
                                    //spot 为1：已销售；2：未生效合同，comment 内容为占用人姓名；3：未购买；0：可销售
                                    if(StringUtils.isNotEmpty(spot)&&StringUtils.isNumeric(spot)){
                                        int intSpot=Integer.parseInt(spot);
                                        switch (intSpot) {
                                            case 0:
                                                other = "";
                                                headData.add(getColItemObject(sheetId, startRow, dateColumns, spot, other));
                                                break;

                                            case 1:
                                                other = ",bgc: '#D7E3BC'";//215 227 188  浅绿色
                                                headData.add(getColItemObject(sheetId, startRow, dateColumns, spot, other));
                                                break;

                                            case 2:
                                                other = ", bgc: '#87cefa'";   //蓝色  135 206 250
                                                String userName = spotDate.getString("comment");
                                                headData.add(getColItemObject(sheetId, startRow, dateColumns, userName, other));
                                                break;

                                            case 3:
//                                                    other =", bgc: '#C9D0CD'";  // 201  208  205   //灰色
                                                other = ",bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'";
                                                headData.add(getColItemObject(sheetId, startRow, dateColumns, "", other));
                                                break;

                                            default:
                                                other = ",bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'";
                                                headData.add(getColItemObject(sheetId, startRow, dateColumns, "", other));
                                                break;
                                        }
                                    }else{
                                        //  如果包含在媒体点位库表中，但是spot 标示错误数据的兼容
                                        if (buyMedia){
//                                        other =", bgc: '#C9D0CD'";
                                            other = ",bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'";
                                            headData.add(getColItemObject(sheetId, startRow, dateColumns, "",other));
                                        }else{
                                            //如果自由媒体，没有在媒体库点位表中有记录，认为都是可销售
                                            headData.add(getColItemObject(sheetId, startRow, dateColumns, "0",""));
                                        }
                                    }

                                        //配上则删除集合
                                        mediaSpot888Map.remove(date);
                                        hasSpotItem=true;

                                }else{
                                    if (buyMedia){
//                                        other =", bgc: '#C9D0CD'";
                                        other = ",bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'";
                                        headData.add(getColItemObject(sheetId, startRow, dateColumns, "",other));
                                    }else{
                                        //如果自由媒体，没有在媒体库点位表中有记录，认为都是可销售
                                        headData.add(getColItemObject(sheetId, startRow, dateColumns, "0",""));
                                    }
                                }

                           /*     //没有销售点位纪录，已经保留
                                if (!hasSpotItem && keepingSpotDate.containsKey(date)){
                                    other =", bgc: '#87cefa'";
                                    String userName = keepingSpotDate.get(date);
//                                    if (StringUtils.isNotBlank(userName)){
//                                        other += ",  comment: '"+userName+"'";
//                                    }
                                    headData.add(getColItemObject(sheetId, startRow, dateColumns, userName,other));
                                }
*/
                             /*   if(buyMedia&&purSpotDateMap!=null&&!purSpotDateMap.containsKey(date)){
                                    other =", bgc: '#C9D0CD'";
                                    headData.add(getColItemObject(sheetId, startRow, dateColumns, "",other));
                                }*/


                                startCal.add(Calendar.DATE, 1);//开始日期加1
                                //列加+1
                                dateColumns++;
                            }
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
    private QueryResult getAllMedia(int first, int size) {
        long start=System.currentTimeMillis();
        String mediaId = request.getParameter("mediaId");
        String mediaName = request.getParameter("mediaName");

        String spotField = spotConfig.getSql();
        StringBuffer sql = new StringBuffer();
        sql.append("select id").append(spotField).append(",opMode from media ");
        if (StringUtils.isNotBlank(mediaId)) {
            sql.append(" where id =").append(mediaId);
        }else if (StringUtils.isNotBlank(mediaName)) {
            sql.append(" where name like '%").append(mediaName).append("%'");
        }
        sql.append(" order by opMode desc");
        sql.append(" limit ").append(first).append(",").append(size);
        long tastTime=System.currentTimeMillis()-start;
        logger.info("===getAllMedia==="+tastTime);
        logger.info("======getAllMedia'sSQL========="+sql);
        QueryResult queryResult=queryResult(sql.toString());
        logger.info("======getAllMedia'queryResult========="+queryResult);
        return queryResult;
    }

    /**
     * 查询全部的媒体记录
     *
     * @return
     */
    private JSONArray getAllMedia() {
        long start=System.currentTimeMillis();
        String mediaId = request.getParameter("mediaId");
        String mediaName = request.getParameter("mediaName");

        String spotField = spotConfig.getSql();
        StringBuffer sql = new StringBuffer();
        sql.append("select id").append(spotField).append(",opMode from media ");
        if (StringUtils.isNotBlank(mediaId)) {
            sql.append(" where id =").append(mediaId);
        }else if (StringUtils.isNotBlank(mediaName)) {
            sql.append(" where name like '%").append(mediaName).append("%'");
        }
        sql.append(" order by opMode");
//        sql.append(" limit ").append(first).append(",").append(size);
        long tastTime=System.currentTimeMillis()-start;
        logger.info("===getAllMedia==="+tastTime);
        logger.info("======getAllMedia'sSQL========="+sql);
        JSONArray resultArray=queryAllResult(sql.toString());
        logger.info("======getAllMedia'queryResult========="+resultArray);
        return resultArray;
    }

    /**
     * 查询排期的点位纪录
     * @return
     */
    private JSONArray getSpotDate(String mediaId) {

        StringBuffer sql = new StringBuffer();
        sql.append("select id,day,spot from saleContractSpotDate where meidaId=").append(mediaId);
        if (startDate != null && endDate != null) {
            Long beginLong = startDate.getTime();
            Long endLong = endDate.getTime();
            sql.append(" and day >= ").append(beginLong).append(" and day <= ").append(endLong);
        }
        JSONArray resultSpotDate=queryResultArray(sql.toString());
        logger.info("===MediaSpotSearch.getSpotDate("+mediaId+")=="+resultSpotDate);
        return resultSpotDate;
    }

    /**
     * 查询排期总表的点位纪录
     * @return
     */
    private JSONArray getMediaSpotDate888(String mediaId) {

        StringBuffer sql = new StringBuffer();
        sql.append("select id,customItem1,spot,comment from mediaSpotDate888 where meidaID=").append(mediaId);
        if (startDate != null && endDate != null) {
            Long beginLong = startDate.getTime();
            Long endLong = endDate.getTime();
            sql.append(" and customItem1 >= ").append(beginLong).append(" and customItem1 <= ").append(endLong);
        }
        JSONArray resultMediaSpotDate888=queryResultArray(sql.toString());
        logger.info("===MediaSpotSearch.getMediaSpotDate888("+mediaId+")=="+resultMediaSpotDate888);
        return resultMediaSpotDate888;
    }

    /**
     * 查询排期总表的点位纪录的MAP
     * @return
     */
    private Map<String,JSONObject> getMediaSpotDate888Map(String mediaId) {
        Map<String,JSONObject> resultMap=new HashMap<String, JSONObject>();
        JSONArray resultMediaSpotDate888= getMediaSpotDate888( mediaId);
        if(resultMediaSpotDate888!=null&&!resultMediaSpotDate888.isEmpty()){
            for(int i=0;i<resultMediaSpotDate888.size();i++) {
                JSONObject record=resultMediaSpotDate888.getJSONObject(i);
                String day = record.getString("customItem1");
                String date = DateUtil.getDateStr(day);
                resultMap.put(date,record);
            }
        }
        return resultMap;
    }

    /**
     * 查询排期的点位纪录
     * @return
     */
    private Map<String,String> getKeepingSpotDate(String mediaId) {
        StringBuffer sql = new StringBuffer();
        sql.append("select id,day,ownerId from mediaKeepingSpotDate where mediaId=").append(mediaId);
        if (startDate != null && endDate != null) {
            Long beginLong = startDate.getTime();
            Long endLong = endDate.getTime();
            sql.append(" and day >= ").append(beginLong).append(" and day <= ").append(endLong);
        }
        JSONArray resultArray = queryResultArray( sql.toString());
        logger.info("=====getKeepingSpotDate======="+resultArray);
        Map<String,String> purSpotDateMap=new HashMap<String, String>();
        for (int i = 0; i < resultArray.size(); i++) {
            JSONObject record = resultArray.getJSONObject(i);
            String day = record.getString("day");
            String date = DateUtil.getDateStr(day);
            //占用人信息
            long ownerId = record.getLong("ownerId");
            String userName = getUserName(ownerId);

            purSpotDateMap.put(date,userName);
        }
        logger.info("===MediaSpotSearch.getKeepingSpotDate("+mediaId+")=="+purSpotDateMap);
        return purSpotDateMap;
    }

    /**
     * 获得采购合同点位ID
     * @return
     */
    private Map<String,String> getPurContractSpotDate(String mediaId) {
        StringBuffer sql = new StringBuffer();
        sql.append("select id,day from purContractSpotDate where mediaId=").append(mediaId);
        if (startDate != null && endDate != null) {
            Long beginLong = startDate.getTime();
            Long endLong = endDate.getTime();
            sql.append(" and day >= ").append(beginLong).append(" and day <= ").append(endLong);
        }
        JSONArray resultArray = queryResultArray( sql.toString());
        logger.info("=====getPurContractSpotDate======="+resultArray);
        Map<String,String> purSpotDateMap= new HashMap<String, String>();
        for (int i = 0; i < resultArray.size(); i++) {
            JSONObject record = resultArray.getJSONObject(i);
            String day = record.getString("day");
            String date = DateUtil.getDateStr(day);
            purSpotDateMap.put(date,date);
        }
        logger.info("===MediaSpotSearch.getPurContractSpotDate("+mediaId+")=="+purSpotDateMap);
        return purSpotDateMap;
    }

    public static void main(String[] args) {
        MediaSpotSearch mediaSpotSearch = new MediaSpotSearch();
        com.rkhd.platform.sdk.http.Request rkhdRequest = new com.rkhd.platform.sdk.http.Request();
//        rkhdRequest.putParameter("mediaName", new String[]{"广州塔媒体2"});
        rkhdRequest.putParameter("mediaId", new String[]{""});
        rkhdRequest.putParameter("begin", new String[]{"2017-03-22"});
        rkhdRequest.putParameter("end", new String[]{"2017-04-22"});

        //返回的结果
        String json = mediaSpotSearch.execute(rkhdRequest, null, null);

        String newJson = JSONUtil.string2Json(json);
        System.out.println("返回newJson===" + newJson);
    }
}
