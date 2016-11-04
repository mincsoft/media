package other.aakepi.bdfjfaackcpic.trigger.mediaKeeping;

import com.rkhd.platform.sdk.ScriptTrigger;
import com.rkhd.platform.sdk.exception.ScriptBusinessException;
import com.rkhd.platform.sdk.model.DataModel;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import com.rkhd.platform.sdk.param.ScriptTriggerResult;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import other.aakepi.bdfjfaackcpic.api.QueryResult;
import other.aakepi.bdfjfaackcpic.trigger.BaseTrigger;
import other.aakepi.bdfjfaackcpic.util.DateUtil;
import other.aakepi.bdfjfaackcpic.util.DoubleUtil;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

/**
 * 新增媒体保留纪录 ：add After
 *
 * 增加点位
 */
public class SaveMediaKeepingAfter extends BaseTrigger implements ScriptTrigger {

    public ScriptTriggerResult execute(ScriptTriggerParam scriptTriggerParam)
            throws ScriptBusinessException {
        List<DataModel> list = scriptTriggerParam.getDataModelList();
        Object idObj = list.get(0).getAttribute("id");
        Object mediaIdObj = list.get(0).getAttribute("mediaId");
        Object startDateObj = list.get(0).getAttribute("startDate");
        Object endDateObj = list.get(0).getAttribute("endDate");
        Object dimDepartObj = list.get(0).getAttribute("dimDepart");

        String keepId = idObj+"";
        Date startDate = DateUtil.getDate(startDateObj.toString());
        Date endDate = DateUtil.getDate(endDateObj.toString());
        String mediaId = mediaIdObj + "";


        logger.debug("SaveMediaKeepingAfter:keepId:" + keepId + ";begin=" + startDate + ";end:" + endDate + ";mediaId=" + mediaId);
        //查询全部实体，获得对应的belongId：
        QueryResult allBelongs = getAllBelongs();
        //点位BelongId
        long spotDateBelongId = getBelongId(allBelongs, "mediaKeepingSpotDate");

        //自动生成保留点位，
        // 1、纪录不存在，则新增；
        // 2、媒体修改，则更新；
        // 3、时间修改了，则多余的删除；
        JSONArray spotPlanDateList = getSpotDate(keepId);

        if (startDate != null && endDate != null) {
            Calendar startCal = Calendar.getInstance();
            startCal.setTime(startDate);
            Calendar endCal = Calendar.getInstance();
            endCal.setTime(endDate);
            //date_0_2015-01-01
            endCal.add(Calendar.DATE, 1);//最后日期加一天，便于循环
            boolean hasSpot = false;
            while (startCal.before(endCal)) {
                String date = String.format("%tF", startCal.getTime());
                startCal.add(Calendar.DATE, 1);//开始日期加1

                boolean existsData = false;
                for (int j = 0; j < spotPlanDateList.size(); j++) {
                    JSONObject spotDate = spotPlanDateList.getJSONObject(j);
                    Date spotDay = DateUtil.getDate(spotDate.getString("day"));
                    String spot = spotDate.getString("spot");
                    if (date.equals(DateUtil.getDateStr(spotDay))) {
                        existsData = true;
                        //判断媒体是否修改：
                        String spotMediaId = spotDate.getString("mediaId");
                        //媒体修改则更新
                        if (!mediaId.equalsIgnoreCase(spotMediaId)) {
                            spotDate.put("mediaId", mediaId);
                            updateBelongs(spotDate);
                        }
                        //匹配上则删除集合
                        spotPlanDateList.remove(j);
                        break;
                    }
                }
                //不存在，新增
                if (!existsData) {
                    JSONObject spotDate = new JSONObject();
                    spotDate.accumulate("day", date);
                    spotDate.accumulate("spot", "1");
                    spotDate.accumulate("keepingId", keepId);
                    spotDate.accumulate("mediaId", mediaId);
                    spotDate.accumulate("dimDepart", dimDepartObj);
                    createBelongs(spotDateBelongId, spotDate);
                }
            }

            //删除本次修改的点位
            for (int j = 0; j < spotPlanDateList.size(); j++) {
                JSONObject spotDate = spotPlanDateList.getJSONObject(j);
                long spotDateId = spotDate.getLong("id");
                deleteBelongs(spotDateId);
            }
        }


        ScriptTriggerResult scriptTriggerResult = new ScriptTriggerResult();
        scriptTriggerResult.setDataModelList(scriptTriggerParam.getDataModelList());
        return scriptTriggerResult;
    }

    /**
     * 查询排期的点位纪录
     * @return
     */
    private JSONArray getSpotDate(String keepingId) {
        StringBuffer sql = new StringBuffer();
        sql.append("select id,day,spot,mediaId from mediaKeepingSpotDate where keepingId=").append(keepingId);
        return queryResultArray( sql.toString());
    }


}
