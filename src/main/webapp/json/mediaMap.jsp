<%@ page import="net.sf.json.JSONObject" %>
<%@ page import="java.util.Enumeration" %>
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


//  DeptSearch apiSearch = new DeptSearch();
//  //返回的结果
//  String json = apiSearch.execute(rkhdRequest,null,null);
  String json = "{\"status\":0,\"statusText\":\"??????\",\"data\":{\"trackData\":[{\"id\":\"16228428\",\"latitude\":\"39.999203\",\"longitude\":\"116.375786\",\"location\":\"奥运村\",\"locationDetail\":\"中科院物理所\",\"day\":\"1476979200000\",\"startTime\":\"1477053707554\"},{\"id\":\"16228429\",\"latitude\":\"39.989203\",\"longitude\":\"116.375786\",\"location\":\"奥运村\",\"locationDetail\":\"中科院遗传所\",\"day\":\"1476979200000\",\"startTime\":\"1477053707554\"}],\"users\":{\"563813\":{\"id\":\"563813\",\"name\":\"余金良\",\"icon\":\"https://xsybucket.s3.cn-north-1.amazonaws.com.cn/228369/2016/09/08/s_b75a2d13-c378-473c-9fe5-14a834b90338.jpg\"}}}}";

//  JSONObject result = new JSONObject();
//  result.accumulate("result", json);
//  result.accumulate("status", "0");
//  out.print(result.toString());
  out.print(json);
//  out.print("{\"result\":[{\"contract\":\"1001001\",\"disAmount\":\"10000\",\"mediaName\":\"1111\"}],\"status\":\"0\"}");

%>