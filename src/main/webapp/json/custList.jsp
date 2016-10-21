<%@ page import="net.sf.json.JSONObject" %>
<%@ page import="java.util.Enumeration" %>
<%@ page import="other.aakepi.bdfjfaackcpic.api.media.CustSearch" %>
<%@ page contentType="text/json;charset=UTF-8" language="java" %>
<%

  //初始化请求
  com.rkhd.platform.sdk.http.Request rkhdRequest = new com.rkhd.platform.sdk.http.Request();
  Enumeration paramNames = request.getParameterNames();
  while (paramNames.hasMoreElements()) {
    String paramName = (String) paramNames.nextElement();
    String[] paramValues = request.getParameterValues(paramName);
    rkhdRequest.putParameter(paramName,paramValues);
  }


  CustSearch apiSearch = new CustSearch();
  //返回的结果
  String json = apiSearch.execute(rkhdRequest,null,null);

  JSONObject result = new JSONObject();
  result.accumulate("result", json);
  result.accumulate("status", "0");
  out.print(result.toString());
//  out.print("{\"result\":[{\"contract\":\"1001001\",\"disAmount\":\"10000\",\"mediaName\":\"1111\"}],\"status\":\"0\"}");

%>