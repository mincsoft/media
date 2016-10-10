package other.aakepi.bdfjfaackcpic.api.meeting;

import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import com.rkhd.platform.sdk.http.RkhdHttpClient;
import com.rkhd.platform.sdk.http.RkhdHttpData;
import com.rkhd.platform.sdk.log.Logger;
import com.rkhd.platform.sdk.log.LoggerFactory;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import other.aakepi.bdfjfaackcpic.util.DateUtil;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;

public class SaveMeetings implements ApiSupport{
	Logger logger = LoggerFactory.getLogger();
	
	@Override
	public String execute(Request request, Long userId, Long tenantId) {
//		List<DataModel> list = scriptTriggerParam.getDataModelList();
		String param = request.getReader().toString();
		logger.debug(param+"==================");
		JSONObject jsParam = JSONObject.fromObject(param);
		JSONObject recordJson = jsParam.getJSONObject("record");
		Object huiyishiName = recordJson.get("meetingRoom");
		Object beginTime = recordJson.get("beginTime");
		Object end_time = recordJson.get("end_time");
		
		String begin = beginTime.toString();
		String end = end_time.toString();
		String meetingManagerIds = huiyishiName + "";
		
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
		Long beginTimeLong = 0L;
		Long endTimeLong = 0L;
		try {
			if(DateUtil.getBetweenDay(sdf.parse(begin), sdf.parse(end)) > 0){
//			throw new ScriptBusinessException("begin time and end time difference of more than 1 days");
				return "{\"type\":\"error\",\"message\":\"begin time and end time difference of more than 1 days\"}";
			}
			if(!DateUtil.isBefore(sdf.parse(begin), sdf.parse(end))){
//				throw new ScriptBusinessException("begin time must before end time ");
				return "{\"type\":\"error\",\"message\":\"begin time must before end time \"}";
			}
			beginTimeLong = sdf.parse(begin).getTime();
			endTimeLong = sdf.parse(end).getTime();
		} catch (ParseException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		
		
		
		String firstTable = getYuding(beginTimeLong.toString(),endTimeLong.toString(),userId,-1L,meetingManagerIds,0,1);
		
		JSONObject firstTableJson = JSONObject.fromObject(firstTable);
		JSONArray firstTableJsonArray = null;
		if(firstTableJson.get("records") != null){
			firstTableJsonArray = firstTableJson.getJSONArray("records");
		} else {
			firstTableJsonArray = new JSONArray();
		}
		
		if(firstTableJsonArray != null && firstTableJsonArray.size() > 0){
//			throw new ScriptBusinessException("is having meeting");
			return "{\"type\":\"error\",\"message\":\"会议室已经被预定\"}";
		}
		try {
			return save(request,userId);
		} catch (IOException e) {
			logger.debug(e.getMessage());
		}
		return "";
	}

	private String getYuding(String begin,String end, Long userId, Long tenantId,String meetingManagerIds,int first,int size){
		try{
			ScriptTriggerParam scriptTriggerParam = new ScriptTriggerParam();
			RkhdHttpClient rkhdHttpClient = new RkhdHttpClient();
			
			RkhdHttpData rkhdHttpData = new RkhdHttpData();
			rkhdHttpData.setCallString("/data/v1/query");
			rkhdHttpData.setCall_type("POST");
			
			
			String sql = "select id,ownerId,beginTime,end_time,meetingRoom from meetingRoomPreRecord where id > 0 ";
			StringBuilder sb = new StringBuilder();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
			if(meetingManagerIds != null && !meetingManagerIds.equals("")){
				 sb.append(" and meetingRoom in( ").append(meetingManagerIds).append(") ");
			}
			if(begin != null && !begin.equals("") && end != null && !end.equals("")){
//				Long beginLong = sdf.parse(begin.toString()).getTime();
//				Long endLong = sdf.parse(end.toString()).getTime();
				
				sb.append(" and ((beginTime <= '").append(begin).append("' and end_time >= '").append(begin).append("')");
				sb.append(" or (beginTime <= '").append(end).append("' and end_time >= '").append(end).append("')");
				sb.append(" or (beginTime >= '").append(begin).append("' and end_time <= '").append(end).append("') )");
			}
			sb.append(" order by beginTime,end_time");
			sb.append(" limit ").append(first).append(",").append(size);
			sql = sql + sb.toString();
			logger.debug("---------sql" + sql);
			rkhdHttpData.putFormData("q", sql);
			
			String s = rkhdHttpClient.performRequest(rkhdHttpData);
			return s;
		}catch(Exception e){
			return e.getMessage();
		}
	}
	
	private String save(Request request,Long userId) throws IOException{
		ScriptTriggerParam scriptTriggerParam = new ScriptTriggerParam();
		RkhdHttpClient rkhdHttpClient = new RkhdHttpClient();
		
		RkhdHttpData rkhdHttpData = new RkhdHttpData();
		rkhdHttpData.setCallString("/data/v1/objects/customize/create");
		rkhdHttpData.setCall_type("POST");
		rkhdHttpData.setBody(request.getReader().toString());
		
		String s = rkhdHttpClient.performRequest(rkhdHttpData);
		return s;
	}
}
