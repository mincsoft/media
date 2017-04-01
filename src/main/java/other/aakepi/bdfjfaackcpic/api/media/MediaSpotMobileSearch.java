package other.aakepi.bdfjfaackcpic.api.media;

import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import other.aakepi.bdfjfaackcpic.util.DateUtil;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * 媒体管理查询：手机段
 * Created by yangyixin on 16/10/4.
 */
public class MediaSpotMobileSearch extends BaseSpotSearch implements ApiSupport {


    protected  Date startDate;
    protected  Date endDate;
    String mediaId ;
    @Override
    public String execute(Request request, Long userId, Long tenantId) {


        mediaId = request.getParameter("mediaId");

        Map<String, Object> returnMap = new HashMap<String, Object>();

        startDate = DateUtil.getDate(request.getParameter("begin"));
        endDate = DateUtil.getDate(request.getParameter("end"));

        JSONObject mediaObj = getBelongs(NumberUtils.toLong(mediaId));
        JSONArray spotDataArray = getSpotData(mediaObj);

        returnMap.put("mediaObj", mediaObj);
        returnMap.put("spot", spotDataArray);

        return JSONObject.fromObject(returnMap).toString();
    }


    /**
     * 初始化显示字段
     */
    protected void initSpotConfig() {

    }

    @Override
    protected JSONArray getMediaSpotCellData(int first, int size, int sheetId) {
        return null;
    }


    /**
     * 获得媒体和广告位的JSON数组
     *
     * @return
     */
    protected JSONArray getSpotData(JSONObject media) {
        JSONArray headData = new JSONArray();

        //已经销售的点位
//        JSONArray spotPlanDateList = getSpotDate(media.getString("id"));
        int dateColumns = 0;
        //------------------------------------------
        if (startDate != null && endDate != null) {
            Calendar startCal = Calendar.getInstance();
            startCal.setTime(startDate);
            Calendar endCal = Calendar.getInstance();
            endCal.setTime(endDate);
            //date_0_2015-01-01
            endCal.add(Calendar.DATE, 1);//最后日期加一天，便于循环


            //保留点位
            Map<String,String> keepingSpotDate = getKeepingSpotDate(media.getString("id"));
            //销售的点位
            Map<String,String> saleSpotDate = getSaleSpotDate(media.getString("id"));
            //已外购或可用的点位
            Map<String,String> purSpotDate = getPurSpotDate(media);

            while (startCal.before(endCal)) {
                String date = String.format("%tF", startCal.getTime());

                String status = "";//1:已售；2:保留
                String ownerName ="";
                JSONObject dataObj = new JSONObject();
                dataObj.put("day",date);

                if (saleSpotDate.containsKey(date)){
                    status="1";
                    ownerName=saleSpotDate.get(date);
                }else if (keepingSpotDate.containsKey(date)){
                    status="2";
                    ownerName = keepingSpotDate.get(date);
                }else if (purSpotDate.containsKey(date)){
                    status="0";
//                    ownerName = keepingSpotDate.get(date);
                }else {
                    status="-1";
                }

//                boolean hasSpotItem = false;
//                if (spotPlanDateList != null && !spotPlanDateList.isEmpty()) {
//
//                    for (int k = 0; k < spotPlanDateList.size(); k++) {
//                        JSONObject spotDate = spotPlanDateList.getJSONObject(k);
//                        Date spotDay = DateUtil.getDate(spotDate.getString("day"));
//                        if (date.equals(DateUtil.getDateStr(spotDay))) {
//
//                            long ownerId = spotDate.getLong("ownerId");
//                            status="1";
//                            ownerName=getUserName(ownerId);
//                            //配上则删除集合
//                            spotPlanDateList.remove(k);
//                            hasSpotItem=true;
//                            break;
//                        }
//                    }
//                }
//
//                //没有销售点位纪录，已经保留
//                if (!hasSpotItem && keepingSpotDate.containsKey(date)){
//                    status="2";
//                    ownerName = keepingSpotDate.get(date);
//                }

                dataObj.put("status",status);
                dataObj.put("ownerName",ownerName);
                headData.add(dataObj);

                startCal.add(Calendar.DATE, 1);//开始日期加1
                //列加+1
                dateColumns++;
            }
        }

        return headData;
    }




    /**
     * 查询排期的点位纪录
     * @return
     */
    private JSONArray getSpotDate(String mediaId) {
        StringBuffer sql = new StringBuffer();
        sql.append("select id,day,spot,ownerId from saleContractSpotDate where meidaId=").append(mediaId);
        if (startDate != null && endDate != null) {
            Long beginLong = startDate.getTime();
            Long endLong = endDate.getTime();
            sql.append(" and day >= ").append(beginLong).append(" and day <= ").append(endLong);
//            sql.append(" and spot = 1 ");
        }

        return queryResultArray(sql.toString());
    }

    private Map<String, String> getPurSpotDate(JSONObject media) {

        String mediaId = media.getString("id");
        String opModeStr= media.getString("opMode"); //经营方式
        int opMode =0;
        if(StringUtils.isNotEmpty(opModeStr)){
            opMode=Integer.valueOf(opModeStr);
        }

        JSONArray resultArray = new JSONArray();
        if(opMode == 1 ){ //自有媒体, 每天都可用
            Calendar startCal = Calendar.getInstance();
            startCal.setTime(startDate);
            Calendar endCal = Calendar.getInstance();
            endCal.setTime(endDate);
            endCal.add(Calendar.DATE, 1);//最后日期加一天，便于循环

            while (startCal.before(endCal)) {
                JSONObject record = new JSONObject();
                record.put("day",String.format("%tF", startCal.getTime()));
                record.put("ownerId",0);
                resultArray.add(record);
                startCal.add(Calendar.DATE,1);
            }
        }else if(opMode == 2 ){ //外购媒体 买了才可用
            StringBuffer sql = new StringBuffer();
            sql.append("select id,day,spot,ownerId from purContractSpotDate where meidaId=").append(media);
            if (startDate != null && endDate != null) {
                Long beginLong = startDate.getTime();
                Long endLong = endDate.getTime();
                sql.append(" and day >= ").append(beginLong).append(" and day <= ").append(endLong);
//                sql.append(" and spot = 1 ");
            }
            resultArray = queryResultArray(sql.toString());
        }

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

    private Map<String, String> getSaleSpotDate(String id) {

        JSONArray resultArray = getSpotDate(id);

        Map<String,String> saleSpotDateMap=new HashMap<String, String>();
        for (int i = 0; i < resultArray.size(); i++) {
            JSONObject record = resultArray.getJSONObject(i);
            String day = record.getString("day");
            String date = DateUtil.getDateStr(day);
            //占用人信息
            long ownerId = record.getLong("ownerId");
            String userName = getUserName(ownerId);

            saleSpotDateMap.put(date,userName);
        }
        return saleSpotDateMap;
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


}
