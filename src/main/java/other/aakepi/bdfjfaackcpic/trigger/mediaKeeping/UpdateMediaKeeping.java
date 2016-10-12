package other.aakepi.bdfjfaackcpic.trigger.mediaKeeping;

import com.rkhd.platform.sdk.ScriptTrigger;
import com.rkhd.platform.sdk.exception.ScriptBusinessException;
import com.rkhd.platform.sdk.model.DataModel;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import com.rkhd.platform.sdk.param.ScriptTriggerResult;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import other.aakepi.bdfjfaackcpic.trigger.BaseTrigger;
import other.aakepi.bdfjfaackcpic.util.DateUtil;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

/**
 * 更新媒体保留纪录 ：update before
 */
public class UpdateMediaKeeping extends BaseTrigger implements ScriptTrigger {
    @Override
    public ScriptTriggerResult execute(ScriptTriggerParam scriptTriggerParam)
            throws ScriptBusinessException {
        List<DataModel> list = scriptTriggerParam.getDataModelList();
        Object mediaIdObj = list.get(0).getAttribute("mediaId");
        Object startDateObj = list.get(0).getAttribute("startDate");
        Object endDateObj = list.get(0).getAttribute("endDate");

        Date begin = DateUtil.getDate(startDateObj.toString());
        Date end = DateUtil.getDate(endDateObj.toString());
        String mediaId = mediaIdObj + "";

        if (!DateUtil.isBefore(begin,end)) {
            throw new ScriptBusinessException("begin time must before end time ");
        }
        JSONArray recordArray = getAllRecord(begin, end, scriptTriggerParam.getUserId(), -1L, mediaId, 0, 10);

        if (recordArray.size() > 0) {
            StringBuffer msg = new StringBuffer();
            for (int i = 0; i <recordArray.size() ; i++) {
               JSONObject record =recordArray.getJSONObject(i);
                String name = record.getString("name");
                String startDate = record.getString("startDate");
                String endDate = record.getString("endDate");
                msg.append("存在保留纪录：").append(name).append(",保留期间为：从");
                msg.append(startDate).append(" 到 ").append(endDate).append("；");
            }
            throw new ScriptBusinessException(msg.toString());
        }

        //TODO 增加保留点位

        ScriptTriggerResult scriptTriggerResult = new ScriptTriggerResult();
        scriptTriggerResult.setDataModelList(scriptTriggerParam.getDataModelList());
        return scriptTriggerResult;
    }

    /**
     * 获得时间范围内的纪录， 新增，只要查找就应该报错
     * @return
     */
    private JSONArray getAllRecord(Date begin, Date end, Long userId, Long tenantId, String mediaId, int first, int size) {

        String sql = "select id,ownerId,name,startDate,endDate,mediaId from mediaKeeping where id > 0 ";
        StringBuilder sb = new StringBuilder();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        if (mediaId != null && !mediaId.equals("")) {
            sb.append(" and mediaId in( ").append(mediaId).append(") ");
        }
        if (begin != null && end != null) {
            Long beginLong = begin.getTime();
			Long endLong = end.getTime();

            sb.append(" and ((startDate <= ").append(beginLong).append(" and endDate >= ").append(beginLong).append(")");
            sb.append(" or (startDate <= ").append(endLong).append(" and endDate >= ").append(endLong).append(")");
            sb.append(" or (startDate <= ").append(beginLong).append(" and endDate >= ").append(endLong).append(")");
            sb.append(" or (startDate >= ").append(beginLong).append(" and endDate <= ").append(endLong).append(") )");
        }
        sb.append(" order by startDate,endDate");
        sb.append(" limit ").append(first).append(",").append(size);
        sql = sql + sb.toString();

        return queryResultArray(sql.toString());

    }


}
