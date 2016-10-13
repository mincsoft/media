package other.aakepi.bdfjfaackcpic.api.media;

import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import other.aakepi.bdfjfaackcpic.api.BaseApiSupport;
import other.aakepi.bdfjfaackcpic.api.QueryResult;
import other.aakepi.bdfjfaackcpic.config.SpotField;
import other.aakepi.bdfjfaackcpic.enums.OpMode;
import other.aakepi.bdfjfaackcpic.util.DateUtil;

import java.util.*;

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
        JSONArray spotDataArray = getSpotData();

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
    protected JSONArray getSpotData( ) {
        JSONArray headData = new JSONArray();

        //已经购买的点位
        JSONArray spotPlanDateList = getSpotDate(mediaId);
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
            Map<String,String> keepingSpotDate = getKeepingSpotDate(mediaId);

            while (startCal.before(endCal)) {
                String date = String.format("%tF", startCal.getTime());

                String status = "";//1:已售；2:保留
                String ownerName ="";
                JSONObject dataObj = new JSONObject();
                dataObj.put("day",date);

                boolean hasSpotItem = false;
                if (spotPlanDateList != null && !spotPlanDateList.isEmpty()) {

                    for (int k = 0; k < spotPlanDateList.size(); k++) {
                        JSONObject spotDate = spotPlanDateList.getJSONObject(k);
                        Date spotDay = DateUtil.getDate(spotDate.getString("day"));
                        if (date.equals(DateUtil.getDateStr(spotDay))) {

                            long ownerId = spotDate.getLong("ownerId");
                            status="1";
                            ownerName=getUserName(ownerId);
                            //配上则删除集合
                            spotPlanDateList.remove(k);
                            hasSpotItem=true;
                            break;
                        }
                    }
                }

                //没有购买点位纪录，已经保留
                if (!hasSpotItem && keepingSpotDate.containsKey(date)){
                    status="2";
                    ownerName = keepingSpotDate.get(date);
                }

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


}
