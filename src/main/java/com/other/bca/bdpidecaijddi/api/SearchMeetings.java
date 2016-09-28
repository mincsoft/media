package com.other.bca.bdpidecaijddi.api;

import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import com.rkhd.platform.sdk.http.RkhdHttpClient;
import com.rkhd.platform.sdk.http.RkhdHttpData;
import com.rkhd.platform.sdk.log.Logger;
import com.rkhd.platform.sdk.log.LoggerFactory;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Map;
//import com.rkhd.platform.sdk.test.tool.TestCustomizeApiTool;

public class SearchMeetings implements ApiSupport{
	Logger logger = LoggerFactory.getLogger();
	
	@Override
	public String execute(Request request, Long userId, Long tenantId) {
		String meetingManager = getMeetingManager(request, userId, tenantId);
		JSONObject managerObject = JSONObject.fromObject(meetingManager);
		JSONArray managerArray;
		if(managerObject.get("records") != null){
			managerArray = managerObject.getJSONArray("records");
		} else {
			managerArray = new JSONArray();
		}
		
		StringBuffer meetingManagerIdsStringBuffer = new StringBuffer();
		if(managerArray != null){
			for(int i=0; i<managerArray.size() ;i++){
				JSONObject jos = (JSONObject)managerArray.get(i);
				String meetingRoomId = jos.getString("id");
				meetingManagerIdsStringBuffer.append(meetingRoomId);
				if(i != managerArray.size() - 1){
					meetingManagerIdsStringBuffer.append(",");
				}
			}
		}
		
		
		JSONArray meetingyuding = getAllYuding(request,userId,tenantId,meetingManagerIdsStringBuffer.toString());
		
		Map<String,Object> returnMap = new HashMap<String, Object>();
		returnMap.put("meetingRooms", managerArray);
		returnMap.put("meetings", meetingyuding);
		
		
		return JSONObject.fromObject(returnMap).toString();
	}
	
	private String getMeetingManager(Request request, Long userId, Long tenantId){
		String address = request.getParameter("address");
		
		String sql = "select id,name from meetingRoomInfo where Addresses = " + address;
		
		
		try {
			ScriptTriggerParam scriptTriggerParam = new ScriptTriggerParam();
			RkhdHttpClient rkhdHttpClient = new RkhdHttpClient();
			RkhdHttpData rkhdHttpData = new RkhdHttpData();
			rkhdHttpData.setCallString("/data/v1/query");
			rkhdHttpData.setCall_type("POST");
			rkhdHttpData.putFormData("q", sql);
			
			String s = rkhdHttpClient.performRequest(rkhdHttpData);
			return s;
		} catch (IOException e) {
			return e.getMessage();
		}
	}
	
	
	private JSONArray getAllYuding(Request request, Long userId, Long tenantId,String meetingManagerIds){
		int first = 0;
		int size = 30;
		JSONArray allTable = new JSONArray();
		String firstTable = getYuding(request,userId,tenantId,meetingManagerIds,first,size);
		JSONObject firstTableJson = JSONObject.fromObject(firstTable);
		
		JSONArray firstTableJsonArray = null;
		if(firstTableJson.get("records") != null){
			firstTableJsonArray = firstTableJson.getJSONArray("records");
		} else {
			firstTableJsonArray = new JSONArray();
		}
		
		if(firstTableJsonArray != null && firstTableJsonArray.size() > 0){
			allTable.addAll(firstTableJsonArray);
		}
		Integer totalSize = firstTableJson.getInt("totalSize");
		Integer count = firstTableJson.getInt("count");
		first = first + count;
		if(first < totalSize){
			String table = getYuding(request,userId,tenantId,meetingManagerIds,first,size);
			JSONObject tableJson = JSONObject.fromObject(table);
			count = tableJson.getInt("count");
			totalSize = tableJson.getInt("totalSize");
			first = first + count;
			JSONArray tableJsonArray = tableJson.getJSONArray("records");
			if(tableJsonArray != null){
				allTable.addAll(tableJsonArray);
			}
		}
		return allTable;
	}
	
	private String getYuding(Request request, Long userId, Long tenantId,String meetingManagerIds,int first,int size){
		try{
			String begin = request.getParameter("begin");
			String end = request.getParameter("end");
			
			ScriptTriggerParam scriptTriggerParam = new ScriptTriggerParam();
			RkhdHttpClient rkhdHttpClient = new RkhdHttpClient();
			
			RkhdHttpData rkhdHttpData = new RkhdHttpData();
			rkhdHttpData.setCallString("/data/v1/query");
			rkhdHttpData.setCall_type("POST");
			
			
			String sql = "select id,ownerId,beginTime,end_time,meetingRoom from meetingRoomPreRecord where id is not null ";
			StringBuilder sb = new StringBuilder();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
			if(meetingManagerIds != null && !meetingManagerIds.equals("")){
				 sb.append(" and meetingRoom in( ").append(meetingManagerIds).append(") ");
			}
			if(begin != null && !begin.equals("") && end != null && !end.equals("")){
				Long beginLong = sdf.parse(begin.toString()).getTime();
				Long endLong = sdf.parse(end.toString()).getTime();
				
				sb.append(" and ((beginTime <= ").append(beginLong).append(" and end_time >= ").append(beginLong).append(")");
				sb.append(" or (beginTime <= ").append(endLong).append(" and end_time >= ").append(endLong).append(")");
				sb.append(" or (beginTime >= ").append(beginLong).append(" and end_time <= ").append(endLong).append(") )");
			}
			sb.append(" order by beginTime,end_time");
			sb.append(" limit ").append(first).append(",").append(size);
			sql = sql + sb.toString();
			System.out.println(sql);
			rkhdHttpData.putFormData("q", sql);
			
			String s = rkhdHttpClient.performRequest(rkhdHttpData);
			logger.debug(s);
			return s;
		}catch(Exception e){
			return e.getMessage();
		}
	}
	
	public static void main(String[] args) {
//		TestCustomizeApiTool testCustomizeApiTool = new TestCustomizeApiTool();
//		testCustomizeApiTool.test("a", new SearchMeetings());
	}

}
