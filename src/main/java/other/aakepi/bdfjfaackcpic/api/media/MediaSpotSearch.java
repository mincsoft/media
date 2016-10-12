package other.aakepi.bdfjfaackcpic.api.media;

import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import other.aakepi.bdfjfaackcpic.api.QueryResult;
import other.aakepi.bdfjfaackcpic.config.SpotField;
import other.aakepi.bdfjfaackcpic.enums.OpMode;
import other.aakepi.bdfjfaackcpic.util.DateUtil;

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

        initRequest(request);

        initParam();

        Map<String, Object> returnMap = new HashMap<String, Object>();

        startDate = DateUtil.getDate(request.getParameter("begin"));
        endDate = DateUtil.getDate(request.getParameter("end"));
        JSONObject sheetObj = sheet(startDate, endDate, null);

        returnMap.put("sheet", sheetObj);
        return JSONObject.fromObject(returnMap).toString();
    }


    /**
     * 初始化显示字段
     */
    protected void initSpotConfig() {
        //添加显示的字段：
        spotConfig.addField("name", 150, null);
        spotConfig.addField("form", 80, null);
        spotConfig.addField("entityType", 80, null);
        spotConfig.addField("OpMode", 80, null);
        spotConfig.addField("saleStatus", 80, null);
        spotConfig.addField("address", 150, null);
        spotConfig.addField("retailPrice", 100, " fm: \"money||2|none\"");

        //在单价后显示排期点位信息
        spotConfig.setShowSpotFieldName("retailPrice");
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
            JSONArray spotPlanDateList ;
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
                    if (value == null || StringUtils.isBlank(value.toString())){
                        //不处理
                        dateColumns++;
                    }  else{
                        if ("select".equals(spotField.getType()) || "entityType".equals(spotField.getType())) {
                            headData.add(getColItemSelect(sheetId, startRow, dateColumns++, record, fieldName));
                        } else {
                            headData.add(getColItemObject(sheetId, startRow, dateColumns++, value));
                        }
                    }


                    //显示点位
                    boolean renderDateColumn = fieldName.equalsIgnoreCase(spotConfig.getShowSpotFieldName());
                    //外购媒体
                    boolean buyMedia = OpMode.BUY.getCode().equals(opMode);

                    if (renderDateColumn) {
                        //已经购买的点位
                        spotPlanDateList = getSpotDate(mediaId);
                        //------------------------------------------
                        if (startDate != null && endDate != null) {
                            Calendar startCal = Calendar.getInstance();
                            startCal.setTime(startDate);
                            Calendar endCal = Calendar.getInstance();
                            endCal.setTime(endDate);
                            //date_0_2015-01-01
                            endCal.add(Calendar.DATE, 1);//最后日期加一天，便于循环

                            //保留点位
                            Map<String,String> keepingSpotDate = getKeepingSpotDate(mediaId);

                            while (startCal.before(endCal)) {
                                String date = String.format("%tF", startCal.getTime());

                                //购买正常绿色
                                String other = ",bgc: '#D7E3BC'";

                                boolean hasSpotItem = false;
                                if (spotPlanDateList != null && !spotPlanDateList.isEmpty()) {

                                    for (int k = 0; k < spotPlanDateList.size(); k++) {
                                        JSONObject spotDate = spotPlanDateList.getJSONObject(k);
                                        Date spotDay = DateUtil.getDate(spotDate.getString("day"));
                                        if (date.equals(DateUtil.getDateStr(spotDay))) {
                                            //点位信息
                                            String spot = spotDate.getString("spot");
                                            headData.add(getColItemObject(sheetId, startRow, dateColumns, spot,other));

                                            //配上则删除集合
                                            spotPlanDateList.remove(k);
                                            hasSpotItem=true;
                                            break;
                                        }
                                    }
                                }

                                //没有购买点位纪录，已经保留
                                if (!hasSpotItem && keepingSpotDate.containsKey(date)){
                                    other =", bgc: '#87cefa'";
                                    String userName = keepingSpotDate.get(date);
//                                    if (StringUtils.isNotBlank(userName)){
//                                        other += ",  comment: '"+userName+"'";
//                                    }
                                    headData.add(getColItemObject(sheetId, startRow, dateColumns, userName,other));
                                }
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
        String mediaName = request.getParameter("mediaName");

        String spotField = spotConfig.getSql();
        StringBuffer sql = new StringBuffer();
        sql.append("select id").append(spotField).append(",opMode from media ");
        if (StringUtils.isNotBlank(mediaName)) {
            sql.append(" where name like '%").append(mediaName).append("%'");
        }
        sql.append(" order by name");
        sql.append(" limit ").append(first).append(",").append(size);

        return queryResult( sql.toString());
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

        return queryResultArray(sql.toString());
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
