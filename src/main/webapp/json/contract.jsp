<%@ page import="net.sf.json.JSONObject" %>
<%@ page import="other.aakepi.bdfjfaackcpic.api.media.ContractSearch" %>
<%@ page import="java.util.Enumeration" %>
<%@ page import="other.aakepi.bdfjfaackcpic.util.JSONUtil" %>
<%@ page contentType="text/json;charset=UTF-8" language="java" %>

<%
  response.setContentType("application/json");
  response.setCharacterEncoding("UTF-8");
  response.setHeader("Cache-Control", "no-cache");
  //初始化请求
  com.rkhd.platform.sdk.http.Request rkhdRequest = new com.rkhd.platform.sdk.http.Request();
  Enumeration paramNames = request.getParameterNames();
  while (paramNames.hasMoreElements()) {
    String paramName = (String) paramNames.nextElement();
    String[] paramValues = request.getParameterValues(paramName);
    rkhdRequest.putParameter(paramName,paramValues);
  }


  ContractSearch apiSearch = new ContractSearch();
  //返回的结果
  String json = apiSearch.execute(rkhdRequest,null,null);
  String newJson = JSONUtil.string2Json(json);

%>
{"status":"0","result":"<%= newJson%>"}